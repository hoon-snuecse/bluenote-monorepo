import { NextResponse } from 'next/server';

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    return NextResponse.json({ error: 'Service key not found' });
  }
  
  try {
    // JWT 토큰 구조 확인 (header.payload.signature)
    const parts = serviceKey.split('.');
    
    // JWT 디코딩 (header와 payload만)
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // 민감한 정보는 제거하고 구조만 확인
    return NextResponse.json({
      keyStructure: {
        partsCount: parts.length,
        headerAlg: header.alg,
        headerTyp: header.typ,
        payloadIss: payload.iss?.substring(0, 30) + '...',
        payloadRole: payload.role,
        payloadIat: payload.iat,
        payloadExp: payload.exp,
        isServiceRole: payload.role === 'service_role',
        keyLength: serviceKey.length,
        startsWithEyJ: serviceKey.startsWith('eyJ')
      },
      expectedStructure: {
        role: 'should be "service_role"',
        alg: 'should be "HS256"',
        iss: 'should match your Supabase URL'
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid JWT format',
      details: error.message,
      keyLength: serviceKey.length,
      startsWithEyJ: serviceKey.startsWith('eyJ')
    });
  }
}