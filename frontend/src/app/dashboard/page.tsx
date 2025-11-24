"use client";

import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  Users, 
  CreditCard, 
  LogOut, 
  PackageSearch, 
  BarChart3,
  Store
} from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pequeña protección de ruta
    if (!user) {
      // Si no hay usuario, esperamos un momento por si está cargando el contexto
      const timer = setTimeout(() => {
        router.push("/login");
      }, 1000);
      return () => clearTimeout(timer);
    }
    setLoading(false);
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Superior */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <LayoutDashboard className="text-orange-600 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Panel de Administración</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 uppercase">{user?.isAdmin ? 'Administrador' : 'Cajero'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Sección de Bienvenida */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hola, {user?.name.split(' ')[0]} 👋</h2>
          <p className="text-gray-500">Selecciona la opción que deseas</p>
        </div>

        {/* acciones rapidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* cobrar */}
          <Link href="/pounto_venta" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <CreditCard size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Punto de Venta</h3>
              <p className="text-sm text-gray-500">Realizar cobros y generar tickets.</p>
            </div>
          </Link>

          {/* agregar productos */}
          {user?.isAdmin && (
            <Link href="/productos/crear" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <PlusCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Agregar Producto</h3>
                <p className="text-sm text-gray-500">Registrar nuevos artículos en el inventario.</p>
              </div>
            </Link>
          )}

          {/*inventario */}
          <Link href="/productos/mis-productos" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <PackageSearch size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Gestionar Inventario</h3>
              <p className="text-sm text-gray-500">Editar existencias, precios y más.</p>
            </div>
          </Link>

          {/* ver tienda */}
          <Link href="/productos" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Store size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Ver Catálogo</h3>
              <p className="text-sm text-gray-500">Ir a la vista del cliente.</p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}