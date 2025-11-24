package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func main() {
	// Abrir archivo HTML
	file, err := os.Open("page.html")
	if err != nil {
		log.Fatalf("Error abriendo el archivo: %v", err)
	}
	defer file.Close()

	// Cargar HTML
	doc, err := goquery.NewDocumentFromReader(file)
	if err != nil {
		log.Fatalf("Error parseando HTML: %v", err)
	}

	var output []string

	// Buscar todos los inputs dentro del formulario
	doc.Find("form input").Each(func(i int, s *goquery.Selection) {

		id := s.AttrOr("id", "sin-id")
		placeholder := s.AttrOr("placeholder", "sin-placeholder")
		tipo := s.AttrOr("type", "sin-tipo")

		// buscar label asociado por id
		labelSel := doc.Find(fmt.Sprintf("label[for='%s']", id))
		label := labelSel.Text()
		if strings.TrimSpace(label) == "" {
			label = "sin-label"
		}

		entry := fmt.Sprintf(
			"Campo %d:\n  Label: %s\n  ID: %s\n  Tipo: %s\n  Placeholder: %s\n",
			i+1, label, id, tipo, placeholder,
		)

		output = append(output, entry)
	})

	// Guardar en archivo txt
	err = os.WriteFile("login_data.txt", []byte(strings.Join(output, "\n")), 0644)
	if err != nil {
		log.Fatalf("Error escribiendo archivo: %v", err)
	}

	fmt.Println("Datos guardados en login_data.txt")
}
