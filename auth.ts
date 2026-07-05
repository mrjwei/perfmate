import NextAuth from 'next-auth';
import type {User} from 'next-auth'
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { fetchUserAuthByEmail } from '@/app/lib/api'

export const { auth, signIn, signOut, handlers } = NextAuth({
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
          const user = await fetchUserAuthByEmail(email)
          if (!user) {
            return null
          }
          let passwordsMatch = false
          try {
            passwordsMatch = await bcrypt.compare(password, user.password)
          } catch {
            // Treat any malformed/legacy stored password as a failed login.
            passwordsMatch = false
          }
          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            } as User
          }
        }
        console.log('Invalid user')
        return null
      }
  }),
]
});
