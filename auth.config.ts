import type { NextAuthConfig } from 'next-auth';
import {NextResponse} from 'next/server'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async authorized({auth, request}) {
      const isLoggedIn = !!auth?.user
      const isOnApp = request.nextUrl.pathname.startsWith('/app')
      if (isOnApp) {
        if (isLoggedIn) {
          return true
        }
        return false
      } else if (isLoggedIn) {
        return NextResponse.rewrite(new URL('/app', request.nextUrl))
      }
      return true
    },
  },
  providers: []
} satisfies NextAuthConfig;
