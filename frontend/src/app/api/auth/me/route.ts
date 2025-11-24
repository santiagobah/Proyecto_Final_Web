import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT p.person_id, p.name_p, p.ap_pat, p.ap_mat, p.sell, p.buy,
              up.email, up.is_admin
       FROM personas p
       JOIN user_pass up ON p.person_id = up.person_id
       WHERE p.person_id = $1`,
      [user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userData = result.rows[0];

    return NextResponse.json({
      user: {
        id: userData.person_id,
        email: userData.email,
        name: `${userData.name_p} ${userData.ap_pat} ${userData.ap_mat || ''}`.trim(),
        firstName: userData.name_p,
        lastName: `${userData.ap_pat} ${userData.ap_mat || ''}`.trim(),
        sell: userData.sell,
        buy: userData.buy,
        isAdmin: userData.is_admin,
      },
    });
  } catch (error: any) {
    console.error('error: ', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario', details: error.message },
      { status: 500 }
    );
  }
}
