package handlers

import (
	"encoding/json"
	"net/http"

	"pos-go/db"
)

type SaleItem struct {
	ProdID  int     `json:"prod_id"`
	Qty     int     `json:"qty"`
	Price   float64 `json:"price"`
	Barcode string  `json:"barcode"`
}

type Sale struct {
	Cashier       string     `json:"cashier"`
	PaymentMethod string     `json:"payment_method"`
	Items         []SaleItem `json:"items"`
}

func CreateSale(w http.ResponseWriter, r *http.Request) {
	var sale Sale
	json.NewDecoder(r.Body).Decode(&sale)

	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	var total float64
	for _, item := range sale.Items {
		total += item.Price * float64(item.Qty)
	}

	var saleID int
	err = tx.QueryRow(`INSERT INTO sales (cashier, total, payment_method)
        VALUES ($1, $2, $3) RETURNING sale_id`,
		sale.Cashier, total, sale.PaymentMethod).Scan(&saleID)
	if err != nil {
		tx.Rollback()
		http.Error(w, err.Error(), 500)
		return
	}

	for _, item := range sale.Items {
		_, err := tx.Exec(`
            INSERT INTO sale_items (sale_id, prod_id, barcode, qty, price)
            VALUES ($1, $2, $3, $4, $5)
        `, saleID, item.ProdID, item.Barcode, item.Qty, item.Price)
		if err != nil {
			tx.Rollback()
			http.Error(w, err.Error(), 500)
			return
		}
		_, err = tx.Exec(`UPDATE inventory SET stock = stock - $1 WHERE prod_id = $2`, item.Qty, item.ProdID)
		if err != nil {
			tx.Rollback()
			http.Error(w, err.Error(), 500)
			return
		}
	}

	tx.Commit()
	json.NewEncoder(w).Encode(map[string]any{"sale_id": saleID, "total": total})
}
