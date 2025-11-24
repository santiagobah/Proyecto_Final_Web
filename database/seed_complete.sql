INSERT INTO branches (name, address, city, state, phone, email) VALUES
('Sucursal Centro', 'Av. Principal 123', 'CDMX', 'Ciudad de México', '5551234567', 'centro@carritoloco.com'),
('Sucursal Norte', 'Blvd. Norte 456', 'Monterrey', 'Nuevo León', '8181234567', 'norte@carritoloco.com'),
('Sucursal Sur', 'Calle Sur 789', 'Guadalajara', 'Jalisco', '3331234567', 'sur@carritoloco.com');

INSERT INTO personas (name_p, ap_pat, ap_mat, branch_id, sell, buy) VALUES
('Admin', 'Sistema', 'Principal', 1, TRUE, TRUE),
('Juan', 'Pérez', 'López', 1, TRUE, TRUE),
('María', 'Gómez', 'Ruiz', 2, TRUE, TRUE),
('Carlos', 'Hernández', 'Torres', 3, TRUE, FALSE),
('Ana', 'Martínez', 'Flores', 1, FALSE, TRUE),
('Luis', 'Rodríguez', 'Sánchez', 2, TRUE, TRUE);

INSERT INTO roles (role_name, description, permissions) VALUES
('admin', 'Administrador del sistema', '{"all": true}'),
('manager', 'Gerente de sucursal', '{"pos": true, "inventory": true, "reports": true, "users": false}'),
('cashier', 'Cajero de punto de venta', '{"pos": true}'),
('inventory', 'Encargado de inventario', '{"inventory": true, "products": true}');

INSERT INTO user_pass (person_id, email, password, is_admin) VALUES
(1, 'admin@carrito.com', '$2a$10$rM8/8FKKvVZ6p7H5Y0QYXuJBxhYXGlN0x3qTfPYLgpQJXKxVvT7H6', TRUE),
(2, 'manager@carrito.com', '$2a$10$rM8/8FKKvVZ6p7H5Y0QYXuJBxhYXGlN0x3qTfPYLgpQJXKxVvT7H6', FALSE),
(3, 'cashier1@carrito.com', '$2a$10$rM8/8FKKvVZ6p7H5Y0QYXuJBxhYXGlN0x3qTfPYLgpQJXKxVvT7H6', FALSE),
(4, 'cashier2@carrito.com', '$2a$10$rM8/8FKKvVZ6p7H5Y0QYXuJBxhYXGlN0x3qTfPYLgpQJXKxVvT7H6', FALSE),
(5, 'inv1@carrito.com', '$2a$10$rM8/8FKKvVZ6p7H5Y0QYXuJBxhYXGlN0x3qTfPYLgpQJXKxVvT7H6', FALSE),
(6, 'inv2@carrito.com', '$2a$10$rM8/8FKKvVZ6p7H5Y0QYXuJBxhYXGlN0x3qTfPYLgpQJXKxVvT7H6', FALSE);


INSERT INTO user_roles (person_id, role_id) VALUES
(1, 1), 
(2, 2), 
(3, 3), 
(4, 4), 
(5, 3),
(6, 2); 

INSERT INTO suppliers (name, contact_name, email, phone, address, website, tax_id, payment_terms, rating) VALUES
('Proveedor Tech SA', 'Roberto Gómez', 'ventas@proveedortech.com', '5554567890', 'Industrial 100', 'www.proveedortech.com', 'RFC123456', '30 días', 4.5),
('Electrónica Global', 'Ana Ruiz', 'info@electroglobal.com', '8182345678', 'Tech Park 200', 'www.electroglobal.com', 'RFC234567', '60 días', 4.8),
('Distribuidora Nacional', 'Pedro López', 'contacto@distnacional.com', '3334567890', 'Comercial 300', 'www.distnacional.com', 'RFC345678', '45 días', 4.2);


INSERT INTO categories (name_cat, description) VALUES
('Electrónica', 'Dispositivos electrónicos y gadgets'),
('Computadoras', 'Computadoras y laptops'),
('Accesorios', 'Accesorios para dispositivos'),
('Fotografía', 'Cámaras y equipos fotográficos'),
('Ropa', 'Prendas de vestir'),
('Hogar', 'Artículos para el hogar'),
('Deportes', 'Artículos deportivos'),
('Salud', 'Productos de salud'),
('Alimentos', 'Alimentos y bebidas'),
('Oficina', 'Artículos de oficina');


INSERT INTO products (name_pr, description, cat_id, person_id, sku, cost_price, sale_price, min_price, min_stock, reorder_point, image_url) VALUES
('Laptop Dell XPS 15', 'Laptop profesional Core i7', 2, 2, 'LAP-DELL-001', 800.00, 1299.99, 1100.00, 5, 3, 'https://unimarq.mx/media/catalog/product/1/c/1c64a64367432b99c85d581def4608a82da0bfa5_1.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=762&width=762&canvas=762:762'),
('iPhone 15 Pro', 'Smartphone Apple última generación', 1, 2, 'PHONE-APPL-001', 700.00, 999.99, 900.00, 10, 5, 'https://cell-shop.com.mx/wp-content/uploads/2023/10/iphone-15-pro-finish-select-202309-6-1inch-blacktitanium.jpg'),
('Samsung Galaxy S24', 'Smartphone Samsung más nuevo', 1, 2, 'PHONE-SAMS-001', 600.00, 899.99, 800.00, 10, 5, 'https://http2.mlstatic.com/D_NQ_NP_670522-MLA91648143100_092025-O.webp'),
('Canon EOS R6', 'Cámara mirrorless profesional', 4, 2, 'CAM-CANON-001', 1500.00, 2499.99, 2200.00, 3, 2, 'https://m.media-amazon.com/images/I/81HwzslD2oL._AC_UF894,1000_QL80_.jpg'),
('MacBook Pro M3', 'Laptop Apple con chip M3', 2, 2, 'LAP-APPL-001', 1500.00, 1999.99, 1800.00, 5, 3, 'https://media.gq.com.mx/photos/653aec2588a77a138661f776/16:9/w_2560%2Cc_limit/MacBook_Pro.jpg'),
('Mouse Logitech MX', 'Mouse inalámbrico profesional', 3, 2, 'ACC-LOGI-001', 50.00, 99.99, 80.00, 20, 10, 'https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/m280/2024-update/gallery/m280-wireless-mouse-top-view-red-gallery-01.png'),
('Teclado Mecánico RGB', 'Teclado gaming mecánico', 3, 2, 'ACC-KEY-001', 80.00, 149.99, 120.00, 15, 8, 'https://coregaming.com.mx/assets/uploads/sw_00_1930.jpg?1672693518'),
('Monitor LG 27" 4K', 'Monitor profesional 4K', 2, 2, 'MON-LG-001', 250.00, 449.99, 380.00, 8, 4, 'https://www.lg.com/content/dam/channel/wcms/mx/images/monitores/24mr400-b_awmq_enms_mx_c/gallery/large01.jpg'),
('SSD Samsung 1TB', 'Disco sólido NVMe', 2, 2, 'STO-SAMS-001', 60.00, 119.99, 95.00, 30, 15, 'https://m.media-amazon.com/images/I/61zQxmIq3LL.jpg'),
('Webcam Logitech 4K', 'Cámara web 4K', 3, 2, 'ACC-LOGI-002', 100.00, 179.99, 150.00, 12, 6, 'https://samaraonline.com.mx/web/image/product.template/541/image_1024?unique=d2fc6d4');

--no se porque no se guardan sin hacerles update:

-- 1. Laptop Dell
UPDATE products 
SET image_url = 'https://unimarq.mx/media/catalog/product/1/c/1c64a64367432b99c85d581def4608a82da0bfa5_1.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=762&width=762&canvas=762:762' 
WHERE sku = 'LAP-DELL-001';

-- 2. iPhone 15
UPDATE products 
SET image_url = 'https://cell-shop.com.mx/wp-content/uploads/2023/10/iphone-15-pro-finish-select-202309-6-1inch-blacktitanium.jpg' 
WHERE sku = 'PHONE-APPL-001';

-- 3. Samsung Galaxy
UPDATE products 
SET image_url = 'https://http2.mlstatic.com/D_NQ_NP_670522-MLA91648143100_092025-O.webp' 
WHERE sku = 'PHONE-SAMS-001';

-- 4. Cámara Canon
UPDATE products 
SET image_url = 'https://m.media-amazon.com/images/I/81HwzslD2oL._AC_UF894,1000_QL80_.jpg' 
WHERE sku = 'CAM-CANON-001';

-- 5. MacBook Pro
UPDATE products 
SET image_url = 'https://media.gq.com.mx/photos/653aec2588a77a138661f776/16:9/w_2560%2Cc_limit/MacBook_Pro.jpg' 
WHERE sku = 'LAP-APPL-001';

-- 6. Mouse Logitech
UPDATE products 
SET image_url = 'https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/m280/2024-update/gallery/m280-wireless-mouse-top-view-red-gallery-01.png' 
WHERE sku = 'ACC-LOGI-001';

-- 7. Teclado Mecánico
UPDATE products 
SET image_url = 'https://coregaming.com.mx/assets/uploads/sw_00_1930.jpg?1672693518' 
WHERE sku = 'ACC-KEY-001';

-- 8. Monitor LG
UPDATE products 
SET image_url = 'https://www.lg.com/content/dam/channel/wcms/mx/images/monitores/24mr400-b_awmq_enms_mx_c/gallery/large01.jpg' 
WHERE sku = 'MON-LG-001';

-- 9. SSD Samsung
UPDATE products 
SET image_url = 'https://m.media-amazon.com/images/I/61zQxmIq3LL.jpg' 
WHERE sku = 'STO-SAMS-001';

-- 10. Webcam Logitech
UPDATE products 
SET image_url = 'https://samaraonline.com.mx/web/image/product.template/541/image_1024?unique=d2fc6d4' 
WHERE sku = 'ACC-LOGI-002';



INSERT INTO barcodes (prod_id, barcode, is_primary) VALUES
(1, '7501234560001', TRUE),
(2, '7501234560002', TRUE),
(3, '7501234560003', TRUE),
(4, '7501234560004', TRUE),
(5, '7501234560005', TRUE),
(6, '7501234560006', TRUE),
(7, '7501234560007', TRUE),
(8, '7501234560008', TRUE),
(9, '7501234560009', TRUE),
(10, '7501234560010', TRUE);


INSERT INTO inventory (prod_id, branch_id, quantity, location) VALUES

(1, 1, 10, 'A1'), (2, 1, 25, 'A2'), (3, 1, 20, 'A3'),
(4, 1, 5, 'B1'), (5, 1, 8, 'B2'), (6, 1, 40, 'C1'),
(7, 1, 30, 'C2'), (8, 1, 12, 'D1'), (9, 1, 50, 'D2'),
(10, 1, 15, 'E1'),

(1, 2, 8, 'A1'), (2, 2, 20, 'A2'), (3, 2, 15, 'A3'),
(6, 2, 35, 'B1'), (7, 2, 25, 'B2'), (9, 2, 45, 'C1'),

(1, 3, 6, 'A1'), (2, 3, 18, 'A2'), (5, 3, 10, 'B1'),
(8, 3, 10, 'C1'), (9, 3, 40, 'C2'), (10, 3, 12, 'D1');

INSERT INTO supplier_prices (prod_id, supplier_id, price, availability) VALUES
(1, 1, 780.00, 'In Stock'),
(1, 2, 795.00, 'In Stock'),
(2, 1, 685.00, 'In Stock'),
(3, 2, 590.00, 'In Stock'),
(4, 3, 1480.00, 'Low Stock'),
(5, 1, 1490.00, 'In Stock'),
(6, 2, 48.00, 'In Stock'),
(7, 2, 78.00, 'In Stock'),
(8, 1, 245.00, 'In Stock'),
(9, 2, 58.00, 'In Stock');

INSERT INTO competitor_prices (prod_id, competitor_name, product_name, price, availability, similarity_score) VALUES
(1, 'Amazon México', 'Dell XPS 15 i7', 1350.00, 'In Stock', 0.95),
(1, 'Mercado Libre', 'Laptop Dell XPS 15', 1280.00, 'Used - Good', 0.90),
(2, 'Best Buy', 'iPhone 15 Pro 256GB', 1050.00, 'In Stock', 0.98),
(3, 'Amazon', 'Samsung Galaxy S24 Ultra', 920.00, 'In Stock', 0.92),
(5, 'Apple Store', 'MacBook Pro 14" M3', 2099.00, 'In Stock', 1.00);

INSERT INTO purchase_orders (po_number, supplier_id, branch_id, status, total, tax, grand_total, expected_date, created_by) VALUES
('PO-2024-001', 1, 1, 'RECEIVED', 5000.00, 800.00, 5800.00, '2024-01-15', 1),
('PO-2024-002', 2, 1, 'SENT', 3500.00, 560.00, 4060.00, '2024-02-01', 1),
('PO-2024-003', 3, 2, 'DRAFT', 2800.00, 448.00, 3248.00, '2024-02-10', 2);


INSERT INTO purchase_order_items (po_id, prod_id, quantity, unit_price, received_quantity) VALUES

(1, 1, 5, 800.00, 5),
(1, 2, 10, 700.00, 10),

(2, 3, 8, 600.00, 0),
(2, 6, 20, 50.00, 0),

(3, 4, 3, 1500.00, 0),
(3, 7, 10, 80.00, 0);


INSERT INTO cash_register (branch_id, opened_by, opening_cash, status, opened_at) VALUES
(1, 3, 1000.00, 'OPEN', NOW() - INTERVAL '2 hours');


INSERT INTO pos_sales (register_id, branch_id, cashier_id, ticket_number, subtotal, discount, tax, total, payment_method, payment_received, change_given, status) VALUES
(1, 1, 3, 'TKT-20240101-001', 1299.99, 0.00, 207.99, 1507.98, 'cash', 1600.00, 92.02, 'COMPLETED'),
(1, 1, 3, 'TKT-20240101-002', 249.98, 10.00, 38.39, 278.37, 'card', 278.37, 0.00, 'COMPLETED'),
(1, 1, 3, 'TKT-20240101-003', 999.99, 0.00, 159.99, 1159.98, 'cash', 1200.00, 40.02, 'COMPLETED');


INSERT INTO pos_items (pos_sale_id, prod_id, product_name, quantity, unit_price, discount) VALUES
-- Ticket 1
(1, 1, 'Laptop Dell XPS 15', 1, 1299.99, 0.00),
-- Ticket 2
(2, 6, 'Mouse Logitech MX', 1, 99.99, 5.00),
(2, 7, 'Teclado Mecánico RGB', 1, 149.99, 5.00),
-- Ticket 3
(3, 2, 'iPhone 15 Pro', 1, 999.99, 0.00);


INSERT INTO pos_cash_movements (register_id, movement_type, amount, reference_type, reference_id, created_by) VALUES
(1, 'OPENING', 1000.00, 'CASH_REGISTER', 1, 3),
(1, 'SALE', 1600.00, 'POS_SALE', 1, 3),
(1, 'SALE', 278.37, 'POS_SALE', 2, 3),
(1, 'SALE', 1200.00, 'POS_SALE', 3, 3);


INSERT INTO inventory_movements (prod_id, branch_id, movement_type, quantity, cost_price, reference_type, reference_id, created_by) VALUES

(1, 1, 'IN', 10, 800.00, 'PURCHASE_ORDER', 1, 1),
(2, 1, 'IN', 25, 700.00, 'PURCHASE_ORDER', 1, 1),

(1, 1, 'OUT', -1, 800.00, 'POS_SALE', 1, 3),
(6, 1, 'OUT', -1, 50.00, 'POS_SALE', 2, 3),
(7, 1, 'OUT', -1, 80.00, 'POS_SALE', 2, 3),
(2, 1, 'OUT', -1, 700.00, 'POS_SALE', 3, 3);
