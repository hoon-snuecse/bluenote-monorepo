export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - 페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-4">요청하신 페이지가 채점 시스템에 존재하지 않습니다.</p>
        <a href="/" className="text-blue-600 hover:underline">홈페이지로 이동</a>
      </div>
    </div>
  );
}