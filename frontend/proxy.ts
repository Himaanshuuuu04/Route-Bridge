import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Read the token cookie set by the backend
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/signin'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // All other routes are protected (screener is excluded by matcher)
  const isProtectedRoute = !isPublicRoute;

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

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|screener).*)',
  ],
};
