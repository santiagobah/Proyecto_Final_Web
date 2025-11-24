"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Package, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Category {
  cat_id: number;
  name_cat: string;
}

export default function EditarProductoPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const params = useParams();
  const prodId = params.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name_pr: '',
    description: '',
    cat_id: '',
    price: '',
    stock: '',
    image_url: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categorias').then(res => res.json()),
      fetch(`/api/productos/list?user_id=${user?.id}`).then(res => res.json())
    ])
    .then(([categoriesData, productsData]) => {
      setCategories(categoriesData.categories || []);
      const product = productsData.products?.find((p: any) => p.prod_id === parseInt(prodId as string));
      if (product) {
        setFormData({
          name_pr: product.name_pr,
          description: product.description || '',
          cat_id: product.cat_id?.toString() || '',
          price: product.price?.toString() || '',
          stock: product.stock?.toString() || '',
          image_url: product.image_url || '',
        });
      }
    })
    .catch(err => console.error('error:', err))
    .finally(() => setLoadingProduct(false));
  }, [user, prodId]);

  if (loading || loadingProduct) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user || !user.sell) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/productos/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prod_id: parseInt(prodId as string),
          ...formData,
          cat_id: parseInt(formData.cat_id),
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar producto');
      }

      setSuccess(true);
      setTimeout(() => router.push('/productos/mis-productos'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/productos/mis-productos" className="text-orange-600 hover:text-orange-700 mb-4 inline-block">
            ← Volver a mis productos
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
              <p className="text-gray-600">Actualiza la información del producto</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Producto actualizado exitosamente. Redirigiendo...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={formData.name_pr}
                onChange={(e) => setFormData({...formData, name_pr: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.cat_id}
                  onChange={(e) => setFormData({...formData, cat_id: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.cat_id} value={cat.cat_id}>{cat.name_cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Imagen
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
              >
                {submitting ? 'Actualizando...' : 'Actualizar Producto'}
              </button>
              <Link
                href="/productos/mis-productos"
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
