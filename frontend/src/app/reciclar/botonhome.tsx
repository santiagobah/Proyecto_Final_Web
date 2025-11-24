"use client";

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function BotonHome() {
  return (
    <Link
      href="/"
      className="fixed bottom-6 right-6 z-[9999] bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-orange-600 hover:scale-110 transition-all duration-300 flex items-center justify-center border-2 border-white group"
      title="Ir al Inicio"
    >
      <Home size={24} className="group-hover:animate-pulse" />
      <span className="absolute right-full mr-3 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Ir al Inicio
      </span>
    </Link>
  );
}