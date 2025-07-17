import type { Metadata } from "next";
import { Inter, Space_Grotesk, Gowun_Dodum } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationContainer } from "@/components/NotificationContainer";
import UnifiedNavigation from "@/components/UnifiedNavigation";
import { DevAutoLogin } from "@/components/DevAutoLogin";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gowun-dodum",
  display: "swap",
});

export const metadata: Metadata = {
  title: "학생 평가 보고서",
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
    <html lang="ko" className={`${inter.variable} ${spaceGrotesk.variable} ${gowunDodum.variable}`}>
      <body
        className={`${gowunDodum.className} antialiased`}
      >
        <UserProvider>
          <NotificationProvider>
            <DevAutoLogin />
            <UnifiedNavigation />
            <NotificationContainer />
            {children}
          </NotificationProvider>
        </UserProvider>
      </body>
    </html>
  );
}
