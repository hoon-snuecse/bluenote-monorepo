import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { AppLayout } from '@/components/Layout/AppLayout'
import DomainChecker from '@/components/DomainChecker'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const notoSansKR = Noto_Sans_KR({ 
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  weight: ['400', '500', '700']
})

export const metadata = {
  title: 'Kahoot 퀴즈 메이커 | 교사를 위한 AI 퀴즈 생성 플랫폼',
  description: 'AI의 도움을 받아 Kahoot용 퀴즈를 쉽게 만들고, 교사 커뮤니티에서 공유하세요.',
  keywords: ['Kahoot', '퀴즈', '교육', 'AI', '교사', '문제생성'],
  openGraph: {
    title: 'Kahoot 퀴즈 메이커',
    description: 'AI 기반 Kahoot 퀴즈 생성 플랫폼',
    url: 'https://quiz.bluenote.site',
    siteName: 'Kahoot 퀴즈 메이커',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <body className="font-sans antialiased">
        <DomainChecker />
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  )
}