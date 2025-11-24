import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const prod_id = searchParams.get('prod_id');

    if (!prod_id) {
      return NextResponse.json({ error: 'prod_id es requerido' }, { status: 400 });
    }

    const productCheck = await query(
      'SELECT person_id FROM products WHERE prod_id = $1',
      [parseInt(prod_id)]
    );

    if (productCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    if (productCheck.rows[0].person_id !== user.userId && !user.isAdmin) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar este producto' }, { status: 403 });
    }

    await query(
      'UPDATE products SET is_active = FALSE WHERE prod_id = $1',
      [parseInt(prod_id)]
    );

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto', details: error.message },
      { status: 500 }
    );
  }
}
