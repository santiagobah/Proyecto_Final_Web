import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { prod_id, quantity } = body;

    if (!prod_id || !quantity) {
      return NextResponse.json(
        { error: 'prod_id y quantity son requeridos' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Update stock
    const result = await query(
      'UPDATE products SET stock = stock + $1 WHERE prod_id = $2 RETURNING stock',
      [quantity, prod_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inventario actualizado exitosamente',
      newStock: result.rows[0].stock,
    });
  } catch (error: any) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar inventario', details: error.message },
      { status: 500 }
    );
  }
}
