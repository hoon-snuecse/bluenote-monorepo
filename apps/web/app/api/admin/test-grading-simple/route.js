import { NextResponse } from 'next/server';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // 1. 직접 fetch 테스트
  try {
    console.log('Starting direct fetch test...');
    const response = await fetch('https://grading.bluenote.site/api/stats');
    
    results.tests.push({
      name: 'Direct fetch',
      success: true,
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (response.ok) {
      const data = await response.json();
      results.tests[0].data = data;
    }
  } catch (error) {
    console.error('Direct fetch failed:', error);
    results.tests.push({
      name: 'Direct fetch',
      success: false,
      error: error.message,
      stack: error.stack
    });
  }

  // 2. User-Agent 포함 테스트
  try {
    console.log('Starting fetch with User-Agent...');
    const response = await fetch('https://grading.bluenote.site/api/stats', {
      headers: {
        'User-Agent': 'Bluenote-Web/1.0',
        'Accept': 'application/json'
      }
    });
    
    results.tests.push({
      name: 'Fetch with User-Agent',
      success: true,
      status: response.status,
      ok: response.ok
    });

    if (response.ok) {
      const data = await response.json();
      results.tests[1].data = data;
    }
  } catch (error) {
    console.error('User-Agent fetch failed:', error);
    results.tests.push({
      name: 'Fetch with User-Agent',
      success: false,
      error: error.message
    });
  }

  return NextResponse.json(results);
}