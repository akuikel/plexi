import { NextResponse } from 'next/server';

export async function GET() {
  const requiredVars = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_BASE_URL',
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);
  const present = requiredVars.filter((varName) => !!process.env[varName]);

  console.log('Environment check:');
  console.log('Present variables:', present);
  console.log('Missing variables:', missing);

  return NextResponse.json({
    present,
    missing,
    allSet: missing.length === 0,
  });
}
