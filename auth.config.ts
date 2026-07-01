import type {NextAuthConfig} from 'next-auth';

export const authConfig = {
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
      }
      return token
    },
    async session({session, token}) {
      session.user.id = token.id as string
      return session
    }
  },
  providers: []
} satisfies NextAuthConfig;
