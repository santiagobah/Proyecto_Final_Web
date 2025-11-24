"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/contexts/SessionContext";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, User, LogIn, Package, Search, Menu, X, TrendingUp, Star } from "lucide-react";

interface Product {
  prod_id: number;
  name_pr: string;
  description: string;
  sale_price: number;
  cost_price: number;
  stock: number;
  cat_id: number;
  name_cat: string;
  barcode: string;
  image_url?: string;
}

interface Category {
  cat_id: number;
  name_cat: string;
}

export default function Home() {
  const { user } = useSession();
  const { addToCart, getTotalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetch("/api/categorias")
      .then(res => res.json())
      .then(categoriesData => {
        setCategories(categoriesData.categories || []);
      })
      .catch(err => console.error("Error al obtener categorías:", err));
  }, []);

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();
    if (selectedCategory) params.append('cat_id', selectedCategory.toString());
    if (searchQuery) params.append('search', searchQuery);

    const url = `/api/productos/list${params.toString() ? '?' + params.toString() : ''}`;

    fetch(url)
      .then(res => res.json())
      .then(productsData => {
        setProducts(productsData.products || []);
      })
      .catch(err => console.error("Error al obtener productos:", err))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  const filteredProducts = products;
  const featuredProducts = products.slice(0, 8);

  const handleAddToCart = (product: Product) => {
    addToCart({
      prod_id: product.prod_id,
      name_pr: product.name_pr,
      // number pq si no marca error del cliente pq la base de datos mandaría un string como tal
      sale_price: Number(product.sale_price || product.cost_price),
      image_url: product.image_url,
      barcode: product.barcode
    });

    // confirmación:
    setToastMessage(`${product.name_pr} agregado al carrito`);
    setShowToast(true);

    // Ocultar en 3 segundos:
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* logo */}
            <Link href="/" className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition">
              <ShoppingCart className="w-8 h-8 md:w-10 md:h-10" />
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Carrito Loco</h1>
            </Link>

            {/* busqueda */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            {/* moverse */}
            <nav className="hidden lg:flex items-center gap-4">
              <Link
                href="/productos"
                className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition font-medium px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                <Package className="w-5 h-5" />
                Productos
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition font-medium px-3 py-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
                  >
                    Registrarse
                  </Link>
                </>
              )}
              <Link href="/carrito" className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-orange-600 transition" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              </Link>
            </nav>

            {/* boton de menu para panrallas mas pequeñas */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-gray-700 hover:text-orange-600 transition p-2"
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* busqueda pantallas pequeñas */}
          <div className="md:hidden mt-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {/* menu (en esencia) pantallas pequeñas */}
          {menuOpen && (
            <nav className="lg:hidden mt-4 pb-4 flex flex-col gap-2 border-t pt-4">
              <Link
                href="/productos"
                className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition font-medium py-2 px-3 rounded-lg hover:bg-orange-50"
                onClick={() => setMenuOpen(false)}
              >
                <Package className="w-5 h-5" />
                Productos
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition font-medium py-2 px-3"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition font-medium py-2 px-3"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
              <Link
                href="/carrito"
                className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition font-medium py-2 px-3"
                onClick={() => setMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                Carrito ({getTotalItems()})
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* intro */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 animate-fade-in">
            Bienvenido a Carrito Loco
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-orange-100 max-w-3xl mx-auto">
            Tu tienda en línea con punto de venta integrado. Los mejores productos al mejor precio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="bg-white text-orange-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold hover:bg-orange-50 transition transform hover:scale-105 shadow-lg"
            >
              Ver Catálogo Completo
            </Link>
            {!user && (
              <Link
                href="/register"
                className="bg-orange-800 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold hover:bg-orange-900 transition transform hover:scale-105 shadow-lg"
              >
                Crear Cuenta
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* grid oara datos, NO para productos */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-6 md:p-8 rounded-xl hover:shadow-2xl transition transform hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-orange-100">
              <TrendingUp className="mx-auto mb-4 text-orange-600" size={48} />
              <h3 className="text-xl font-bold mb-2 text-gray-800">Los mejores Precios</h3>
              <p className="text-gray-600">Precios competitivos</p>
            </div>
            <div className="text-center p-6 md:p-8 rounded-xl hover:shadow-2xl transition transform hover:-translate-y-2 bg-gradient-to-br from-red-50 to-red-100">
              <Package className="mx-auto mb-4 text-red-600" size={48} />
              <h3 className="text-xl font-bold mb-2 text-gray-800">Envío</h3>
              <p className="text-gray-600">Entregas rapidísimas</p>
            </div>
            <div className="text-center p-6 md:p-8 rounded-xl hover:shadow-2xl transition transform hover:-translate-y-2 bg-gradient-to-br from-yellow-50 to-yellow-100 md:col-span-2 lg:col-span-1">
              <Star className="mx-auto mb-4 text-yellow-600" size={48} />
              <h3 className="text-xl font-bold mb-2 text-gray-800">Calidad </h3>
              <p className="text-gray-600">Productos originales</p>
            </div>
          </div>
        </div>
      </section>

      {/* filtro resp */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 text-center">
          Explora por Categoría
        </h3>
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 md:px-6 py-2 rounded-full font-medium transition transform hover:scale-105 ${
              !selectedCategory
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow"
            }`}
          >
            Todas
          </button>
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat.cat_id}
              onClick={() => setSelectedCategory(cat.cat_id)}
              className={`px-4 md:px-6 py-2 rounded-full font-medium transition transform hover:scale-105 ${
                selectedCategory === cat.cat_id
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow"
              }`}
            >
              {cat.name_cat}
            </button>
          ))}
        </div>
      </section>

      {/* grid resp */}
      <main className="container mx-auto px-4 pb-12 md:pb-16">
        <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-800 text-center">
          {selectedCategory ? "Productos Filtrados" : "Productos Destacados"}
        </h3>

        {loading ? (
          <div className="text-center py-12 md:py-16">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-orange-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Cargando productos...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {(selectedCategory ? filteredProducts : featuredProducts).map((product) => (
              <div
                key={product.prod_id}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition transform hover:-translate-y-2 overflow-hidden"
              >
                <div className="h-48 md:h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name_pr} className="h-full w-full object-cover" />
                  ) : (
                    <Package size={64} className="text-gray-400" />
                  )}
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 truncate">{product.name_pr}</h3>
                  <p className="text-sm text-orange-600 mb-2 font-medium">{product.name_cat}</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description || "Producto de alta calidad"}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    {/* otra vez number */}
                    <span className="text-2xl md:text-3xl font-bold text-orange-600">
                      ${Number(product.sale_price || product.cost_price).toFixed(2)}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.stock} disponibles
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-orange-500 text-white py-2 md:py-3 rounded-lg font-bold hover:bg-orange-600 transition transform hover:scale-105 shadow"
                  >
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl shadow-lg">
            <Package className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">No se encontraron productos {searchQuery && "con ese nombre"}{selectedCategory && "en esta categoría"}</p>
          </div>
        )}

        {!selectedCategory && !searchQuery && featuredProducts.length > 0 && (
          <div className="text-center mt-8 md:mt-12">
            <Link
              href="/productos"
              className="inline-block bg-orange-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold hover:bg-orange-600 transition transform hover:scale-105 shadow-lg"
            >
              Ver Todos los Productos ({products.length})
            </Link>
          </div>
        )}
      </main>

      {/* footer res */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
                <h3 className="text-xl md:text-2xl font-bold">Carrito Loco</h3>
              </div>
              <p className="text-gray-400 text-sm md:text-base">
                Tu tienda en línea de confianza
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Enlaces</h4>
              <ul className="space-y-2 text-sm md:text-base">
                <li><Link href="/productos" className="text-gray-400 hover:text-white transition">Productos</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition">Mi Cuenta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Contacto</h4>
              <p className="text-gray-400 text-sm md:text-base">
                <br />
                📞 +52 55 6516 7056<br />
                📍 Almacén Ciudad de México
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-xs md:text-sm">
            <p className="mb-2">&copy; Carrito Loco</p>
            <p>Realizado por: Santiago Bañuelos Hernández</p>
          </div>
        </div>
      </footer>

      {/* toast? */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-up">
          <p className="font-bold">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}