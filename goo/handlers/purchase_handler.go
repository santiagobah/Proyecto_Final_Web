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

// GetAllSuppliers gets all suppliers
func GetAllSuppliers(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(`
		SELECT supplier_id, name, contact_name, email, phone, address,
		       website, tax_id, payment_terms, is_active, rating, created_at
		FROM suppliers
		WHERE is_active = true
		ORDER BY name
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var suppliers []models.Supplier
	for rows.Next() {
		var s models.Supplier
		if err := rows.Scan(
			&s.SupplierID, &s.Name, &s.ContactName, &s.Email, &s.Phone,
			&s.Address, &s.Website, &s.TaxID, &s.PaymentTerms,
			&s.IsActive, &s.Rating, &s.CreatedAt,
		); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		suppliers = append(suppliers, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(suppliers)
}

// CreateSupplier creates a new supplier
func CreateSupplier(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var supplier models.Supplier
	if err := json.NewDecoder(r.Body).Decode(&supplier); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var supplierID int
	err := db.DB.QueryRow(`
		INSERT INTO suppliers (name, contact_name, email, phone, address, website, tax_id, payment_terms)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING supplier_id
	`, supplier.Name, supplier.ContactName, supplier.Email, supplier.Phone,
		supplier.Address, supplier.Website, supplier.TaxID, supplier.PaymentTerms).Scan(&supplierID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"supplier_id": supplierID,
		"message":     "Supplier created successfully",
	})
}

// CreatePurchaseOrder creates a new purchase order
func CreatePurchaseOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		SupplierID   int                           `json:"supplier_id"`
		BranchID     int                           `json:"branch_id"`
		Items        []models.PurchaseOrderItem    `json:"items"`
		ExpectedDate string                        `json:"expected_date"`
		Notes        string                        `json:"notes"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(int)

	// Generate PO number
	poNumber := fmt.Sprintf("PO-%s-%d", time.Now().Format("2006010 2"), time.Now().Unix()%10000)

	// Calculate totals
	var total, tax, grandTotal float64
	for _, item := range req.Items {
		total += float64(item.Quantity) * item.UnitPrice
	}
	tax = total * 0.16 // 16% IVA
	grandTotal = total + tax

	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Create PO
	var poID int
	err = tx.QueryRow(`
		INSERT INTO purchase_orders (
			po_number, supplier_id, branch_id, status, total, tax, grand_total,
			expected_date, notes, created_by
		)
		VALUES ($1, $2, $3, 'DRAFT', $4, $5, $6, $7, $8, $9)
		RETURNING po_id
	`, poNumber, req.SupplierID, req.BranchID, total, tax, grandTotal,
		req.ExpectedDate, req.Notes, userID).Scan(&poID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert items
	for _, item := range req.Items {
		_, err = tx.Exec(`
			INSERT INTO purchase_order_items (po_id, prod_id, quantity, unit_price)
			VALUES ($1, $2, $3, $4)
		`, poID, item.ProdID, item.Quantity, item.UnitPrice)

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
		"success":     true,
		"po_id":       poID,
		"po_number":   poNumber,
		"total":       total,
		"tax":         tax,
		"grand_total": grandTotal,
		"message":     "Purchase order created successfully",
	})
}

// GetPurchaseOrders gets all purchase orders
func GetPurchaseOrders(w http.ResponseWriter, r *http.Request) {
	statusFilter := r.URL.Query().Get("status")

	query := `
		SELECT po.po_id, po.po_number, po.supplier_id, po.branch_id, po.status,
		       po.total, po.tax, po.grand_total, po.expected_date, po.created_at,
		       s.name as supplier_name, b.name as branch_name
		FROM purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.supplier_id
		LEFT JOIN branches b ON po.branch_id = b.branch_id
		WHERE 1=1
	`

	var args []interface{}
	if statusFilter != "" {
		query += ` AND po.status = $1`
		args = append(args, statusFilter)
	}

	query += ` ORDER BY po.created_at DESC`

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type POWithDetails struct {
		models.PurchaseOrder
		SupplierName string  `json:"supplier_name"`
		BranchName   *string `json:"branch_name"`
	}

	var pos []POWithDetails
	for rows.Next() {
		var po POWithDetails
		if err := rows.Scan(
			&po.POID, &po.PONumber, &po.SupplierID, &po.BranchID, &po.Status,
			&po.Total, &po.Tax, &po.GrandTotal, &po.ExpectedDate, &po.CreatedAt,
			&po.SupplierName, &po.BranchName,
		); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		pos = append(pos, po)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pos)
}

// ReceivePurchaseOrder marks a purchase order as received and updates inventory
func ReceivePurchaseOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		POID          int                  `json:"po_id"`
		ReceivedItems []struct {
			POItemID int `json:"po_item_id"`
			Quantity int `json:"quantity"`
		} `json:"received_items"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(int)

	// Get PO info
	var branchID int
	var status string
	err := db.DB.QueryRow(`
		SELECT branch_id, status FROM purchase_orders WHERE po_id = $1
	`, req.POID).Scan(&branchID, &status)

	if err == sql.ErrNoRows {
		http.Error(w, "Purchase order not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if status == "RECEIVED" {
		http.Error(w, "Purchase order already received", http.StatusBadRequest)
		return
	}

	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Process each received item
	for _, item := range req.ReceivedItems {
		// Get product info
		var prodID int
		var unitPrice float64
		err := tx.QueryRow(`
			SELECT prod_id, unit_price
			FROM purchase_order_items
			WHERE po_item_id = $1 AND po_id = $2
		`, item.POItemID, req.POID).Scan(&prodID, &unitPrice)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Update received quantity
		_, err = tx.Exec(`
			UPDATE purchase_order_items
			SET received_quantity = received_quantity + $1
			WHERE po_item_id = $2
		`, item.Quantity, item.POItemID)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Update inventory
		_, err = tx.Exec(`
			INSERT INTO inventory (prod_id, branch_id, quantity)
			VALUES ($1, $2, $3)
			ON CONFLICT (prod_id, branch_id)
			DO UPDATE SET quantity = inventory.quantity + $3
		`, prodID, branchID, item.Quantity)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Record inventory movement
		_, err = tx.Exec(`
			INSERT INTO inventory_movements (
				prod_id, branch_id, movement_type, quantity, cost_price,
				reference_type, reference_id, created_by
			)
			VALUES ($1, $2, 'IN', $3, $4, 'PURCHASE_ORDER', $5, $6)
		`, prodID, branchID, item.Quantity, unitPrice, req.POID, userID)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Mark PO as received
	_, err = tx.Exec(`
		UPDATE purchase_orders
		SET status = 'RECEIVED', received_date = NOW()
		WHERE po_id = $1
	`, req.POID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Purchase order received and inventory updated",
	})
}

// GetSupplierPrices gets supplier prices for products
func GetSupplierPrices(w http.ResponseWriter, r *http.Request) {
	prodIDStr := r.URL.Query().Get("prod_id")

	query := `
		SELECT sp.price_id, sp.prod_id, sp.supplier_id, sp.price, sp.availability,
		       sp.last_scraped, s.name as supplier_name, p.name_pr as product_name
		FROM supplier_prices sp
		JOIN suppliers s ON sp.supplier_id = s.supplier_id
		JOIN products p ON sp.prod_id = p.prod_id
		WHERE sp.is_current = true
	`

	var args []interface{}
	if prodIDStr != "" {
		prodID, err := strconv.Atoi(prodIDStr)
		if err != nil {
			http.Error(w, "Invalid prod_id", http.StatusBadRequest)
			return
		}
		query += ` AND sp.prod_id = $1`
		args = append(args, prodID)
	}

	query += ` ORDER BY sp.price ASC`

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type PriceWithDetails struct {
		models.SupplierPrice
		SupplierName string `json:"supplier_name"`
		ProductName  string `json:"product_name"`
	}

	var prices []PriceWithDetails
	for rows.Next() {
		var p PriceWithDetails
		if err := rows.Scan(
			&p.PriceID, &p.ProdID, &p.SupplierID, &p.Price,
			&p.Availability, &p.LastScraped, &p.SupplierName, &p.ProductName,
		); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		prices = append(prices, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(prices)
}

// GetCompetitorPrices gets competitor prices
func GetCompetitorPrices(w http.ResponseWriter, r *http.Request) {
	prodIDStr := r.URL.Query().Get("prod_id")

	query := `
		SELECT comp_price_id, prod_id, competitor_name, product_name, price,
		       availability, similarity_score, last_scraped
		FROM competitor_prices
		WHERE 1=1
	`

	var args []interface{}
	if prodIDStr != "" {
		prodID, err := strconv.Atoi(prodIDStr)
		if err != nil {
			http.Error(w, "Invalid prod_id", http.StatusBadRequest)
			return
		}
		query += ` AND prod_id = $1`
		args = append(args, prodID)
	}

	query += ` ORDER BY price ASC`

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var prices []models.CompetitorPrice
	for rows.Next() {
		var p models.CompetitorPrice
		if err := rows.Scan(
			&p.CompPriceID, &p.ProdID, &p.CompetitorName, &p.ProductName,
			&p.Price, &p.Availability, &p.SimilarityScore, &p.LastScraped,
		); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		prices = append(prices, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(prices)
}
