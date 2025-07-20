import { Shield } from 'lucide-react';

export const metadata = {
  title: '관리자 대시보드',
  description: 'BlueNote Atelier 관리자 페이지',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container-custom py-8">
        {children}
      </div>
    </div>
  );
}