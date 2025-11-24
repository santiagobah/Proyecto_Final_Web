import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { prod_id, name_pr, description, cat_id, price, stock, image_url } = body;

    if (!prod_id) {
      return NextResponse.json({ error: 'prod_id es requerido' }, { status: 400 });
    }

    const productCheck = await query(
      'SELECT person_id FROM products WHERE prod_id = $1',
      [prod_id]
    );

    if (productCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    if (productCheck.rows[0].person_id !== user.userId && !user.isAdmin) {
      return NextResponse.json({ error: 'No tienes permiso para editar este producto' }, { status: 403 });
    }

    await query(
      `UPDATE products
       SET name_pr = COALESCE($1, name_pr),
           description = COALESCE($2, description),
           cat_id = COALESCE($3, cat_id),
           price = COALESCE($4, price),
           stock = COALESCE($5, stock),
           image_url = COALESCE($6, image_url)
       WHERE prod_id = $7`,
      [name_pr, description, cat_id, price, stock, image_url, prod_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto', details: error.message },
      { status: 500 }
    );
  }
}
