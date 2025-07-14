import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    
    if (!fileUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Supabase Storage URL인지 확인 (보안)
    if (!fileUrl.includes(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    
    // HTML 파일 가져오기
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }
    
    const htmlContent = await response.text();
    
    // HTML로 응답 (Content-Type 설정)
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        // CSP를 느슨하게 설정하여 대부분의 HTML 콘텐츠가 작동하도록 함
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https: http:; img-src * data: blob:; media-src * data: blob:; font-src * data:;",
      },
    });
  } catch (error) {
    console.error('Preview error:', error);
    
    // 에러 시 사용자 친화적인 HTML 페이지 반환
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>미리보기 오류</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f3f4f6;
          }
          .error-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 {
            color: #ef4444;
            margin-bottom: 1rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 1.5rem;
          }
          button {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          }
          button:hover {
            background-color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>미리보기 오류</h1>
          <p>HTML 파일을 불러올 수 없습니다.</p>
          <button onclick="window.close()">창 닫기</button>
        </div>
      </body>
      </html>
    `;
    
    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
}