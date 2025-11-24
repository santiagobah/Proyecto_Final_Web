import Link from 'next/link';
import { Home, Lock } from 'lucide-react';

export default function Error403Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <Lock size={120} className="mx-auto text-red-500" />
        </div>
        <h1 className="text-9xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Acceso Prohibido</h2>
        <p className="text-xl text-gray-600 mb-8">
          No tienes permisos para acceder a esta página.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-red-600 transition transform hover:scale-105 shadow-lg"
          >
            <Home size={20} />
            Volver al Inicio
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-red-600 border-2 border-red-500 px-8 py-4 rounded-lg font-bold hover:bg-red-50 transition transform hover:scale-105"
          >
            <Lock size={20} />
            Iniciar Sesión
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-gray-500 text-sm">Error 403 - Forbidden (Acceso Prohibido)</p>
        </div>
      </div>
    </div>
  );
}
