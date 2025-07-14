import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Use admin client for auth checks (bypasses RLS)
        const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
          ? createAdminClient() 
          : await createClient();
        
        // Check if user is in the allowed users table
        const { data, error } = await supabase
          .from('user_permissions')
          .select('email')
          .eq('email', user.email)
          .single();
        
        // If user is not found in permissions table, deny access
        if (error || !data) {
          console.log(`Login denied for ${user.email} - not in allowed users`);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          // Use admin client for auth checks (bypasses RLS)
          const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
            ? createAdminClient() 
            : await createClient();
          
          // Get user permissions from Supabase
          const { data, error } = await supabase
            .from('user_permissions')
            .select('role, can_write, claude_daily_limit')
            .eq('email', user.email)
            .single();
          
          if (!error && data) {
            token.isAdmin = data.role === 'admin';
            token.canWrite = data.can_write;
            token.claudeDailyLimit = data.claude_daily_limit;
            token.userRole = data.role;
          } else {
            // Fallback to env variable for backward compatibility
            const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || ['hoon@snuecse.org'];
            token.isAdmin = adminEmails.includes(user.email);
            token.canWrite = token.isAdmin;
            token.claudeDailyLimit = token.isAdmin ? 999999 : 3;
            token.userRole = token.isAdmin ? 'admin' : 'user';
          }
        } catch (error) {
          console.error('Error fetching user permissions:', error);
          // Fallback values
          token.isAdmin = false;
          token.canWrite = false;
          token.claudeDailyLimit = 0;
          token.userRole = 'user';
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = token.isAdmin || false;
      session.user.canWrite = token.canWrite || false;
      session.user.claudeDailyLimit = token.claudeDailyLimit || 0;
      session.user.role = token.userRole || 'user';
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};