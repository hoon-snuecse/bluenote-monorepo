'use client';

export default function TestSimplePage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">간단한 테스트 페이지</h1>
      <p>이 페이지가 보이면 라우팅은 정상입니다.</p>
      <div className="mt-8 p-4 bg-blue-100 rounded">
        <p>테스트 메시지</p>
      </div>
    </div>
  );
}