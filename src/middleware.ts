import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userCookie = request.cookies.get('user');
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/signup');
    
    // Debug logging
    console.log('Current path:', request.nextUrl.pathname);
    console.log('User cookie exists:', !!userCookie);
    console.log('Is auth page:', isAuthPage);

    if (userCookie && isAuthPage) {
        console.log('Redirecting to home from auth page');
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (!userCookie && request.nextUrl.pathname.startsWith('/profile')) {
        console.log('Redirecting to login from protected route');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/profile/:path*',
        '/login',
        '/signup'
    ],
};