package models

import "time"

// Branch represents a store branch/location
type Branch struct {
	BranchID  int       `json:"branch_id"`
	Name      string    `json:"name"`
	Address   string    `json:"address"`
	City      string    `json:"city"`
	State     string    `json:"state"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

// Persona represents a user/person
type Persona struct {
	PersonID  int       `json:"person_id"`
	NameP     string    `json:"name_p"`
	ApPat     string    `json:"ap_pat"`
	ApMat     *string   `json:"ap_mat,omitempty"`
	BranchID  *int      `json:"branch_id,omitempty"`
	Sell      bool      `json:"sell"`
	Buy       bool      `json:"buy"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

// Role represents a user role
type Role struct {
	RoleID      int                    `json:"role_id"`
	RoleName    string                 `json:"role_name"`
	Description string                 `json:"description"`
	Permissions map[string]interface{} `json:"permissions"`
	CreatedAt   time.Time              `json:"created_at"`
}

// UserPass represents user authentication
type UserPass struct {
	PersonID  int        `json:"person_id"`
	Email     string     `json:"email"`
	Password  string     `json:"-"`
	IsAdmin   bool       `json:"is_admin"`
	LastLogin *time.Time `json:"last_login,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

// UserRole represents user-role relationship
type UserRole struct {
	PersonID   int       `json:"person_id"`
	RoleID     int       `json:"role_id"`
	AssignedAt time.Time `json:"assigned_at"`
}

// Supplier represents a product supplier
type Supplier struct {
	SupplierID   int       `json:"supplier_id"`
	Name         string    `json:"name"`
	ContactName  *string   `json:"contact_name,omitempty"`
	Email        *string   `json:"email,omitempty"`
	Phone        *string   `json:"phone,omitempty"`
	Address      *string   `json:"address,omitempty"`
	Website      *string   `json:"website,omitempty"`
	TaxID        *string   `json:"tax_id,omitempty"`
	PaymentTerms *string   `json:"payment_terms,omitempty"`
	IsActive     bool      `json:"is_active"`
	Rating       float64   `json:"rating"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Category represents product category
type Category struct {
	CatID       int       `json:"cat_id"`
	NameCat     string    `json:"name_cat"`
	Description *string   `json:"description,omitempty"`
	ParentID    *int      `json:"parent_id,omitempty"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}

// Product represents a product
type Product struct {
	ProdID       int       `json:"prod_id"`
	NamePr       string    `json:"name_pr"`
	Description  *string   `json:"description,omitempty"`
	CatID        *int      `json:"cat_id,omitempty"`
	PersonID     *int      `json:"person_id,omitempty"`
	SKU          *string   `json:"sku,omitempty"`
	CostPrice    float64   `json:"cost_price"`
	SalePrice    float64   `json:"sale_price"`
	MinPrice     float64   `json:"min_price"`
	TaxRate      float64   `json:"tax_rate"`
	ImageURL     *string   `json:"image_url,omitempty"`
	IsActive     bool      `json:"is_active"`
	IsService    bool      `json:"is_service"`
	MinStock     int       `json:"min_stock"`
	MaxStock     int       `json:"max_stock"`
	ReorderPoint int       `json:"reorder_point"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Barcode represents product barcode
type Barcode struct {
	BarcodeID int       `json:"barcode_id"`
	ProdID    int       `json:"prod_id"`
	Barcode   string    `json:"barcode"`
	IsPrimary bool      `json:"is_primary"`
	CreatedAt time.Time `json:"created_at"`
}

// Inventory represents product stock by branch
type Inventory struct {
	InventoryID       int       `json:"inventory_id"`
	ProdID            int       `json:"prod_id"`
	BranchID          int       `json:"branch_id"`
	Quantity          int       `json:"quantity"`
	ReservedQuantity  int       `json:"reserved_quantity"`
	AvailableQuantity int       `json:"available_quantity"`
	Location          *string   `json:"location,omitempty"`
	LastCountDate     *string   `json:"last_count_date,omitempty"`
	LastUpdated       time.Time `json:"last_updated"`
}

// InventoryMovement represents inventory kardex entry
type InventoryMovement struct {
	MovementID    int       `json:"movement_id"`
	ProdID        int       `json:"prod_id"`
	BranchID      int       `json:"branch_id"`
	MovementType  string    `json:"movement_type"`
	Quantity      int       `json:"quantity"`
	CostPrice     *float64  `json:"cost_price,omitempty"`
	ReferenceType *string   `json:"reference_type,omitempty"`
	ReferenceID   *int      `json:"reference_id,omitempty"`
	Notes         *string   `json:"notes,omitempty"`
	CreatedBy     *int      `json:"created_by,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

// SupplierPrice represents scraped supplier price
type SupplierPrice struct {
	PriceID      int       `json:"price_id"`
	ProdID       int       `json:"prod_id"`
	SupplierID   int       `json:"supplier_id"`
	Price        float64   `json:"price"`
	URL          *string   `json:"url,omitempty"`
	Availability *string   `json:"availability,omitempty"`
	LastScraped  time.Time `json:"last_scraped"`
	IsCurrent    bool      `json:"is_current"`
	CreatedAt    time.Time `json:"created_at"`
}

// CompetitorPrice represents scraped competitor price
type CompetitorPrice struct {
	CompPriceID     int       `json:"comp_price_id"`
	ProdID          int       `json:"prod_id"`
	CompetitorName  string    `json:"competitor_name"`
	ProductName     *string   `json:"product_name,omitempty"`
	Price           float64   `json:"price"`
	URL             *string   `json:"url,omitempty"`
	Availability    *string   `json:"availability,omitempty"`
	SimilarityScore *float64  `json:"similarity_score,omitempty"`
	LastScraped     time.Time `json:"last_scraped"`
	CreatedAt       time.Time `json:"created_at"`
}

// PurchaseOrder represents a purchase order
type PurchaseOrder struct {
	POID         int        `json:"po_id"`
	PONumber     string     `json:"po_number"`
	SupplierID   *int       `json:"supplier_id,omitempty"`
	BranchID     *int       `json:"branch_id,omitempty"`
	Status       string     `json:"status"`
	Total        float64    `json:"total"`
	Tax          float64    `json:"tax"`
	GrandTotal   float64    `json:"grand_total"`
	Notes        *string    `json:"notes,omitempty"`
	ExpectedDate *string    `json:"expected_date,omitempty"`
	ReceivedDate *string    `json:"received_date,omitempty"`
	CreatedBy    *int       `json:"created_by,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// PurchaseOrderItem represents an item in a purchase order
type PurchaseOrderItem struct {
	POItemID         int     `json:"po_item_id"`
	POID             int     `json:"po_id"`
	ProdID           *int    `json:"prod_id,omitempty"`
	Quantity         int     `json:"quantity"`
	UnitPrice        float64 `json:"unit_price"`
	ReceivedQuantity int     `json:"received_quantity"`
	Subtotal         float64 `json:"subtotal"`
}

// Sale represents an online sale
type Sale struct {
	SaleID        int       `json:"sale_id"`
	PersonID      *int      `json:"person_id,omitempty"`
	BranchID      *int      `json:"branch_id,omitempty"`
	Total         float64   `json:"total"`
	Discount      float64   `json:"discount"`
	Tax           float64   `json:"tax"`
	GrandTotal    float64   `json:"grand_total"`
	PaymentMethod string    `json:"payment_method"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

// SaleItem represents an item in a sale
type SaleItem struct {
	ItemID      int       `json:"item_id"`
	SaleID      int       `json:"sale_id"`
	ProdID      *int      `json:"prod_id,omitempty"`
	ProductName string    `json:"product_name"`
	Quantity    int       `json:"quantity"`
	UnitPrice   float64   `json:"unit_price"`
	Discount    float64   `json:"discount"`
	Subtotal    float64   `json:"subtotal"`
	CreatedAt   time.Time `json:"created_at"`
}

// CashRegister represents a POS cash register session
type CashRegister struct {
	RegisterID   int        `json:"register_id"`
	BranchID     *int       `json:"branch_id,omitempty"`
	OpenedBy     *int       `json:"opened_by,omitempty"`
	ClosedBy     *int       `json:"closed_by,omitempty"`
	OpeningCash  float64    `json:"opening_cash"`
	ClosingCash  *float64   `json:"closing_cash,omitempty"`
	ExpectedCash *float64   `json:"expected_cash,omitempty"`
	Difference   *float64   `json:"difference,omitempty"`
	Status       string     `json:"status"`
	OpenedAt     time.Time  `json:"opened_at"`
	ClosedAt     *time.Time `json:"closed_at,omitempty"`
	Notes        *string    `json:"notes,omitempty"`
}

// POSSale represents a point-of-sale transaction
type POSSale struct {
	POSSaleID       int        `json:"pos_sale_id"`
	RegisterID      *int       `json:"register_id,omitempty"`
	BranchID        *int       `json:"branch_id,omitempty"`
	CashierID       *int       `json:"cashier_id,omitempty"`
	TicketNumber    string     `json:"ticket_number"`
	Subtotal        float64    `json:"subtotal"`
	Discount        float64    `json:"discount"`
	Tax             float64    `json:"tax"`
	Total           float64    `json:"total"`
	PaymentMethod   string     `json:"payment_method"`
	PaymentReceived *float64   `json:"payment_received,omitempty"`
	ChangeGiven     *float64   `json:"change_given,omitempty"`
	Status          string     `json:"status"`
	RefundReason    *string    `json:"refund_reason,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

// POSItem represents an item in a POS sale
type POSItem struct {
	POSItemID   int     `json:"pos_item_id"`
	POSSaleID   int     `json:"pos_sale_id"`
	ProdID      *int    `json:"prod_id,omitempty"`
	ProductName string  `json:"product_name"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	Discount    float64 `json:"discount"`
	Subtotal    float64 `json:"subtotal"`
}

// POSCashMovement represents cash register movements
type POSCashMovement struct {
	MovementID    int       `json:"movement_id"`
	RegisterID    *int      `json:"register_id,omitempty"`
	MovementType  string    `json:"movement_type"`
	Amount        float64   `json:"amount"`
	ReferenceType *string   `json:"reference_type,omitempty"`
	ReferenceID   *int      `json:"reference_id,omitempty"`
	Notes         *string   `json:"notes,omitempty"`
	CreatedBy     *int      `json:"created_by,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

// Request/Response DTOs

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token   string   `json:"token"`
	User    UserPass `json:"user"`
	Message string   `json:"message"`
}

type POSSaleRequest struct {
	Items         []POSSaleItemRequest `json:"items"`
	PaymentMethod string               `json:"payment_method"`
	Discount      float64              `json:"discount,omitempty"`
	RegisterID    int                  `json:"register_id"`
}

type POSSaleItemRequest struct {
	ProdID   int     `json:"prod_id"`
	Quantity int     `json:"quantity"`
	Discount float64 `json:"discount,omitempty"`
}

type OpenCashRegisterRequest struct {
	BranchID    int     `json:"branch_id"`
	OpeningCash float64 `json:"opening_cash"`
}

type CloseCashRegisterRequest struct {
	RegisterID  int     `json:"register_id"`
	ClosingCash float64 `json:"closing_cash"`
	Notes       string  `json:"notes,omitempty"`
}

// Report DTOs

type SalesReportResponse struct {
	TotalSales   float64            `json:"total_sales"`
	TotalOrders  int                `json:"total_orders"`
	AverageOrder float64            `json:"average_order"`
	ByDay        []DailySalesReport `json:"by_day,omitempty"`
	ByProduct    []ProductSales     `json:"by_product,omitempty"`
}

type DailySalesReport struct {
	Date   string  `json:"date"`
	Sales  float64 `json:"sales"`
	Orders int     `json:"orders"`
}

type ProductSales struct {
	ProductID   int     `json:"product_id"`
	ProductName string  `json:"product_name"`
	Quantity    int     `json:"quantity"`
	TotalSales  float64 `json:"total_sales"`
}
