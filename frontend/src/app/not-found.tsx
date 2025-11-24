import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-9xl font-bold text-orange-500 mb-4">404</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Página No Encontrada</h2>
        <p className="text-xl text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-orange-600 transition transform hover:scale-105 shadow-lg"
          >
            <Home size={20} />
            Volver al Inicio
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-white text-orange-600 border-2 border-orange-500 px-8 py-4 rounded-lg font-bold hover:bg-orange-50 transition transform hover:scale-105"
          >
            <Search size={20} />
            Ver Productos
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-gray-500 text-sm">Error 404 - Página no encontrada</p>
        </div>
      </div>
    </div>
  );
}
