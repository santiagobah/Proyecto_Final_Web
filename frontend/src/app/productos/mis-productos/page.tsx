"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Edit, Trash2, Plus } from 'lucide-react';

interface Product {
  prod_id: number;
  name_pr: string;
  description: string;
  price: number;
  stock: number;
  name_cat: string;
  barcode: string;
}

export default function MisProductosPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const response = await fetch(`/api/productos/list?user_id=${user?.id}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDelete = async (prodId: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const response = await fetch(`/api/productos/delete?prod_id=${prodId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadProducts();
      } else {
        alert('Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar producto');
    }
  };

  if (loading || loadingProducts) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user || !user.sell) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-orange-600 hover:text-orange-700 mb-4 inline-block">
            ← Volver al dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-3 rounded-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Productos</h1>
                <p className="text-gray-600">{products.length} producto(s)</p>
              </div>
            </div>
            <Link
              href="/productos/crear"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Producto
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes productos</h2>
            <p className="text-gray-600 mb-6">Crea tu primer producto para comenzar</p>
            <Link
              href="/productos/crear"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition"
            >
              Crear Producto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.prod_id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{product.name_pr}</h3>
                      <p className="text-sm text-gray-600">{product.name_cat}</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">${product.price}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description || 'Sin descripción'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="font-semibold text-gray-900">{product.stock} unidades</p>
                    </div>
                    {product.barcode && (
                      <div>
                        <p className="text-xs text-gray-500">Código</p>
                        <p className="font-mono text-sm text-gray-900">{product.barcode}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/productos/editar/${product.prod_id}`}
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(product.prod_id)}
                      className="bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
