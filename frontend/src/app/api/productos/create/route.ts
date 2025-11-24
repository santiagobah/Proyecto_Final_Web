import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { productSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name_pr, description, cat_id, price, stock, barcode, image_url } = validation.data;

    const productResult = await query(
      `INSERT INTO products (name_pr, description, cat_id, person_id, sale_price, cost_price, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING prod_id`,
      [
        name_pr, 
        description || null, 
        cat_id, 
        user.userId, 
        price, 
        price, 
        image_url || null
      ]
    );

    const prodId = productResult.rows[0].prod_id;

    if (stock !== undefined) {
      await query(
        `INSERT INTO inventory (prod_id, branch_id, quantity)
         VALUES ($1, 1, $2)
         ON CONFLICT (prod_id, branch_id) DO UPDATE SET quantity = $2`,
        [prodId, stock]
      );
    }

    if (barcode) {
      await query(
        `INSERT INTO barcodes (prod_id, barcode) VALUES ($1, $2)`,
        [prodId, barcode]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto creado exitosamente',
      productId: prodId,
    }, { status: 201 });

  } catch (error: any) {
    console.error('error:', error);
    return NextResponse.json(
      { error: 'Error al crear producto', details: error.message },
      { status: 500 }
    );
  }
}