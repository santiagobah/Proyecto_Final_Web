import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name_p, ap_pat, ap_mat, sell, buy } = validation.data;

    const existingUser = await query(
      'SELECT email FROM user_pass WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Hash contrraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const personResult = await query(
      `INSERT INTO personas (name_p, ap_pat, ap_mat, sell, buy)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING person_id`,
      [name_p, ap_pat, ap_mat || null, sell, buy]
    );

    const personId = personResult.rows[0].person_id;

    await query(
      `INSERT INTO user_pass (person_id, email, password, is_admin)
       VALUES ($1, $2, $3, $4)`,
      [personId, email, hashedPassword, false]
    );

    const token = await createToken({
      userId: personId,
      email: email,
      isAdmin: false,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: personId,
        email,
        name: `${name_p} ${ap_pat}`,
        isAdmin: false,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('error:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario', details: error.message },
      { status: 500 }
    );
  }
}
