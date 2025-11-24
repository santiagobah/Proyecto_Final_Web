"use client";

import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error500Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <AlertTriangle size={120} className="mx-auto text-yellow-500" />
        </div>
        <h1 className="text-9xl font-bold text-yellow-500 mb-4">500</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Error del Servidor</h2>
        <p className="text-xl text-gray-600 mb-8">
          Algo salió mal en nuestros servidores. Ntp, el error es nuestro, no tuyo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-yellow-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-yellow-600 transition transform hover:scale-105 shadow-lg"
          >
            <Home size={20} />
            Volver al Inicio
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-white text-yellow-600 border-2 border-yellow-500 px-8 py-4 rounded-lg font-bold hover:bg-yellow-50 transition transform hover:scale-105"
          >
            <RefreshCw size={20} />
            Reintentar
          </button>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h3 className="font-bold text-gray-800 mb-2">¿Qué puedes hacer?</h3>
          <ul className="text-sm text-gray-600 text-left space-y-2">
            <li>• Recargar la página en unos momentos</li>
          </ul>
        </div>

        <div className="mt-12">
          <p className="text-gray-500 text-sm">Error 500</p>
        </div>
      </div>
    </div>
  );
}
