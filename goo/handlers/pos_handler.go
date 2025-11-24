package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"pos-go/db"
	"pos-go/models"
	"strconv"
	"time"
)

// OpenCashRegister opens a new cash register session
func OpenCashRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.OpenCashRegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get user ID from context (set by auth middleware)
	userID := r.Context().Value("user_id").(int)

	// Check if there's already an open register for this branch
	var existingID int
	err := db.DB.QueryRow(`
		SELECT register_id FROM cash_register
		WHERE branch_id = $1 AND status = 'OPEN'
	`, req.BranchID).Scan(&existingID)

	if err == nil {
		http.Error(w, "Cash register already open for this branch", http.StatusConflict)
		return
	}

	// Create new register
	var registerID int
	err = db.DB.QueryRow(`
		INSERT INTO cash_register (branch_id, opened_by, opening_cash, status)
		VALUES ($1, $2, $3, 'OPEN')
		RETURNING register_id
	`, req.BranchID, userID, req.OpeningCash).Scan(&registerID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Record opening movement
	_, err = db.DB.Exec(`
		INSERT INTO pos_cash_movements (register_id, movement_type, amount, created_by)
		VALUES ($1, 'OPENING', $2, $3)
	`, registerID, req.OpeningCash, userID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"register_id": registerID,
		"message":     "Cash register opened successfully",
	})
}

// CloseCashRegister closes a cash register session
func CloseCashRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.CloseCashRegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(int)

	// Get expected cash from sales
	var expectedCash float64
	err := db.DB.QueryRow(`
		SELECT COALESCE(SUM(total), 0)
		FROM pos_sales
		WHERE register_id = $1 AND payment_method = 'cash' AND status = 'COMPLETED'
	`, req.RegisterID).Scan(&expectedCash)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Add opening cash
	var openingCash float64
	err = db.DB.QueryRow(`
		SELECT opening_cash FROM cash_register WHERE register_id = $1
	`, req.RegisterID).Scan(&openingCash)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	expectedCash += openingCash
	difference := req.ClosingCash - expectedCash

	// Close register
	_, err = db.DB.Exec(`
		UPDATE cash_register
		SET closed_by = $1, closing_cash = $2, expected_cash = $3, difference = $4,
		    status = 'CLOSED', closed_at = NOW(), notes = $5
		WHERE register_id = $6
	`, userID, req.ClosingCash, expectedCash, difference, req.Notes, req.RegisterID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Record closing movement
	_, err = db.DB.Exec(`
		INSERT INTO pos_cash_movements (register_id, movement_type, amount, notes, created_by)
		VALUES ($1, 'CLOSING', $2, $3, $4)
	`, req.RegisterID, req.ClosingCash, req.Notes, userID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"expected_cash": expectedCash,
		"closing_cash":  req.ClosingCash,
		"difference":    difference,
		"message":       "Cash register closed successfully",
	})
}

// CreatePOSSale creates a new POS sale transaction
func CreatePOSSale(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.POSSaleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(int)

	// Get register info
	var branchID int
	var registerStatus string
	err := db.DB.QueryRow(`
		SELECT branch_id, status FROM cash_register WHERE register_id = $1
	`, req.RegisterID).Scan(&branchID, &registerStatus)

	if err != nil {
		http.Error(w, "Cash register not found", http.StatusNotFound)
		return
	}

	if registerStatus != "OPEN" {
		http.Error(w, "Cash register is not open", http.StatusBadRequest)
		return
	}

	// Start transaction
	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Calculate totals
	var subtotal float64
	var taxRate = 0.16 // 16% IVA

	// Validate products and calculate subtotal
	for _, item := range req.Items {
		var price float64
		var stock int
		var productName string

		err := tx.QueryRow(`
			SELECT p.sale_price, p.name_pr, COALESCE(i.quantity, 0)
			FROM products p
			LEFT JOIN inventory i ON p.prod_id = i.prod_id AND i.branch_id = $1
			WHERE p.prod_id = $2 AND p.is_active = true
		`, branchID, item.ProdID).Scan(&price, &productName, &stock)

		if err != nil {
			http.Error(w, fmt.Sprintf("Product %d not found", item.ProdID), http.StatusBadRequest)
			return
		}

		if stock < item.Quantity {
			http.Error(w, fmt.Sprintf("Insufficient stock for %s", productName), http.StatusBadRequest)
			return
		}

		itemSubtotal := (price * float64(item.Quantity)) - item.Discount
		subtotal += itemSubtotal
	}

	tax := subtotal * taxRate
	total := subtotal + tax - req.Discount

	// Generate ticket number
	ticketNumber := fmt.Sprintf("TKT-%s-%d", time.Now().Format("20060102"), time.Now().Unix()%10000)

	// Create sale
	var saleID int
	err = tx.QueryRow(`
		INSERT INTO pos_sales (
			register_id, branch_id, cashier_id, ticket_number,
			subtotal, discount, tax, total, payment_method, status
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'COMPLETED')
		RETURNING pos_sale_id
	`, req.RegisterID, branchID, userID, ticketNumber,
		subtotal, req.Discount, tax, total, req.PaymentMethod).Scan(&saleID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert sale items and update inventory
	for _, item := range req.Items {
		var price float64
		var productName string

		err := tx.QueryRow(`
			SELECT sale_price, name_pr FROM products WHERE prod_id = $1
		`, item.ProdID).Scan(&price, &productName)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Insert item
		_, err = tx.Exec(`
			INSERT INTO pos_items (pos_sale_id, prod_id, product_name, quantity, unit_price, discount)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, saleID, item.ProdID, productName, item.Quantity, price, item.Discount)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Update inventory
		_, err = tx.Exec(`
			UPDATE inventory
			SET quantity = quantity - $1
			WHERE prod_id = $2 AND branch_id = $3
		`, item.Quantity, item.ProdID, branchID)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Record inventory movement
		_, err = tx.Exec(`
			INSERT INTO inventory_movements (
				prod_id, branch_id, movement_type, quantity,
				reference_type, reference_id, created_by
			)
			VALUES ($1, $2, 'OUT', $3, 'POS_SALE', $4, $5)
		`, item.ProdID, branchID, -item.Quantity, saleID, userID)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Record cash movement if cash payment
	if req.PaymentMethod == "cash" {
		_, err = tx.Exec(`
			INSERT INTO pos_cash_movements (
				register_id, movement_type, amount,
				reference_type, reference_id, created_by
			)
			VALUES ($1, 'SALE', $2, 'POS_SALE', $3, $4)
		`, req.RegisterID, total, saleID, userID)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"pos_sale_id":   saleID,
		"ticket_number": ticketNumber,
		"subtotal":      subtotal,
		"tax":           tax,
		"discount":      req.Discount,
		"total":         total,
		"message":       "Sale completed successfully",
	})
}

// GetPOSSaleByTicket retrieves a POS sale by ticket number
func GetPOSSaleByTicket(w http.ResponseWriter, r *http.Request) {
	ticketNumber := r.URL.Query().Get("ticket")
	if ticketNumber == "" {
		http.Error(w, "Ticket number required", http.StatusBadRequest)
		return
	}

	var sale models.POSSale
	err := db.DB.QueryRow(`
		SELECT pos_sale_id, register_id, branch_id, cashier_id, ticket_number,
		       subtotal, discount, tax, total, payment_method, status, created_at
		FROM pos_sales
		WHERE ticket_number = $1
	`, ticketNumber).Scan(
		&sale.POSSaleID, &sale.RegisterID, &sale.BranchID, &sale.CashierID,
		&sale.TicketNumber, &sale.Subtotal, &sale.Discount, &sale.Tax,
		&sale.Total, &sale.PaymentMethod, &sale.Status, &sale.CreatedAt,
	)

	if err == sql.ErrNoRows {
		http.Error(w, "Sale not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get items
	rows, err := db.DB.Query(`
		SELECT pos_item_id, prod_id, product_name, quantity, unit_price, discount, subtotal
		FROM pos_items
		WHERE pos_sale_id = $1
	`, sale.POSSaleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []models.POSItem
	for rows.Next() {
		var item models.POSItem
		if err := rows.Scan(
			&item.POSItemID, &item.ProdID, &item.ProductName,
			&item.Quantity, &item.UnitPrice, &item.Discount, &item.Subtotal,
		); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"sale":  sale,
		"items": items,
	})
}

// RefundPOSSale refunds a POS sale
func RefundPOSSale(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		POSSaleID int    `json:"pos_sale_id"`
		Reason    string `json:"reason"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(int)

	// Get sale info
	var branchID int
	var total float64
	var status string
	err := db.DB.QueryRow(`
		SELECT branch_id, total, status FROM pos_sales WHERE pos_sale_id = $1
	`, req.POSSaleID).Scan(&branchID, &total, &status)

	if err != nil {
		http.Error(w, "Sale not found", http.StatusNotFound)
		return
	}

	if status == "REFUNDED" {
		http.Error(w, "Sale already refunded", http.StatusBadRequest)
		return
	}

	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Mark sale as refunded
	_, err = tx.Exec(`
		UPDATE pos_sales
		SET status = 'REFUNDED', refund_reason = $1
		WHERE pos_sale_id = $2
	`, req.Reason, req.POSSaleID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return items to inventory
	rows, err := tx.Query(`
		SELECT prod_id, quantity FROM pos_items WHERE pos_sale_id = $1
	`, req.POSSaleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var prodID, quantity int
		if err := rows.Scan(&prodID, &quantity); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Update inventory
		_, err = tx.Exec(`
			UPDATE inventory
			SET quantity = quantity + $1
			WHERE prod_id = $2 AND branch_id = $3
		`, quantity, prodID, branchID)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Record movement
		_, err = tx.Exec(`
			INSERT INTO inventory_movements (
				prod_id, branch_id, movement_type, quantity,
				reference_type, reference_id, created_by, notes
			)
			VALUES ($1, $2, 'IN', $3, 'REFUND', $4, $5, $6)
		`, prodID, branchID, quantity, req.POSSaleID, userID, req.Reason)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	if err = tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Sale refunded successfully",
	})
}

// GetCashRegisterReport gets a cash register report
func GetCashRegisterReport(w http.ResponseWriter, r *http.Request) {
	registerIDStr := r.URL.Query().Get("register_id")
	if registerIDStr == "" {
		http.Error(w, "register_id required", http.StatusBadRequest)
		return
	}

	registerID, err := strconv.Atoi(registerIDStr)
	if err != nil {
		http.Error(w, "Invalid register_id", http.StatusBadRequest)
		return
	}

	// Get register info
	var register models.CashRegister
	err = db.DB.QueryRow(`
		SELECT register_id, branch_id, opened_by, closed_by, opening_cash,
		       closing_cash, expected_cash, difference, status, opened_at, closed_at
		FROM cash_register
		WHERE register_id = $1
	`, registerID).Scan(
		&register.RegisterID, &register.BranchID, &register.OpenedBy,
		&register.ClosedBy, &register.OpeningCash, &register.ClosingCash,
		&register.ExpectedCash, &register.Difference, &register.Status,
		&register.OpenedAt, &register.ClosedAt,
	)

	if err != nil {
		http.Error(w, "Register not found", http.StatusNotFound)
		return
	}

	// Get sales count and total
	var salesCount int
	var salesTotal float64
	err = db.DB.QueryRow(`
		SELECT COUNT(*), COALESCE(SUM(total), 0)
		FROM pos_sales
		WHERE register_id = $1 AND status = 'COMPLETED'
	`, registerID).Scan(&salesCount, &salesTotal)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get movements
	rows, err := db.DB.Query(`
		SELECT movement_id, movement_type, amount, created_at
		FROM pos_cash_movements
		WHERE register_id = $1
		ORDER BY created_at DESC
	`, registerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var movements []models.POSCashMovement
	for rows.Next() {
		var m models.POSCashMovement
		if err := rows.Scan(&m.MovementID, &m.MovementType, &m.Amount, &m.CreatedAt); err != nil {
			continue
		}
		movements = append(movements, m)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"register":     register,
		"sales_count":  salesCount,
		"sales_total":  salesTotal,
		"movements":    movements,
	})
}
