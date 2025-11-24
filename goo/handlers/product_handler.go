package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"pos-go/db"
	"pos-go/models"
)

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// ProductWithBarcode struct for responses that include barcode
type ProductWithBarcode struct {
	models.Product
	Barcode *string `json:"barcode,omitempty"`
}

func GetAllProducts(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	rows, err := db.DB.Query(`
        SELECT
            p.prod_id, p.name_pr, p.description, p.cat_id, p.person_id,
            p.sku, p.cost_price, p.sale_price, p.min_price, p.tax_rate,
            p.image_url, p.is_active, p.is_service, p.min_stock, p.max_stock,
            p.reorder_point, p.created_at, p.updated_at, b.barcode
        FROM products p
        LEFT JOIN barcodes b ON p.prod_id = b.prod_id AND b.is_primary = TRUE
        WHERE p.is_active = TRUE
        ORDER BY p.name_pr
    `)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var products []ProductWithBarcode
	for rows.Next() {
		var p ProductWithBarcode
		err := rows.Scan(
			&p.ProdID, &p.NamePr, &p.Description, &p.CatID, &p.PersonID,
			&p.SKU, &p.CostPrice, &p.SalePrice, &p.MinPrice, &p.TaxRate,
			&p.ImageURL, &p.IsActive, &p.IsService, &p.MinStock, &p.MaxStock,
			&p.ReorderPoint, &p.CreatedAt, &p.UpdatedAt, &p.Barcode,
		)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		products = append(products, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func GetProductByBarcode(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	barcode := r.URL.Query().Get("code")
	if barcode == "" {
		http.Error(w, "Código de barras requerido", 400)
		return
	}

	var p ProductWithBarcode
	err := db.DB.QueryRow(`
        SELECT
            p.prod_id, p.name_pr, p.description, p.cat_id, p.person_id,
            p.sku, p.cost_price, p.sale_price, p.min_price, p.tax_rate,
            p.image_url, p.is_active, p.is_service, p.min_stock, p.max_stock,
            p.reorder_point, p.created_at, p.updated_at, b.barcode
        FROM products p
        JOIN barcodes b ON p.prod_id = b.prod_id
        WHERE b.barcode = $1 AND p.is_active = TRUE
    `, barcode).Scan(
		&p.ProdID, &p.NamePr, &p.Description, &p.CatID, &p.PersonID,
		&p.SKU, &p.CostPrice, &p.SalePrice, &p.MinPrice, &p.TaxRate,
		&p.ImageURL, &p.IsActive, &p.IsService, &p.MinStock, &p.MaxStock,
		&p.ReorderPoint, &p.CreatedAt, &p.UpdatedAt, &p.Barcode,
	)
	if err != nil {
		http.Error(w, fmt.Sprintf("Producto no encontrado: %s", barcode), 404)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}
