'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react';

export default function CarritoPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart size={120} className="mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-600 mb-8">¡Agrega productos para comenzar tu compra!</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-orange-600 transition"
            >
              <ArrowLeft size={20} />
              Ir a comprar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            Seguir comprando
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Mi Carrito ({getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* carrito */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.prod_id}
                  className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition"
                >
                  <div className="flex gap-4">
                    {/* foto */}
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name_pr}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingCart size={48} className="text-gray-400" />
                      )}
                    </div>

                    {/* info cosa */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 truncate">
                        {item.name_pr}
                      </h3>
                      {item.barcode && (
                        <p className="text-sm text-gray-500 mb-2">Código: {item.barcode}</p>
                      )}
                      <p className="text-2xl font-bold text-orange-600 mb-4">
                        ${item.sale_price.toFixed(2)}
                      </p>

                      <div className="flex flex-wrap items-center gap-4">
                        {}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.prod_id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 font-bold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.prod_id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* total */}
                        <div className="flex-1 text-right">
                          <p className="text-sm text-gray-600">Subtotal:</p>
                          <p className="text-xl font-bold text-gray-800">
                            ${(item.sale_price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* eliminar - quitar */}
                        <button
                          onClick={() => removeFromCart(item.prod_id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* reusmen orden */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumen de Compra</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getTotalItems()} productos)</span>
                  <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="font-medium text-green-600">GRATIS</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (16%)</span>
                  <span className="font-medium">${(getTotalPrice() * 0.16).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total</span>
                    <span className="text-3xl font-bold text-orange-600">
                      ${(getTotalPrice() * 1.16).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
              >
                <CreditCard size={20} />
                Proceder al Pago
              </Link>

              <Link
                href="/"
                className="block text-center mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Continuar comprando
              </Link>

              {/* seguridad */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-500 text-center mb-2">Compra 100% segura</p>
                <div className="flex justify-center gap-4 text-xs text-gray-400">
                  <span>Pago seguro</span>
                  <span>Pago verificado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
