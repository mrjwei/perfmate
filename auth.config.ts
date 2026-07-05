import type {NextAuthConfig} from 'next-auth';

export const authConfig = {
  // Vercel preview deployments get a new host per build, which NextAuth
  // doesn't trust by default. Safe to trust broadly here since the app is
  // only ever deployed behind Vercel's own routing, not user-supplied hosts.
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  session: {
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({user, token, trigger}) {
      if ((trigger === "update" && user) || user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({session, token}) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    }
  },
  providers: []
} satisfies NextAuthConfig;
