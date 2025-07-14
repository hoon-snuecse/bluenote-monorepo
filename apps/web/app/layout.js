import './globals.css'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import Providers from './components/Providers'

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'BlueNote Atelier | Where Ideas Come to Life',
    template: '%s | BlueNote Atelier'
  },
  description: '미완성된 생각들이 살아 숨쉬는 공간. 교육연구와 일상의 창조적 작업이 만나는 곳.',
  keywords: [
    'BlueNote Atelier', 
    '교육연구', 
    '연구실적',
    '교육평가',
    'SNA', 
    '사회네트워크분석',
    '데이터분석',
    '창조적작업'
  ],
  authors: [{ name: 'BlueNote Atelier' }],
  creator: 'BlueNote Atelier',
  publisher: 'BlueNote Atelier',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://bluenote.site',
    title: 'BlueNote Atelier | Where Ideas Come to Life',
    description: '미완성된 생각들이 살아 숨쉬는 공간',
    siteName: 'BlueNote Atelier',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BlueNote Atelier',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlueNote Atelier | Where Ideas Come to Life',
    description: '미완성된 생각들이 살아 숨쉬는 공간',
    images: ['/images/twitter-image.jpg'],
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1e3a8a" />
      </head>
      <body className="font-inter antialiased">
        <Providers>
          <div className="relative z-10">
            {/* 네비게이션 */}
            <Navigation />
            
            {/* 메인 콘텐츠 */}
            <main>
              {children}
            </main>
            
            {/* 푸터 */}
            <Footer />
          </div>
          
          {/* 스크립트 (Google Analytics 등) */}
          <GoogleAnalytics />
        </Providers>
      </body>
    </html>
  )
}

// Google Analytics (향후 추가용)
function GoogleAnalytics() {
  // 실제 구현에서는 GA 태그 추가
  return null
}