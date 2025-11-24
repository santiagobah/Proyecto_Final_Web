import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await clearAuthCookie();
    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error: any) {
    console.error('error al salir: ', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión', details: error.message },
      { status: 500 }
    );
  }
}
