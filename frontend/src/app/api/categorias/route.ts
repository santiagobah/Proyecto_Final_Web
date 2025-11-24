import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';

export async function GET() {
  try {
    const result = await query(
      'SELECT cat_id, name_cat, description FROM categories ORDER BY name_cat'
    );

    return NextResponse.json({
      categories: result.rows,
      total: result.rows.length,
    });
  } catch (error: any) {
    console.error('List categories error:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name_cat, description } = validation.data;

    const result = await query(
      'INSERT INTO categories (name_cat, description) VALUES ($1, $2) RETURNING cat_id',
      [name_cat, description || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Categoría creada exitosamente',
      categoryId: result.rows[0].cat_id,
    }, { status: 201 });
  } catch (error: any) {
    console.error('error: ', error);
    return NextResponse.json(
      { error: 'Error al crear categoría', details: error.message },
      { status: 500 }
    );
  }
}
