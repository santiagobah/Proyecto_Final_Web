"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Search, Filter, Package } from "lucide-react";

// Interfaces que coinciden c¿
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

export default function ProductosPage() {
  const { addToCart } = useCart(); // conectar al carrito
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // presentar categorías
  useEffect(() => {
    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  // caargar productos
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append("cat_id", selectedCategory.toString());
    if (searchQuery) params.append("search", searchQuery);

    // ruta:
    fetch(`/api/productos/list?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => console.error("Error cargando productos:", err))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  // number:
  const handleAddToCart = (product: Product) => {
    addToCart({
      prod_id: product.prod_id,
      name_pr: product.name_pr,
      // string a number:
      sale_price: Number(product.sale_price || product.cost_price || 0),
      image_url: product.image_url,
      barcode: product.barcode,
    });
    
    // confirmación
    alert(`${product.name_pr} agregado al carrito`);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-600 mb-8 text-center flex items-center justify-center gap-3">
          <Package className="w-10 h-10" />
          Catálogo Completo
        </h1>

        {/* Barra de Herramientas (Buscador y Filtros) */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Buscador */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filtro de Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === null 
                  ? "bg-orange-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.cat_id}
                onClick={() => setSelectedCategory(cat.cat_id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === cat.cat_id
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name_cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando catálogo...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.prod_id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Imagen */}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name_pr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={48} />
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <p className="text-xs text-orange-500 font-bold uppercase mb-1">
                      {product.name_cat || "General"}
                    </p>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                      {product.name_pr}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {product.description || "Sin descripción disponible."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {/* misma correción de number */}
                        ${Number(product.sale_price || product.cost_price).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 transition-colors shadow-lg hover:shadow-orange-200"
                      title="Agregar al carrito"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay productos disponibles.</p>
          </div>
        )}
      </div>
    </main>
  );
}