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
        token.hourlywages = user.hourlywages
        token.currency = user.currency
        token.taxincluded = user.taxincluded
      }
      return token
    },
    async session({session, token}) {
      session.user.id = token.id as string
      session.user.hourlywages = token.hourlywages as number
      session.user.currency = token.currency as string
      session.user.taxincluded = token.taxincluded as boolean
      return session
    }
  },
  providers: []
} satisfies NextAuthConfig;
