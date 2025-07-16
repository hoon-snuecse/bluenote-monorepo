import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const evaluation = await prisma.evaluation.findFirst({
      where: {
        submissionId: params.submissionId
      },
      orderBy: {
        evaluatedAt: 'desc'
      }
    });

    if (!evaluation) {
      return NextResponse.json(
        { success: false, error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch evaluation' },
      { status: 500 }
    );
  }
}