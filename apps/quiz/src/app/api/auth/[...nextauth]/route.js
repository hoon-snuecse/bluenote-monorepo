import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@/lib/supabase'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const supabase = createClient()
        
        // Check if user exists in database
        const { data: existingUser, error: selectError } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('Error checking user:', selectError)
          return false
        }

        if (!existingUser) {
          // Create new user
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: profile.sub,
              email: user.email,
              name: user.name,
              image: user.image,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error('Error creating user:', insertError)
            return false
          }
        }

        return true
      }
      return false
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.picture
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined,
      },
    },
  },
})

export { handler as GET, handler as POST }