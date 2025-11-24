import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/contexts/SessionContext";
import { CartProvider } from "@/contexts/CartContext";
import BotonHome from "@/app/reciclar/botonhome"; 
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carrito Loco",
  description: "Tienda en línea y punto de venta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <CartProvider>
            {children}
            {/* boton para siempre poder regresar al inicio (en el layout para no poner en todos los .tsx otra cosa) */}
            <BotonHome />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}