import { Shield } from 'lucide-react';

export const metadata = {
  title: '관리자 대시보드',
  description: 'BlueNote Atelier 관리자 페이지',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 text-white border-b border-slate-700 pt-2.5">
        <div className="container-custom py-6">
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-slate-300 mt-1">BlueNote Atelier 시스템 관리</p>
        </div>
      </div>
      
      <div className="container-custom py-8">
        {children}
      </div>
    </div>
  );
}