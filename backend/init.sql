-- tablas

CREATE TABLE personas (
    person_id SERIAL PRIMARY KEY,
    name_p VARCHAR(50) NOT NULL,
    ap_pat VARCHAR(50) NOT NULL,
    ap_mat VARCHAR(50),
    sell BOOL,
    buy BOOL
);

CREATE TABLE user_pass (
    person_id INT REFERENCES personas (person_id) UNIQUE,
    account VARCHAR(50) NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE bank_person (
    person_id INT REFERENCES personas (person_id) UNIQUE,
    num_card VARCHAR(20) NOT NULL,
    exp_date VARCHAR(5) NOT NULL
);

CREATE TABLE specific_personal_data (
    data_id SERIAL PRIMARY KEY,
    street VARCHAR(100) NOT NULL,
    colonia VARCHAR(100) NOT NULL,
    number VARCHAR(10),
    cp VARCHAR(10)
);

CREATE TABLE personal_data (
    person_id INT REFERENCES personas (person_id) UNIQUE,
    estado VARCHAR(50) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    data_id INT REFERENCES specific_personal_data (data_id)
);

CREATE TABLE products (
    prod_id SERIAL PRIMARY KEY,
    name_pr VARCHAR(100) NOT NULL,
    cat VARCHAR(50),
    cat_id INT,
    person_id INT REFERENCES personas (person_id)
);

CREATE TABLE categor (
    cat_id SERIAL PRIMARY KEY,
    name_cat VARCHAR(50) NOT NULL,
    prod_id INT REFERENCES products (prod_id)
);

-- relleno de datos:

INSERT INTO personas (name_p, ap_pat, ap_mat, sell, buy)
VALUES
('Juan', 'Pérez', 'López', TRUE, FALSE),
('María', 'Gómez', 'Ruiz', TRUE, TRUE),
('Carlos', 'Hernández', 'Torres', FALSE, TRUE);

INSERT INTO products (name_pr, cat, cat_id, person_id)
VALUES
('Laptop Gamer ASUS', 'Electrónica', 1, 1),
('Smartphone Samsung S24', 'Electrónica', 1, 2),
('Audífonos Sony WH-1000XM5', 'Accesorios', 2, 2),
('Cámara Canon EOS R50', 'Fotografía', 3, 1),
('Reloj Casio G-Shock', 'Accesorios', 2, 3);

INSERT INTO categor (name_cat, prod_id)
VALUES
('Electrónica', 1),
('Electrónica', 2),
('Accesorios', 3),
('Fotografía', 4),
('Accesorios', 5);

CREATE TABLE IF NOT EXISTS barcodes (
    barcode_id SERIAL PRIMARY KEY,
    prod_id INT REFERENCES products (prod_id) ON DELETE CASCADE,
    barcode VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO barcodes (prod_id, barcode) VALUES
(1, '1234567890123'),
(2, '9876543210987'),
(3, '5556667778888'),
(4, '4443332221110'),
(5, '1112223334445');