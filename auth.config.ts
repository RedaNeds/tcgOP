import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;
            
            // Define areas of the application
            const isDashboard = pathname.startsWith('/app');
            const isAuthPage = pathname === '/login' || pathname === '/register';
            const isApiRoute = pathname.startsWith('/api/');

            // Landing Page & Public Routes
            if (!isDashboard && !isAuthPage && !isApiRoute) {
                // If logged in on the landing page, suggest going to the app
                if (isLoggedIn && pathname === '/') {
                    return Response.redirect(new URL('/app', nextUrl));
                }
                return true;
            }

            // API Routes: Usually public or handle their own auth
            if (isApiRoute) return true;

            // Auth Pages (Login/Register): Redirect to app if already logged in
            if (isAuthPage) {
                if (isLoggedIn) return Response.redirect(new URL('/app', nextUrl));
                return true;
            }

            // Dashboard: Requires authentication
            if (isDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirects to signIn page defined above
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    providers: [], // Add providers with an empty array for now
    session: { strategy: 'jwt' },
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    basePath: "/api/auth",
} satisfies NextAuthConfig;
