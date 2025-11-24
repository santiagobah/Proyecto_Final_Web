import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { createToken, setAuthCookie } from '@/lib/auth';

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (!attempts) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    return false;
  }

  loginAttempts.set(email, {
    count: attempts.count + 1,
    lastAttempt: now,
  });

  return true;
}

export async function POST(request: NextRequest) {
  console.log('login inicia'); 
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      console.log('falla para vlidar', validation.error.issues);
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    console.log(`intento de loggearse de: ${email}`);

    if (!checkRateLimit(email)) {
      console.log('muchos intentos :/');
      return NextResponse.json(
        { error: 'Demasiados intentos. Intente más tarde.' },
        { status: 429 }
      );
    }

    console.log('query');
    const result = await query(
      `SELECT p.person_id, p.name_p, p.ap_pat, p.ap_mat,
              up.email, up.password, up.is_admin
       FROM user_pass up
       JOIN personas p ON up.person_id = p.person_id
       WHERE up.email = $1`,
      [email]
    );

    console.log(`Hay ${result.rows.length} usuarios `);

    if (result.rows.length === 0) {
      console.log('no está ese usuario');
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos (Usuario no existe)' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    console.log('checando contraseña');
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`contraseña:: ${isValidPassword ? 'correcta' : 'incorrecta'}`);

    if (!isValidPassword) {
      console.log('contrasña equivocada');
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    loginAttempts.delete(email);

    console.log('login si');
    const token = await createToken({
      userId: user.person_id,
      email: user.email,
      isAdmin: user.is_admin,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.person_id,
        email: user.email,
        name: `${user.name_p} ${user.ap_pat} ${user.ap_mat || ''}`.trim(),
        isAdmin: user.is_admin,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al iniciar sesión', details: error.message },
      { status: 500 }
    );
  }
}