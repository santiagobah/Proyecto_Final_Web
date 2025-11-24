package handlers

import (
	"encoding/json"
	"net/http"
	"pos-go/db"
	"pos-go/models"
)

// GetSalesReport generates sales report
func GetSalesReport(w http.ResponseWriter, r *http.Request) {
	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")
	branchID := r.URL.Query().Get("branch_id")

	// Total sales
	var totalSales float64
	var totalOrders int

	query := `
		SELECT COUNT(*), COALESCE(SUM(total), 0)
		FROM pos_sales
		WHERE status = 'COMPLETED'
	`
	var args []interface{}
	argCount := 1

	if startDate != "" {
		query += ` AND created_at >= $` + string(rune('0'+argCount))
		args = append(args, startDate)
		argCount++
	}
	if endDate != "" {
		query += ` AND created_at <= $` + string(rune('0'+argCount))
		args = append(args, endDate)
		argCount++
	}
	if branchID != "" {
		query += ` AND branch_id = $` + string(rune('0'+argCount))
		args = append(args, branchID)
	}

	db.DB.QueryRow(query, args...).Scan(&totalOrders, &totalSales)

	averageOrder := 0.0
	if totalOrders > 0 {
		averageOrder = totalSales / float64(totalOrders)
	}

	// Top products
	rows, _ := db.DB.Query(`
		SELECT p.prod_id, p.name_pr, SUM(pi.quantity) as qty, SUM(pi.subtotal) as total
		FROM pos_items pi
		JOIN products p ON pi.prod_id = p.prod_id
		JOIN pos_sales ps ON pi.pos_sale_id = ps.pos_sale_id
		WHERE ps.status = 'COMPLETED'
		GROUP BY p.prod_id, p.name_pr
		ORDER BY total DESC
		LIMIT 10
	`)
	defer rows.Close()

	var topProducts []models.ProductSales
	for rows.Next() {
		var ps models.ProductSales
		rows.Scan(&ps.ProductID, &ps.ProductName, &ps.Quantity, &ps.TotalSales)
		topProducts = append(topProducts, ps)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"total_sales":   totalSales,
		"total_orders":  totalOrders,
		"average_order": averageOrder,
		"top_products":  topProducts,
	})
}

// GetInventoryReport generates inventory report
func GetInventoryReport(w http.ResponseWriter, r *http.Request) {
	rows, _ := db.DB.Query(`
		SELECT p.prod_id, p.name_pr, p.sku,
		       SUM(i.quantity) as total_qty,
		       SUM(i.available_quantity) as available_qty,
		       p.cost_price, p.sale_price,
		       SUM(i.quantity * p.cost_price) as inventory_value
		FROM products p
		LEFT JOIN inventory i ON p.prod_id = i.prod_id
		WHERE p.is_active = true
		GROUP BY p.prod_id, p.name_pr, p.sku, p.cost_price, p.sale_price
		ORDER BY inventory_value DESC
	`)
	defer rows.Close()

	type InventoryReportItem struct {
		ProdID         int     `json:"prod_id"`
		ProductName    string  `json:"product_name"`
		SKU            *string `json:"sku"`
		TotalQty       int     `json:"total_quantity"`
		AvailableQty   int     `json:"available_quantity"`
		CostPrice      float64 `json:"cost_price"`
		SalePrice      float64 `json:"sale_price"`
		InventoryValue float64 `json:"inventory_value"`
	}

	var items []InventoryReportItem
	var totalValue float64

	for rows.Next() {
		var item InventoryReportItem
		rows.Scan(&item.ProdID, &item.ProductName, &item.SKU,
			&item.TotalQty, &item.AvailableQty, &item.CostPrice,
			&item.SalePrice, &item.InventoryValue)
		items = append(items, item)
		totalValue += item.InventoryValue
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"items":       items,
		"total_value": totalValue,
	})
}
