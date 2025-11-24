import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
  }

  try {
    const text = `
      SELECT p.prod_id, p.name_pr, p.sale_price, p.cost_price, b.barcode
      FROM products p
      JOIN barcodes b ON p.prod_id = b.prod_id
      WHERE b.barcode = $1
      LIMIT 1
    `;
    
    const result = await query(text, [code]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const product = result.rows[0];

    return NextResponse.json({
      success: true,
      product: {
        barcode: product.barcode,
        name_pr: product.name_pr,
        price: Number(product.sale_price || product.cost_price || 0)
      }
    });

  } catch (error: any) {
    console.error('Error buscando producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}