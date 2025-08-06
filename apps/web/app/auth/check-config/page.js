export default function CheckConfigPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Configuration Check</h1>
      
      <div className="space-y-6">
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <h2 className="font-bold mb-2 text-yellow-800">중요: Supabase Dashboard 설정 확인</h2>
          <p className="text-sm mb-3">Supabase Dashboard에서 다음 설정을 확인해주세요:</p>
          
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Authentication → URL Configuration</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Site URL: <code className="bg-gray-100 px-1">https://www.bluenote.site</code></li>
                <li>Redirect URLs에 다음 추가:
                  <ul className="list-disc list-inside ml-4">
                    <li><code className="bg-gray-100 px-1">https://www.bluenote.site/auth/callback</code></li>
                    <li><code className="bg-gray-100 px-1">https://quiz.bluenote.site/auth/callback</code></li>
                    <li><code className="bg-gray-100 px-1">https://grading.bluenote.site/auth/callback</code></li>
                  </ul>
                </li>
              </ul>
            </li>
            
            <li className="mt-4">
              <strong>Google OAuth 설정 (Google Cloud Console)</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Authorized redirect URIs에 다음 추가:
                  <ul className="list-disc list-inside ml-4">
                    <li><code className="bg-gray-100 px-1">https://ukxchcyvxnbmsfrsamjk.supabase.co/auth/v1/callback</code></li>
                  </ul>
                </li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">현재 설정</h2>
          <pre className="text-sm">
{`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'}`}
          </pre>
        </div>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h2 className="font-bold mb-2 text-blue-800">문제 해결</h2>
          <p className="text-sm mb-2">현재 발생하는 문제:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>OAuth 콜백이 <code>/auth/callback</code> 대신 <code>/</code>로 리다이렉트됨</li>
            <li>이는 Supabase의 Site URL이 <code>https://www.bluenote.site</code>로만 설정되어 있을 때 발생</li>
            <li>해결: Redirect URLs에 callback URL들을 명시적으로 추가</li>
          </ul>
        </div>
      </div>
    </div>
  );
}