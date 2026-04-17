import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return NextResponse.json({ error: error.message || 'Invalid credentials' }, { status: 401 });
    }

    if (!data.session) {
      return NextResponse.json({ error: 'No session returned' }, { status: 401 });
    }

    // Get user metadata
    const user = data.user;
    const metadata = user?.user_metadata || {};

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user?.id,
        email: user?.email,
        name: metadata.name || metadata.full_name || null,
        role: metadata.role || 'USER',
      },
    });

    // Set Supabase session tokens as cookies
    res.cookies.set({
      name: 'sb-access-token',
      value: data.session.access_token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    res.cookies.set({
      name: 'sb-refresh-token',
      value: data.session.refresh_token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (e: any) {
    console.error('LOGIN ERROR:', e);
    const msg = process.env.NODE_ENV === 'development' ? e?.message || 'Server error' : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
