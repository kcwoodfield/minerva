import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const USERNAME = process.env.AUTH_USERNAME || 'admin';
const PASSWORD = process.env.AUTH_PASSWORD || 'minerva';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === USERNAME && password === PASSWORD) {
    // Set a session cookie
    cookies().set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, message: 'Invalid credentials' },
    { status: 401 }
  );
}

export async function GET() {
  const auth = cookies().get('auth');
  return NextResponse.json({ authenticated: !!auth });
}

export async function DELETE() {
  cookies().delete('auth');
  return NextResponse.json({ success: true });
}