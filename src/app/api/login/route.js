import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.AUTHORIZED_USERNAME;
    const validPassword = process.env.AUTHORIZED_PASSWORD;

    if (username === validUsername && password === validPassword) {
      const response = NextResponse.json(
        { success: true, message: 'Login successful' },
        { status: 200 }
      );

      // Set a secure session cookie (non-httpOnly to allow client-side cleanup on reload)
      response.cookies.set('auth-token', 'estimator_authorized_session', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
