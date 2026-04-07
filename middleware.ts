import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth(() => {
    return;
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|ico|svg|webp|jpg|jpeg)$|manifest\\.json|sw\\.js).*)'],
};
