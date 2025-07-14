import { Shield } from 'lucide-react';

export const metadata = {
  title: '관리자 대시보드',
  description: 'BlueNote Atelier 관리자 페이지',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
        <div className="container-custom py-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">관리자 대시보드</h1>
              <p className="text-slate-300 text-sm">BlueNote Atelier 시스템 관리</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container-custom py-8">
        {children}
      </div>
    </div>
  );
}