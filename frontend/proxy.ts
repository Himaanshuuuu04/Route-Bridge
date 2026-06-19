import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Read the token cookie set by the backend
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/signin', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // 1. Redirect to dashboard if logged in and trying to access public routes (like signin/signup/landing)
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Redirect to signin if logged out and trying to access protected routes
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to only run on specific paths to optimize performance
export const config = {
  matcher: [
    '/',
    '/signin',
    '/signup',
    '/dashboard/:path*'
  ],
};
