package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"pos-go/db"
	"pos-go/handlers"

	"github.com/joho/godotenv"
)

func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
}

// agrega CORS a los handlers
func corsHandler(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		handler(w, r)
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Printf("no .env: %v", err)
	}

	if err := db.Connect(); err != nil {
		log.Fatalf("error para conectar a postgres!: %v", err)
	}
	fmt.Println("postgres listo")

	//robo:
	http.HandleFunc("/api/capture", handlers.CaptureDataHandler)

	// productos
	http.HandleFunc("/api/products", corsHandler(handlers.GetAllProducts))
	http.HandleFunc("/api/product", corsHandler(handlers.GetProductByBarcode))

	// endpoints
	http.HandleFunc("/api/pos/open-cash", corsHandler(handlers.OpenCashRegister))
	http.HandleFunc("/api/pos/close-cash", corsHandler(handlers.CloseCashRegister))
	http.HandleFunc("/api/pos/sale", corsHandler(handlers.CreatePOSSale))
	http.HandleFunc("/api/pos/ticket", corsHandler(handlers.GetPOSSaleByTicket))
	http.HandleFunc("/api/pos/refund", corsHandler(handlers.RefundPOSSale))
	http.HandleFunc("/api/pos/register-report", corsHandler(handlers.GetCashRegisterReport))

	// inventario
	http.HandleFunc("/api/inventory/by-branch", corsHandler(handlers.GetInventoryByBranch))
	http.HandleFunc("/api/inventory/movements", corsHandler(handlers.GetInventoryMovements))
	http.HandleFunc("/api/inventory/adjust", corsHandler(handlers.AdjustInventory))
	http.HandleFunc("/api/inventory/transfer", corsHandler(handlers.TransferInventory))
	http.HandleFunc("/api/inventory/low-stock", corsHandler(handlers.GetLowStockAlerts))

	// compras y más
	http.HandleFunc("/api/suppliers", corsHandler(handlers.GetAllSuppliers))
	http.HandleFunc("/api/suppliers/create", corsHandler(handlers.CreateSupplier))
	http.HandleFunc("/api/purchase-orders", corsHandler(handlers.GetPurchaseOrders))
	http.HandleFunc("/api/purchase-orders/create", corsHandler(handlers.CreatePurchaseOrder))
	http.HandleFunc("/api/purchase-orders/receive", corsHandler(handlers.ReceivePurchaseOrder))
	http.HandleFunc("/api/supplier-prices", corsHandler(handlers.GetSupplierPrices))
	http.HandleFunc("/api/competitor-prices", corsHandler(handlers.GetCompetitorPrices))

	// reportes
	http.HandleFunc("/api/reports/sales", corsHandler(handlers.GetSalesReport))
	http.HandleFunc("/api/reports/inventory", corsHandler(handlers.GetInventoryReport))

	// ventas
	http.HandleFunc("/api/sales", corsHandler(handlers.CreateSale))

	port := os.Getenv("PORT")
	if port == "" {
		port = "4001"
	}
	fmt.Printf(" back en http://localhost:%s\n", port)
	fmt.Println("endpoints:")
	fmt.Println("   POS: /api/pos/*")
	fmt.Println("   Inventory: /api/inventory/*")
	fmt.Println("   Suppliers: /api/suppliers/*")
	fmt.Println("   Purchase Orders: /api/purchase-orders/*")
	fmt.Println("   Reports: /api/reports/*")
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
