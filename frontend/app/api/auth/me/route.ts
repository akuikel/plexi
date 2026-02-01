import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.json({ user: null, error: 'Supabase not configured' }, { status: 500 });
    }

    // Create a client with the user's session
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

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      // Try to refresh the token
      if (refreshToken) {
        const refreshClient = getSupabaseServerClient();
        const { data: refreshData, error: refreshError } = await refreshClient.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (!refreshError && refreshData.session) {
          const refreshedUser = refreshData.user;
          const metadata = refreshedUser?.user_metadata || {};

          const res = NextResponse.json({
            user: {
              id: refreshedUser?.id,
              email: refreshedUser?.email,
              name: metadata.name || metadata.full_name || null,
              role: metadata.role || 'USER',
              phone: metadata.phone || null,
              location: metadata.location || null,
              bio: metadata.bio || null,
              profileUrl: metadata.avatar_url || null,
            },
          });

          // Update cookies with new tokens
          res.cookies.set({
            name: 'sb-access-token',
            value: refreshData.session.access_token,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
          });

          res.cookies.set({
            name: 'sb-refresh-token',
            value: refreshData.session.refresh_token,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
          });

          return res;
        }
      }

      return NextResponse.json({ user: null }, { status: 401 });
    }

    const metadata = user.user_metadata || {};

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: metadata.name || metadata.full_name || null,
        role: metadata.role || 'USER',
        phone: metadata.phone || null,
        location: metadata.location || null,
        bio: metadata.bio || null,
        profileUrl: metadata.avatar_url || null,
      },
    });
  } catch (error) {
    console.error('Auth verification failed:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
