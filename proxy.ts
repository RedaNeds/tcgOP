import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth((req) => {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';
    const isAppSubdomain = hostname.startsWith('app.');

    if (isAppSubdomain && !url.pathname.startsWith('/app')) {
        const newUrl = new URL(`/app${url.pathname}`, req.url);
        return NextResponse.rewrite(newUrl);
    }

    return;
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|ico|svg|webp|jpg|jpeg)$|manifest\\.json|sw\\.js).*)'],
};
