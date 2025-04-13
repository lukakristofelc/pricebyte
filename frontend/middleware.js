import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the path of the request
  const path = request.nextUrl.pathname;

  // Define which paths are considered public (don't require authentication)
  const isPublicPath = path === '/auth/login' || 
                       path === '/auth/register' || 
                       path === '/auth/forgot-password';

  // Get the token from cookies
  const token = request.cookies.get('token')?.value || '';

  // If trying to access a protected route without authentication
  if (!token && !isPublicPath) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If already logged in but trying to access auth pages
  if (token && isPublicPath) {
    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure which paths this middleware applies to
export const config = {
  matcher: [
    // Apply to root path
    '/',
    // Apply to routes requiring auth check (can add more as needed)
    '/dashboard/:path*',
    '/recipes/:path*', 
    '/shopping-list/:path*',
    '/pantry/:path*',
    // Apply to auth routes
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ],
};