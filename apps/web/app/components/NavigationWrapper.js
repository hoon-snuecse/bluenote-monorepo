import dynamic from 'next/dynamic';

const Navigation = dynamic(() => import('./Navigation'), {
  ssr: false,
  loading: () => (
    <div className="h-16 bg-white shadow-sm">
      {/* Navigation placeholder during loading */}
    </div>
  ),
});

export default Navigation;