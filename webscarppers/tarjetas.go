package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func main() {
	// Abrir archivo HTML local
	file, err := os.Open("page.html")
	if err != nil {
		log.Fatalf("No se pudo abrir el archivo: %v", err)
	}
	defer file.Close()

	// Cargar HTML en goquery
	doc, err := goquery.NewDocumentFromReader(file)
	if err != nil {
		log.Fatalf("Error al parsear HTML: %v", err)
	}

	// Campos a extraer
	campos := []string{
		"address",
		"city",
		"state",
		"zipCode",
		"cardNumber",
		"cardName",
		"expiryDate",
		"cvv",
	}

	var resultado []string

	// Buscar inputs por atributo name
	for _, campo := range campos {
		valor := doc.Find(fmt.Sprintf("input[name='%s']", campo)).AttrOr("placeholder", "NO ENCONTRADO")
		resultado = append(resultado, fmt.Sprintf("%s: %s", campo, valor))
	}

	// Guardar en archivo .txt
	err = os.WriteFile("datos.txt", []byte(strings.Join(resultado, "\n")), 0644)
	if err != nil {
		log.Fatalf("No se pudo escribir el archivo: %v", err)
	}

	fmt.Println("Datos guardados en datos.txt")
}
