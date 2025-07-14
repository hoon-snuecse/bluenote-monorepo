// app/components/Footer.js
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-white py-12 mt-16">
      <div className="container-custom">
        <div className="text-center">
          {/* 로고와 사이트명 */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              ♭
            </div>
            <h3 className="text-xl font-space-grotesk font-semibold">BlueNote Atelier</h3>
          </div>
          
          {/* 슬로건 */}
          <p className="text-gray-300 mb-8">Where Ideas Come to Life</p>
          
          {/* 메뉴 링크 */}
          <div className="flex justify-center gap-6 mb-8 text-sm">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              홈
            </Link>
            <Link href="/activities" className="text-gray-300 hover:text-white transition-colors">
              활동
            </Link>
            <Link href="/research" className="text-gray-300 hover:text-white transition-colors">
              연구
            </Link>
            <Link href="/teaching" className="text-gray-300 hover:text-white transition-colors">
              교육
            </Link>
            <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">
              분석
            </Link>
            <Link href="/shed" className="text-gray-300 hover:text-white transition-colors">
              일상
            </Link>
          </div>
          
          {/* 저작권 */}
          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-400 text-sm">
              © {currentYear} BlueNote Atelier. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Built with Next.js • Powered by imagination
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}