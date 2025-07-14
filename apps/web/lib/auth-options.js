import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 모든 Google 로그인 허용
      return true;
    },
    async session({ session, token }) {
      // 세션에 추가 정보 포함
      if (session?.user) {
        session.user.id = token.sub || token.id;
        session.user.isAdmin = token.isAdmin || false;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // 관리자 이메일 확인 - JWT에도 저장
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
        token.isAdmin = adminEmails.includes(user.email);
      }
      // 기존 token의 isAdmin 값이 없으면 재확인
      if (token.email && token.isAdmin === undefined) {
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
        token.isAdmin = adminEmails.includes(token.email);
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
};