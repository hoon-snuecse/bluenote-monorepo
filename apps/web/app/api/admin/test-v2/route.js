import { NextResponse } from 'next/server';

export async function GET() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const results = {
    env: {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_ANON_KEY
    }
  };

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      
      const url = `${SUPABASE_URL}/rest/v1/daily_stats?select=*&date=gte.${weekAgo.toISOString().split('T')[0]}&order=date.asc`;
      results.request = { url };
      
      const res = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      results.response = {
        status: res.status,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      };

      if (res.ok) {
        const data = await res.json();
        results.data = data;
        results.count = data.length;
      } else {
        results.error = await res.text();
      }
    } catch (error) {
      results.error = error.message;
    }
  }

  return NextResponse.json(results);
}