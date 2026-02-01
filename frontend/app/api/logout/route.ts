import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Sign out from Supabase
    const supabase = getSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (e) {
    console.error('Logout error:', e);
  }

  const res = NextResponse.redirect(new URL('/login', request.url));
  
  // Clear all session cookies
  res.cookies.set({ name: 'session', value: '', path: '/', maxAge: 0 });
  res.cookies.set({ name: 'sb-access-token', value: '', path: '/', maxAge: 0 });
  res.cookies.set({ name: 'sb-refresh-token', value: '', path: '/', maxAge: 0 });
  
  return res;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (e) {
    console.error('Logout error:', e);
  }

  const res = NextResponse.redirect(new URL('/login', request.url));
  
  // Clear all session cookies
  res.cookies.set({ name: 'session', value: '', path: '/', maxAge: 0 });
  res.cookies.set({ name: 'sb-access-token', value: '', path: '/', maxAge: 0 });
  res.cookies.set({ name: 'sb-refresh-token', value: '', path: '/', maxAge: 0 });
  
  return res;
}
