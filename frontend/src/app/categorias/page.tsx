'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Package, ArrowLeft } from 'lucide-react';

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

export default function CategoriasPage() {
  const { addToCart, getTotalItems } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch('/api/categorias'),
        fetch('/api/productos/list')
      ]);

      const categoriesData = await categoriesRes.json();
      const productsData = await productsRes.json();

      setCategories(categoriesData.categories || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.cat_id === selectedCategory)
    : products;

  const handleAddToCart = (product: Product) => {
    addToCart({
      prod_id: product.prod_id,
      name_pr: product.name_pr,
      sale_price: product.sale_price || product.cost_price,
      image_url: product.image_url,
      barcode: product.barcode
    });

    alert(`${product.name_pr} agregado al carrito`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-orange-600">
              <ShoppingCart className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Carrito Loco</h1>
            </Link>
            <Link href="/carrito" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-orange-600 transition" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {getTotalItems()}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {}
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Volver a inicio
        </Link>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Explorar por Categorías</h1>

        {/* filtro */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full font-medium transition transform hover:scale-105 ${
                !selectedCategory
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              Todas las Categorías ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.cat_id === cat.cat_id).length;
              return (
                <button
                  key={cat.cat_id}
                  onClick={() => setSelectedCategory(cat.cat_id)}
                  className={`px-6 py-3 rounded-full font-medium transition transform hover:scale-105 ${
                    selectedCategory === cat.cat_id
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                  }`}
                >
                  {cat.name_cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* grid para productos */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Cargando productos...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {selectedCategory
                ? `${categories.find(c => c.cat_id === selectedCategory)?.name_cat} (${filteredProducts.length})`
                : `Todos los Productos (${filteredProducts.length})`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.prod_id}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name_pr} className="h-full w-full object-cover" />
                    ) : (
                      <Package size={64} className="text-gray-400" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{product.name_pr}</h3>
                    <p className="text-sm text-orange-600 mb-2 font-medium">{product.name_cat}</p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description || "Producto de alta calidad"}
                    </p>
                    {product.barcode && (
                      <p className="text-xs text-gray-500 mb-2">Código: {product.barcode}</p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl font-bold text-orange-600">
                        ${(product.sale_price || product.cost_price).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.stock} disponibles
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition transform hover:scale-105 shadow"
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">
              {selectedCategory
                ? 'No se encontraron productos en esta categoría'
                : 'No hay productos disponibles'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
