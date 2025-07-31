import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationContainer } from "@/components/NotificationContainer";
import { Navigation } from "@/components/Navigation";
import { DevAutoLogin } from "@/components/DevAutoLogin";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkErrorBoundary } from "@/components/NetworkErrorBoundary";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "글쓰기 평가 시스템",
  description: "AI 기반 글쓰기 평가 시스템",
  manifest: "/manifest.json",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <body
        className="font-sans antialiased"
      >
        <ErrorBoundary>
          <NetworkErrorBoundary>
            <Providers>
              <UserProvider>
                <NotificationProvider>
                  <DevAutoLogin />
                  <Navigation />
                  <NotificationContainer />
                  {children}
                  <FeedbackWidget />
                </NotificationProvider>
              </UserProvider>
            </Providers>
          </NetworkErrorBoundary>
        </ErrorBoundary>
      </body>
    </html>
  );
}
