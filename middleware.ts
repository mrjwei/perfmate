import NextAuth from 'next-auth';
import createMiddleware from 'next-intl/middleware';
import { authConfig } from './auth.config';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => intlMiddleware(req));

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
