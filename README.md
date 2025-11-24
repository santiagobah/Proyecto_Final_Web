# Carrito Loco 

Resumen
- Carrito Loco es una plataforma full‑stack para e‑commerce y POS (punto de venta).
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS.
- Backend POS: Go (servidor HTTP + PostgreSQL).
- Backend auxiliar: Node.js/Express (APIs de apoyo).
- DB: PostgreSQL. Scrapers y utilidades adicionales incluidas (revisar por sensibilidad).

Índice
- Resumen del proyecto
- Estructura del repositorio
- Tecnologías / librerías usadas
- Instalación y ejecución (local + Docker)
- Base de datos (esquema, buenas prácticas, ejemplos SQL)
- Fragmentos de código relevantes (frontend, backend Go, backend Node)
- Seguridad y privacidad
- Tests, migraciones y despliegue
- Contacto / mantenimiento

Estructura principal
- frontend/ — Next.js + App Router (UI, componentes, rutas, API routes locales)
- goo/ — Backend en Go (handlers, server y conexión a Postgre)
- backend/ — API auxiliar en Node/Express (ejemplos de endpoints)
- database/ — schema_complete.sql, seed_complete.sql
- webscarppers/ — scrapers (revisar)
- docker-compose.yml, Dockerfiles, scripts (correr.sh)

Tecnologías y librerías destacadas
- Frontend:
  - Next.js (App Router), React, TypeScript
  - Tailwind CSS
  - lucide-react (íconos)
  - Zod (validación en frontend)
  - Hooks personalizados (p. ej. useCart, useSession)
- Backend Go:
  - net/http, database/sql o pgx
  - PostgreSQL como BD
- Backend Node:
  - Express, pg (node-postgres)
- DB y utilidades:
  - PostgreSQL (recomendado 14+)
  - pg_dump / pg_restore
  - Herramientas de migración recomendadas: golang-migrate, goose, Flyway
- Contenedores y CI:
  - Docker, docker-compose

Instalación (resumen)
1. Clonar repo y situarse en la raíz:
   - git clone <repo>
   - cd web_proyecto_final

2. Base de datos (local con psql o Docker)
   - Crear DB y ejecutar esquemas:
     - psql -U <user> -d carritoloco -f database/schema_complete.sql
     - psql -U <user> -d carritoloco -f database/seed_complete.sql

3. Backend Go (goo/)
   - Configurar .env con DATABASE_URL y puerto
   - cd goo && go run main_complete.go

4. Frontend (frontend/)
   - cd frontend
   - npm install
   - npm run dev (localhost:3000)

5. Backend Node (opcional)
   - cd backend
   - npm install
   - npm run start

Despliegue con Docker (resumen)
- docker-compose.yml incluye servicios para DB, backend Go y frontend.
- Ejemplo para levantar:
  - docker-compose up --build
- Asegurar variables de entorno y volúmenes para persistencia de la BD.

Base de datos — detalle y ejemplos

Modelo conceptual
- users: usuarios (id, email, password_hash, flags/roles, created_at)
- categories: categorías (cat_id, name_cat)
- products: productos (prod_id, name_pr, description, cat_id, price, stock, barcode, image_url, created_at)
- orders: órdenes (order_id, user_id, total, tax, status, created_at)
- order_items: items de orden (id, order_id, prod_id, quantity, sale_price)
- cart_items: carrito temporal ligado a user_id o session_id

Recomendaciones de tipos
- Precio: NUMERIC(12,2) (evitar FLOAT)
- Identificadores: SERIAL o GENERATED AS IDENTITY / BIGSERIAL para escalabilidad
- Fechas: TIMESTAMP WITH TIME ZONE

Constraints y índices esenciales
- UNIQUE(email) en users
- FK products.cat_id -> categories.cat_id
- CHECK(price >= 0), CHECK(stock >= 0)
- Índices:
  - CREATE INDEX idx_products_name ON products USING gin (to_tsvector('spanish', name_pr)); (búsqueda de texto)
  - CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);

Ejemplo de tablas (fragmento)
```sql
-- filepath: database/schema_example.sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE categories (
  cat_id SERIAL PRIMARY KEY,
  name_cat VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
  prod_id SERIAL PRIMARY KEY,
  name_pr VARCHAR(255) NOT NULL,
  description TEXT,
  cat_id INTEGER REFERENCES categories(cat_id) ON DELETE SET NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  barcode VARCHAR(64),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  total NUMERIC(12,2) NOT NULL,
  tax NUMERIC(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  prod_id INTEGER REFERENCES products(prod_id),
  quantity INTEGER NOT NULL,
  sale_price NUMERIC(12,2) NOT NULL
);
```

Operaciones transaccionales (ejemplo)
- Crear orden y descontar stock con control de concurrencia:
```sql
BEGIN;

-- crear orden
INSERT INTO orders (user_id, total, tax, status)
VALUES ($1, $2, $3, 'pending')
RETURNING order_id;

-- insertar items (en app usar returned order_id)
INSERT INTO order_items (order_id, prod_id, quantity, sale_price)
VALUES ($1, $2, $3, $4);

-- descontar stock con chequeo
UPDATE products
SET stock = stock - $1
WHERE prod_id = $2 AND stock >= $1;

-- en app comprobar filas afectadas; si falta stock, hacer ROLLBACK
COMMIT;
```

Backups y restore
- Backup:
  - pg_dump -U <user> -Fc -f backup.carritoloco.dump carritoloco
- Restore:
  - pg_restore -U <user> -d carritoloco backup.carritoloco.dump

Fragmentos de código relevantes

Frontend — detección de tipo de tarjeta (getCardType)
```tsx
// ejemplo del frontend
function getCardType(cardNumber: string): string {
  const digits = cardNumber.replace(/\s/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Desconocida';
}
```

Frontend — previsualización de imagen por URL
```tsx
// ...existing code...
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [imageError, setImageError] = useState<string | null>(null);

// en el JSX del formulario:
<input
  type="url"
  value={formData.image_url}
  onChange={(e) => {
    const url = e.target.value;
    setFormData({...formData, image_url: url});
    setImagePreview(url || null);
    setImageError(null);
  }}
  placeholder="https://ejemplo.com/imagen.jpg"
/>

{imagePreview && (
  <img
    src={imagePreview}
    alt="Previsualización"
    onLoad={() => setImageError(null)}
    onError={() => {
      setImageError('No se pudo cargar la imagen. Verifica la URL.');
      setImagePreview(null);
    }}
    className="w-40 h-40 object-cover rounded-md border"
/>
)}
{imageError && <p className="text-red-500 text-sm">{imageError}</p>}
```

Frontend — iconos (ejemplo Lock)
```tsx
// ejemplo de import al inicio del archivo
import { Lock } from 'lucide-react';

// uso en JSX
<Lock size={16} className="text-green-600" />
```

Backend Go — conexión y handler simplificado (ejemplo)
```go
// filepath: goo/db.go
package main

import (
  "database/sql"
  _ "github.com/lib/pq"
  "log"
  "os"
)

func connectDB() *sql.DB {
  connStr := os.Getenv("DATABASE_URL")
  db, err := sql.Open("postgres", connStr)
  if err != nil { log.Fatal(err) }
  db.SetMaxOpenConns(20)
  return db
}
```

```go
// filepath: goo/handlers/capture_handler.go
package handlers

import (
  "net/http"
  "io/ioutil"
  "log"
)

func CaptureDataHandler(w http.ResponseWriter, r *http.Request) {
  body, _ := ioutil.ReadAll(r.Body)
  log.Println("captured:", string(body))
  // IMPORTANTE: no persistir CVV ni datos sensibles en producción
  w.WriteHeader(http.StatusOK)
}
```

Backend Node (Express) — ejemplo de endpoint de productos
```js
// filepath: backend/src/index.ts
import express from 'express';
import { Pool } from 'pg';

const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/api/productos', async (req, res) => {
  const result = await pool.query('SELECT * FROM products LIMIT 50');
  res.json({ products: result.rows });
});
```

Seguridad y privacidad (puntos críticos)
- No almacenar CVV ni números de tarjeta completos. Esta app tiene un endpoint /api/capture: revisar y eliminar datos sensibles en persistencia.
- Hashear contraseñas con bcrypt o Argon2.
- Cookies: HttpOnly, Secure; usar SameSite apropiado.
- CORS: permitir orígenes conocidos.
- Usar HTTPS en producción.
- Sanitizar entradas y parámetros de SQL (usar prepared statements).

Migraciones y entorno
- Mantener carpeta /migrations con scripts numerados.
- Ejemplo de variables en .env (no subir al repo):
  - DATABASE_URL=postgres://user:pass@host:5432/carritoloco
  - NEXT_PUBLIC_API_URL=http://localhost:3000
  - GOO_PORT=8080

Tests y QA
- Tests unitarios para funciones de validación (Luhn, email).
- Tests de integración para endpoints con una BD de prueba (usar contenedores).
- Tests E2E (opcional): Playwright o Cypress.

Checklist antes de producción
- Eliminar o aislar scrapers y endpoints que guarden datos sensibles.
- Auditar logs y eliminar trazas con información personal.
- Implementar migraciones y backups automáticos.
- Configurar monitoreo y alertas.

  Realizado por: Santiago Bañuelos Hernández
