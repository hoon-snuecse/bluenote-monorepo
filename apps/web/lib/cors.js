// CORS 미들웨어 유틸리티
export const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

export function getCorsHeaders(origin) {
  const allowedOrigins = [
    'https://grading.bluenote.site',
    'https://quiz.bluenote.site',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    return {
      ...corsHeaders,
      'Access-Control-Allow-Origin': origin,
    };
  }

  return {};
}

export function withCors(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;
    const headers = getCorsHeaders(origin);
    
    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      return res.status(200).end();
    }

    // 일반 요청에 CORS 헤더 추가
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return handler(req, res);
  };
}