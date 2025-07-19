import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  
  return NextResponse.json({
    message: 'This endpoint tests if middleware is working',
    path: url.pathname,
    searchParams: Object.fromEntries(url.searchParams),
    headers: {
      cookie: request.headers.get('cookie')?.substring(0, 100) + '...',
      referer: request.headers.get('referer'),
      host: request.headers.get('host')
    },
    timestamp: new Date().toISOString()
  });
}