import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine the correct URL based on environment
    const gradingApiUrl = process.env.NODE_ENV === 'production'
      ? 'https://grading.bluenote.site/api/stats/users'
      : 'http://localhost:3002/api/stats/users';

    console.log('Fetching grading user stats from:', gradingApiUrl);

    const response = await fetch(gradingApiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch grading user stats:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch grading user stats' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching grading user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}