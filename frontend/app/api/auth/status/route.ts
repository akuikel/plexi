import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({
        authenticated: false,
        isAdmin: false,
        user: null,
      });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.json({
        authenticated: false,
        isAdmin: false,
        user: null,
        error: 'Supabase not configured',
      });
    }

    const supabase = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const { data: { user }, error } = await Promise.race([
      supabase.auth.getUser(accessToken),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
    ]);

    if (error || !user) {
      return NextResponse.json({
        authenticated: false,
        isAdmin: false,
        user: null,
      });
    }

    const metadata = user.user_metadata || {};
    const role = metadata.role || 'USER';

    return NextResponse.json({
      authenticated: true,
      isAdmin: role === 'ADMIN',
      user: {
        id: user.id,
        email: user.email,
        name: metadata.name || metadata.full_name || null,
        role: role,
        profileUrl: metadata.avatar_url || null,
      },
    });
  } catch (error) {
    console.error('Auth status error:', error);
    return NextResponse.json({
      authenticated: false,
      isAdmin: false,
      user: null,
      error: 'Internal server error',
    });
  }
}
