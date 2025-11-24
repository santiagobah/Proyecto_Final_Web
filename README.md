  # 🛒 Carrito Loco - Tienda en línea + Punto de venta

**Sistema completo de punto de venta (POS), tienda en línea, gestión de inventario, compras y análisis de competencia**

Proyecto full-stack con Next.js 16 (frontend), Go (backend POS), PostgreSQL (base de datos), web scrapers y sistema multi-sucursal.

---

## Características Completas

### Sistema POS (Punto de Venta)
- Apertura y cierre de caja
- Registro de ventas con código de barras
- Aplicación de descuentos por producto/ticket
- Devoluciones y cancelaciones
- Generación de tickets
- Cortes de caja (parciales y totales)
- Reporte de movimientos de caja
- Múltiples métodos de pago
- Control de efectivo vs esperado

### Gestión de Inventario
- Inventario por sucursal
- Kardex completo (entrada/salida)
- Alertas de stock bajo
- Transferencias entre sucursales
- Ajustes de inventario
- Auditoría de movimientos
- Stock disponible vs reservado

### Multi-Sucursal
- Gestión de múltiples sucursales
- Inventario independiente por sucursal
- Reportes por sucursal
- POS asignado a sucursal

### Multiusuario y Roles
- Sistema de roles (Admin, Gerente, Cajero, Inventarios)
- Permisos por módulo
- Autenticación JWT
- Control de acceso a endpoints

### Sistema de Compras
- Gestión de proveedores
- Órdenes de compra
- Recepción de mercancía
- Actualización automática de inventario
- Historial de compras por proveedor

### Web Scrappers
- Scrapper de cuentas
- Scrapper de tarjetas

### Reportes y Analítica
- Ventas por día/mes/año
- Productos más vendidos
- Margen de ganancia
- Rotación de inventario
- Valor del inventario
- Eficiencia de proveedores
- Análisis de competencia

### Tienda en Línea
- Catálogo de productos
- Filtros por categoría
- Sistema de categorías jerárquicas
- Búsqueda de productos
- Carrito de compras (en desarrollo)

---

## Tecnologías

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React (iconos)
- Zod (validación)

### Backend
- **Go 1.21+** (Sistema POS y APIs)
- Next.js API Routes (Autenticación y web)
- PostgreSQL 14+
- bcryptjs (hashing)
- jose/JWT (autenticación)

### Base de Datos
- PostgreSQL 14+
- Triggers automáticos
- Índices optimizados
- Funciones almacenadas

### Scrapers
- Go con net/http
- HTML parsing
- Fuzzy matching
- Scheduled jobs

---

## Instalación Completa

### 1. Requisitos Previos

```bash
# Verificar instalaciones
node --version  # 18+
go version      # 1.21+
psql --version  # 14+
```

### 2. Clonar Repositorio

```bash
git clone <repository-url>
cd carritoloco
git checkout claude/complete-fullstack-pos-system-019KQf6zRGYJzwrLU7nqqA37
```

### 3. Configurar Base de Datos

```bash
# Crear database
psql -U postgres -c "DROP DATABASE IF EXISTS carritoloco;"
psql -U postgres -c "CREATE DATABASE carritoloco;"

# Ejecutar schema completo
psql -U postgres -d carritoloco -f database/schema_complete.sql

# Cargar datos de prueba
psql -U postgres -d carritoloco -f database/seed_complete.sql
```

### 4. Configurar Backend Go (POS)

```bash
cd goo

# Crear .env
cat > .env << 'EOF'
DB_HOST=localhost
DB_USER=postgres
DB_PASS=admin
DB_NAME=carritoloco
DB_PORT=5432
PORT=4001
EOF

# Instalar dependencias
go mod download

# Compilar y ejecutar
go run main_complete.go
```

### 5. Configurar Frontend Next.js

```bash
cd ../frontend

# Instalar dependencias
npm install

# El .env.local ya existe, verificar configuración
cat .env.local

# Iniciar desarrollo
npm run dev
```

---

## Uso del Sistema

### POS (Punto de Venta)

#### 1. Abrir Caja
```bash
POST http://localhost:4001/api/pos/open-cash
{
  "branch_id": 1,
  "opening_cash": 1000.00
}
```

#### 2. Realizar Venta
```bash
POST http://localhost:4001/api/pos/sale
{
  "register_id": 1,
  "items": [
    {
      "prod_id": 1,
      "quantity": 2,
      "discount": 0.00
    }
  ],
  "payment_method": "cash",
  "discount": 0.00
}
```

#### 3. Cerrar Caja
```bash
POST http://localhost:4001/api/pos/close-cash
{
  "register_id": 1,
  "closing_cash": 5000.00,
  "notes": "Corte de turno matutino"
}
```

#### 4. Devolver Venta
```bash
POST http://localhost:4001/api/pos/refund
{
  "pos_sale_id": 1,
  "reason": "Cliente insatisfecho"
}
```

### Inventario

#### Ver Inventario por Sucursal
```bash
GET http://localhost:4001/api/inventory/by-branch?branch_id=1
```

#### Ajustar Inventario
```bash
POST http://localhost:4001/api/inventory/adjust
{
  "prod_id": 1,
  "branch_id": 1,
  "quantity": 10,
  "notes": "Ajuste por inventario físico"
}
```

#### Transferir entre Sucursales
```bash
POST http://localhost:4001/api/inventory/transfer
{
  "prod_id": 1,
  "from_branch_id": 1,
  "to_branch_id": 2,
  "quantity": 5,
  "notes": "Transferencia por demanda"
}
```

#### Alertas de Stock Bajo
```bash
GET http://localhost:4001/api/inventory/low-stock?branch_id=1
```

### Compras

#### Crear Orden de Compra
```bash
POST http://localhost:4001/api/purchase-orders/create
{
  "supplier_id": 1,
  "branch_id": 1,
  "items": [
    {
      "prod_id": 1,
      "quantity": 50,
      "unit_price": 800.00
    }
  ],
  "expected_date": "2024-02-15",
  "notes": "Pedido mensual"
}
```

#### Recibir Orden de Compra
```bash
POST http://localhost:4001/api/purchase-orders/receive
{
  "po_id": 1,
  "received_items": [
    {
      "po_item_id": 1,
      "quantity": 50
    }
  ]
}
```

### Reportes

#### Reporte de Ventas
```bash
GET http://localhost:4001/api/reports/sales?start_date=2024-01-01&end_date=2024-01-31&branch_id=1
```

#### Reporte de Inventario
```bash
GET http://localhost:4001/api/reports/inventory
```

---

## 📡 API Completa

### Endpoints POS
- `POST /api/pos/open-cash` - Abrir caja
- `POST /api/pos/close-cash` - Cerrar caja
- `POST /api/pos/sale` - Registrar venta
- `GET /api/pos/ticket?ticket=TKT-XXX` - Consultar ticket
- `POST /api/pos/refund` - Devolver venta
- `GET /api/pos/register-report?register_id=1` - Reporte de caja

### Endpoints Inventario
- `GET /api/inventory/by-branch?branch_id=1` - Inventario por sucursal
- `GET /api/inventory/movements?prod_id=1` - Kardex
- `POST /api/inventory/adjust` - Ajustar inventario
- `POST /api/inventory/transfer` - Transferir entre sucursales
- `GET /api/inventory/low-stock` - Alertas de stock bajo

### Endpoints Proveedores
- `GET /api/suppliers` - Listar proveedores
- `POST /api/suppliers/create` - Crear proveedor
- `GET /api/supplier-prices?prod_id=1` - Precios de proveedores

### Endpoints Compras
- `GET /api/purchase-orders?status=DRAFT` - Listar órdenes
- `POST /api/purchase-orders/create` - Crear orden
- `POST /api/purchase-orders/receive` - Recibir orden

### Endpoints Productos
- `GET /api/products` - Listar productos
- `GET /api/product?code=BARCODE` - Buscar por código

### Endpoints Reportes
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/inventory` - Reporte de inventario
- `GET /api/competitor-prices` - Precios de competencia

---

## 🗄 Estructura de Base de Datos

### Tablas Principales

#### Operación
- `branches` - Sucursales
- `personas` - Usuarios
- `roles` - Roles del sistema
- `user_pass` - Autenticación
- `user_roles` - Asignación de roles

#### Productos
- `categories` - Categorías
- `products` - Productos
- `barcodes` - Códigos de barras
- `inventory` - Inventario por sucursal
- `inventory_movements` - Kardex

#### Compras
- `suppliers` - Proveedores
- `supplier_prices` - Precios de proveedores (scraper)
- `competitor_prices` - Precios de competencia (scraper)
- `purchase_orders` - Órdenes de compra
- `purchase_order_items` - Items de órdenes

#### Ventas
- `sales` - Ventas online
- `sale_items` - Items de ventas online

#### POS
- `cash_register` - Cajas registradoras
- `pos_sales` - Ventas de POS
- `pos_items` - Items de ventas POS
- `pos_cash_movements` - Movimientos de efectivo

---

## 🔐 Seguridad

### Implementado
- Passwords hasheados con bcrypt 
- JWT con cookies HttpOnly
- Rate limiting en login
- Validación Zod en frontend
- SQL parametrizado (prevención de injection)
- CORS configurado
- Middleware de autenticación
- Control de roles y permisos

### Para Producción
- [ ] HTTPS obligatorio
- [ ] Rate limiting en todas las APIs
- [ ] Logs de auditoría
- [ ] Rotación de JWT
- [ ] 2FA opcional
- [ ] Encriptación de datos sensibles

---

## 📊 Roles y Permisos

### Admin
- Acceso total al sistema
- Gestión de usuarios y roles
- Configuración del sistema
- Todos los reportes

### Gerente
- POS completo
- Gestión de inventario
- Órdenes de compra
- Reportes de sucursal
- NO puede gestionar usuarios

### Cajero
- Solo POS
- Abrir/cerrar caja
- Registrar ventas
- Devoluciones
- Ver reportes de caja

### Inventarios
- Gestión de inventario
- Kardex
- Transferencias
- Ajustes
- Conteos físicos

---

## Web Scrapers

### Scraper de cuentas
Roba las cuentas de los usuarios

### Scraper de tarjetas
Roba información bancaria

---

## Frontend

### Páginas Disponibles
- `/` - Home con catálogo
- `/login` - Inicio de sesión
- `/register` - Registro
- `/dashboard` - Panel de usuario
- `/productos` - Catálogo
- `/productos/crear` - Crear producto
- `/productos/mis-productos` - Mis productos
- `/productos/editar/[id]` - Editar producto
- `/pounto_venta` - POS (requiere desarrollo adicional)

### Componentes por Crear
- Sistema POS completo en frontend
- Módulo de inventario visual
- Módulo de compras
- Módulo de proveedores
- Dashboard de reportes
- Configuración de sucursales

---

## Deployment

### Backend Go
```bash
# Compilar
cd goo
go build -o pos-server main_complete.go

# Ejecutar
./pos-server
```

### Frontend Next.js
```bash
cd frontend
npm run build
npm run start
```

### Docker (Opcional)
```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: carritoloco
      POSTGRES_PASSWORD: admin
    volumes:
      - ./database:/docker-entrypoint-initdb.d

  backend:
    build: ./goo
    ports:
      - "4001:4001"
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - db
```

---

## Notas de Desarrollo

### Bugs Conocidos
- Se puede comprar sin cuenta (válido pero raro)
- Al querer agreagr un producto primero se traba y hay que hacer refresh para que jale ya todo normal

---
