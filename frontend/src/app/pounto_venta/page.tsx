"use client";

import { useState } from "react";
import { ShoppingCart, Trash2, Search, CreditCard, CheckCircle, X } from 'lucide-react';

interface SaleItem {
  barcode: string;
  name: string;
  price: number;
  qty: number;
}

export default function POSPage() {
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  // para mostrar la ventana de pagos:
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // "fila" de articulos de compras:
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    setLoading(true);

    try {
      // entrada de la API
      const res = await fetch(`/api/pos/search?code=${barcode}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const product = data.product;
        const existing = items.find((item) => item.barcode === product.barcode);

        let newItems;
        if (existing) {
          newItems = items.map((item) =>
            item.barcode === product.barcode
              ? { ...item, qty: item.qty + 1 }
              : item
          );
        } else {
          newItems = [
            ...items,
            {
              barcode: product.barcode,
              name: product.name_pr,
              price: product.price, 
              qty: 1,
            },
          ];
        }
        updateCart(newItems);
      } else {
        alert(data.error || "Producto no encontrado");
      }
      setBarcode("");
    } catch (err) {
      console.error("Error al buscar:", err);
      alert("Error de conexión al buscar producto");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (code: string) => {
    const newItems = items.filter((i) => i.barcode !== code);
    updateCart(newItems);
  };

  const updateCart = (newItems: SaleItem[]) => {
    setItems(newItems);
    setTotal(newItems.reduce((sum, i) => sum + (Number(i.price) * i.qty), 0));
  };

  // "ir a pagar" abre los pagos:
  const openPaymentPortal = () => {
    if (items.length === 0) return;
    setShowPaymentModal(true);
  };

  // "pagar" en el portal
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // enviar la venta
      const res = await fetch('/api/pos/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total, paymentMethod: 'CARD' }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowPaymentModal(false);
        setSuccess(`Ticket #${data.ticket} generado`);
        setItems([]); // vaciar lista
        setTotal(0);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        alert(data.error || "Error al procesar la venta");
      }
    } catch (error) {
      console.error("Error checkout:", error);
      alert("Error de conexión al cobrar");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-center gap-3 mb-8">
            <CreditCard className="w-10 h-10 text-green-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Punto de Venta</h1>
        </header>

        {/* mensaje final */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center gap-2 animate-pulse">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">¡Venta Exitosa!</span>
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* Buscador */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <form onSubmit={handleAddItem} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Escanea código de barras..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50 min-w-[100px]"
            >
              {loading ? "..." : "Agregar"}
            </button>
          </form>
        </div>

        {/* productos mostrados */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[400px] flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4 text-center">Cant.</th>
                  <th className="p-4 text-right">Precio</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.barcode} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{item.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{item.barcode}</div>
                      </td>
                      <td className="p-4 text-center font-bold text-lg">{item.qty}</td>
                      <td className="p-4 text-right text-gray-600">${Number(item.price).toFixed(2)}</td>
                      <td className="p-4 text-right font-bold text-green-600 text-lg">
                        ${(Number(item.price) * item.qty).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleRemove(item.barcode)}
                          className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-20" />
                      <p className="text-lg">El carrito está vacío</p>
                      <p className="text-sm">Escanea un producto para comenzar</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* boton para cobrar y totales */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 text-lg">Artículos: <span className="font-bold text-gray-800">{items.reduce((a, b) => a + b.qty, 0)}</span></span>
              <div className="text-right">
                <span className="block text-sm text-gray-500 uppercase font-semibold">Total a Pagar</span>
                <span className="text-4xl font-bold text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={openPaymentPortal}
              disabled={items.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-xl text-white shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-3
                ${items.length === 0 ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'}`}
            >
              Ir a Pagar
            </button>
          </div>
        </div>
      </div>

      {/* portal de pagos */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            
            {/* header de los pagos */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white relative">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-gray-400 mb-1">TOTAL A PAGAR</div>
                  <span className="text-4xl font-bold">${total.toFixed(2)}</span>
                  <span className="text-sm ml-2 text-gray-400">MXN</span>
                </div>
                <CreditCard className="text-white opacity-20 w-16 h-16 absolute right-6 top-6" />
              </div>
              <div className="mt-4 text-xs text-gray-500 font-mono">REF: POS-{Date.now().toString().slice(-6)}</div>
            </div>

            {/* campos de pagos */}
            <div className="p-8">
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Número de Tarjeta</label>
                  <input type="text" placeholder="0000 0000 0000 0000" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Expira</label>
                    <input type="text" placeholder="MM/YY" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">CVV</label>
                    <input type="text" placeholder="123" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Titular</label>
                  <input type="text" placeholder="Nombre como aparece en la tarjeta" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input type="checkbox" id="save-card" className="w-4 h-4 text-blue-600 rounded" />
                  <label htmlFor="save-card" className="text-sm text-gray-600">Guardar tarjeta para futuras compras</label>
                </div>

                <button 
                  type="submit" 
                  disabled={processing}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg transform hover:scale-[1.02] active:scale-[0.98] mt-4"
                >
                  {processing ? "Procesando..." : `PAGAR $${total.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}