package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"pos-go/db"
	"pos-go/models"
	"strconv"
)

// inventario de una categoría en esepecífico, es ocmo un filtro
func GetInventoryByBranch(w http.ResponseWriter, r *http.Request) {
	branchIDStr := r.URL.Query().Get("branch_id")
	if branchIDStr == "" {
		http.Error(w, "branch_id required", http.StatusBadRequest)
		return
	}

	branchID, err := strconv.Atoi(branchIDStr)
	if err != nil {
		http.Error(w, "Invalid branch_id", http.StatusBadRequest)
		return
	}

	rows, err := db.DB.Query(`
		SELECT i.inventory_id, i.prod_id, i.branch_id, i.quantity,
		       i.reserved_quantity, i.available_quantity, i.location,
		       p.name_pr, p.sku, p.min_stock, p.reorder_point,
		       c.name_cat
		FROM inventory i
		JOIN products p ON i.prod_id = p.prod_id
		LEFT JOIN categories c ON p.cat_id = c.cat_id
		WHERE i.branch_id = $1
		ORDER BY p.name_pr
	`, branchID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type InventoryItem struct {
		models.Inventory
		ProductName  string  `json:"product_name"`
		SKU          *string `json:"sku"`
		CategoryName *string `json:"category_name"`
		MinStock     int     `json:"min_stock"`
		ReorderPoint int     `json:"reorder_point"`
		Status       string  `json:"status"`
	}

	var items []InventoryItem
	for rows.Next() {
		var item InventoryItem
		if err := rows.Scan(
			&item.InventoryID, &item.ProdID, &item.BranchID,
			&item.Quantity, &item.ReservedQuantity, &item.AvailableQuantity,
			&item.Location, &item.ProductName, &item.SKU,
			&item.MinStock, &item.ReorderPoint, &item.CategoryName,
		); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		//status
		if item.AvailableQuantity <= item.MinStock {
			item.Status = "CRITICAL"
		} else if item.AvailableQuantity <= item.ReorderPoint {
			item.Status = "LOW"
		} else {
			item.Status = "OK"
		}

		items = append(items, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// movimientos registrados
func GetInventoryMovements(w http.ResponseWriter, r *http.Request) {
	prodIDStr := r.URL.Query().Get("prod_id")
	branchIDStr := r.URL.Query().Get("branch_id")

	query := `
		SELECT im.movement_id, im.prod_id, im.branch_id, im.movement_type,
		       im.quantity, im.cost_price, im.reference_type, im.reference_id,
		       im.notes, im.created_at,
		       p.name_pr, p.sku
		FROM inventory_movements im
		JOIN products p ON im.prod_id = p.prod_id
		WHERE 1=1
	`

	var args []interface{}
	argCount := 1

	if prodIDStr != "" {
		prodID, err := strconv.Atoi(prodIDStr)
		if err != nil {
			http.Error(w, "Invalid prod_id", http.StatusBadRequest)
			return
		}
		query += ` AND im.prod_id = $` + strconv.Itoa(argCount)
		args = append(args, prodID)
		argCount++
	}

	if branchIDStr != "" {
		branchID, err := strconv.Atoi(branchIDStr)
		if err != nil {
			http.Error(w, "Invalid branch_id", http.StatusBadRequest)
			return
		}
		query += ` AND im.branch_id = $` + strconv.Itoa(argCount)
		args = append(args, branchID)
		argCount++
	}

	query += ` ORDER BY im.created_at DESC LIMIT 1000`

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type MovementWithProduct struct {
		models.InventoryMovement
		ProductName string  `json:"product_name"`
		SKU         *string `json:"sku"`
	}

	var movements []MovementWithProduct
	for rows.Next() {
		var m MovementWithProduct
		if err := rows.Scan(
			&m.MovementID, &m.ProdID, &m.BranchID, &m.MovementType,
			&m.Quantity, &m.CostPrice, &m.ReferenceType, &m.ReferenceID,
			&m.Notes, &m.CreatedAt, &m.ProductName, &m.SKU,
		); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		movements = append(movements, m)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(movements)
}

// inventario
func AdjustInventory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ProdID    int     `json:"prod_id"`
		BranchID  int     `json:"branch_id"`
		Quantity  int     `json:"quantity"` // negativo/positivo
		CostPrice float64 `json:"cost_price,omitempty"`
		Notes     string  `json:"notes"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(int)

	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// actualizar inventario
	_, err = tx.Exec(`
		INSERT INTO inventory (prod_id, branch_id, quantity)
		VALUES ($1, $2, $3)
		ON CONFLICT (prod_id, branch_id)
		DO UPDATE SET quantity = inventory.quantity + $3
	`, req.ProdID, req.BranchID, req.Quantity)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	movementType := "IN"
	if req.Quantity < 0 {
		movementType = "OUT"
	}

	_, err = tx.Exec(`
		INSERT INTO inventory_movements (
			prod_id, branch_id, movement_type, quantity,
			cost_price, reference_type, notes, created_by
		)
		VALUES ($1, $2, $3, $4, $5, 'ADJUSTMENT', $6, $7)
	`, req.ProdID, req.BranchID, movementType, req.Quantity, req.CostPrice, req.Notes, userID)

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
		"message": "Inventory adjusted successfully",
	})
}

// transfers entre ramas
func TransferInventory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ProdID       int    `json:"prod_id"`
		FromBranchID int    `json:"from_branch_id"`
		ToBranchID   int    `json:"to_branch_id"`
		Quantity     int    `json:"quantity"`
		Notes        string `json:"notes"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(int)

	// checar si si hay disponible
	var availableQty int
	err := db.DB.QueryRow(`
		SELECT available_quantity FROM inventory
		WHERE prod_id = $1 AND branch_id = $2
	`, req.ProdID, req.FromBranchID).Scan(&availableQty)

	if err == sql.ErrNoRows {
		http.Error(w, "Product not found in source branch", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if availableQty < req.Quantity {
		http.Error(w, "Insufficient stock in source branch", http.StatusBadRequest)
		return
	}

	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// restar al inventario
	_, err = tx.Exec(`
		UPDATE inventory
		SET quantity = quantity - $1
		WHERE prod_id = $2 AND branch_id = $3
	`, req.Quantity, req.ProdID, req.FromBranchID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// increase a donde va
	_, err = tx.Exec(`
		INSERT INTO inventory (prod_id, branch_id, quantity)
		VALUES ($1, $2, $3)
		ON CONFLICT (prod_id, branch_id)
		DO UPDATE SET quantity = inventory.quantity + $3
	`, req.ProdID, req.ToBranchID, req.Quantity)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// registrar lo que sucede
	_, err = tx.Exec(`
		INSERT INTO inventory_movements (
			prod_id, branch_id, movement_type, quantity,
			reference_type, notes, created_by
		)
		VALUES ($1, $2, 'OUT', $3, 'TRANSFER', $4, $5)
	`, req.ProdID, req.FromBranchID, -req.Quantity, req.Notes, userID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(`
		INSERT INTO inventory_movements (
			prod_id, branch_id, movement_type, quantity,
			reference_type, notes, created_by
		)
		VALUES ($1, $2, 'IN', $3, 'TRANSFER', $4, $5)
	`, req.ProdID, req.ToBranchID, req.Quantity, req.Notes, userID)

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
		"message": "Inventory transferred successfully",
	})
}

// productos con poco stock
func GetLowStockAlerts(w http.ResponseWriter, r *http.Request) {
	branchIDStr := r.URL.Query().Get("branch_id")

	query := `
		SELECT i.inventory_id, i.prod_id, i.branch_id, i.quantity,
		       i.available_quantity, p.name_pr, p.sku, p.min_stock,
		       p.reorder_point, b.name as branch_name
		FROM inventory i
		JOIN products p ON i.prod_id = p.prod_id
		JOIN branches b ON i.branch_id = b.branch_id
		WHERE i.available_quantity <= p.reorder_point
		  AND p.is_active = true
	`

	var args []interface{}
	if branchIDStr != "" {
		branchID, err := strconv.Atoi(branchIDStr)
		if err != nil {
			http.Error(w, "Invalid branch_id", http.StatusBadRequest)
			return
		}
		query += ` AND i.branch_id = $1`
		args = append(args, branchID)
	}

	query += ` ORDER BY i.available_quantity ASC`

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type LowStockAlert struct {
		InventoryID       int     `json:"inventory_id"`
		ProdID            int     `json:"prod_id"`
		BranchID          int     `json:"branch_id"`
		Quantity          int     `json:"quantity"`
		AvailableQuantity int     `json:"available_quantity"`
		ProductName       string  `json:"product_name"`
		SKU               *string `json:"sku"`
		MinStock          int     `json:"min_stock"`
		ReorderPoint      int     `json:"reorder_point"`
		BranchName        string  `json:"branch_name"`
		AlertLevel        string  `json:"alert_level"`
	}

	var alerts []LowStockAlert
	for rows.Next() {
		var alert LowStockAlert
		if err := rows.Scan(
			&alert.InventoryID, &alert.ProdID, &alert.BranchID,
			&alert.Quantity, &alert.AvailableQuantity, &alert.ProductName,
			&alert.SKU, &alert.MinStock, &alert.ReorderPoint, &alert.BranchName,
		); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if alert.AvailableQuantity <= alert.MinStock {
			alert.AlertLevel = "CRITICAL"
		} else {
			alert.AlertLevel = "WARNING"
		}

		alerts = append(alerts, alert)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(alerts)
}
