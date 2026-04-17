import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { email, password, name, username } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          name: name || null,
          username: username || email.split('@')[0],
          role: 'USER',
        },
      },
    });

    if (error) {
      console.error('Signup error:', error.message);
      
      // Handle common errors
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
      
      return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 400 });
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return NextResponse.json({
        ok: true,
        message: 'Please check your email to confirm your account',
        requiresConfirmation: true,
      });
    }

    if (!data.session) {
      return NextResponse.json({ error: 'Signup failed - no session' }, { status: 400 });
    }

    const user = data.user;
    const metadata = user?.user_metadata || {};

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user?.id,
        email: user?.email,
        name: metadata.name || null,
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
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set({
      name: 'sb-refresh-token',
      value: data.session.refresh_token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e: any) {
    console.error('SIGNUP ERROR:', e);
    const msg = process.env.NODE_ENV === 'development' ? e?.message || 'Server error' : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
