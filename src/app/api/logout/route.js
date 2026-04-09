import { NextResponse } from 'next/server';

export async function GET() {
  // Create a redirect response to the login page
  const response = NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_ESTIMATOR_URL || 'http://localhost:3000'),
    { status: 302 }
  );

  // Clear the auth-token cookie server-side before redirecting
  response.cookies.set('auth-token', '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}

export async function POST() {
  // Also support POST for logout buttons
  const response = NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_ESTIMATOR_URL || 'http://localhost:3000'),
    { status: 302 }
  );

  response.cookies.set('auth-token', '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
