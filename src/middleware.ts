import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const user = request.cookies.get('user');
    
    // Public paths that don't require authentication
    const publicPaths = ['/login', '/signup'];
    
    // Check if the current path is public
    const isPublicPath = publicPaths.some(path => 
        request.nextUrl.pathname.startsWith(path)
    );

    // If the path is public and user is logged in, redirect to home
    if (isPublicPath && user) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If the path is not public and user is not logged in, redirect to login
    if (!isPublicPath && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Add CORS headers
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};