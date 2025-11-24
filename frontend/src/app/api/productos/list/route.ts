import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cat_id = searchParams.get('cat_id');
    const search = searchParams.get('search');
    const user_id = searchParams.get('user_id');

    let sql = `
      SELECT
        p.prod_id,
        p.name_pr,
        p.description,
        p.cat_id,
        p.person_id,
        p.sale_price,
        p.cost_price,
        p.image_url,
        p.is_active,
        p.created_at,
        c.name_cat,
        b.barcode,
        per.name_p,
        per.ap_pat,
        COALESCE(SUM(i.quantity), 0) as stock
      FROM products p
      LEFT JOIN categories c ON p.cat_id = c.cat_id
      LEFT JOIN barcodes b ON p.prod_id = b.prod_id AND b.is_primary = TRUE
      LEFT JOIN personas per ON p.person_id = per.person_id
      LEFT JOIN inventory i ON p.prod_id = i.prod_id
      WHERE p.is_active = TRUE
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (cat_id) {
      sql += ` AND p.cat_id = $${paramCount}`;
      params.push(parseInt(cat_id));
      paramCount++;
    }

    if (search) {
      sql += ` AND (p.name_pr ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR c.name_cat ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (user_id) {
      sql += ` AND p.person_id = $${paramCount}`;
      params.push(parseInt(user_id));
      paramCount++;
    }

    sql += ' GROUP BY p.prod_id, c.name_cat, b.barcode, per.name_p, per.ap_pat ORDER BY p.created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json({
      products: result.rows,
      total: result.rows.length,
    });
  } catch (error: any) {
    console.error('List products error:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos', details: error.message },
      { status: 500 }
    );
  }
}
