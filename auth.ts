import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import {fetchUserByEmail} from '@/app/lib/api'

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6)
          })
          .safeParse(credentials)
        if (parsedCredentials.success) {
          const {email, password} = parsedCredentials.data
          const user = await fetchUserByEmail(email)
          if (!user) {
            return null
          }
          const passwordsMatch = password === user.password || await bcrypt.compare(password, user.password)
          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              hourlywages: user.hourlywages,
              currency: user.currency,
              taxincluded: user.taxincluded,
            }
          }
        }
        console.log('Invalid user')
        return null
      }
  }),
]
});
