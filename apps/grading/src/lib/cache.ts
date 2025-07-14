import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

// Cache assignment data for 5 minutes
export const getCachedAssignment = unstable_cache(
  async (assignmentId: string) => {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        title: true,
        schoolName: true,
        gradeLevel: true,
        writingType: true,
        evaluationDomains: true,
        evaluationLevels: true,
        levelCount: true,
        gradingCriteria: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!assignment) return null;
    
    return {
      ...assignment,
      evaluationDomains: JSON.parse(assignment.evaluationDomains),
      evaluationLevels: JSON.parse(assignment.evaluationLevels)
    };
  },
  ['assignment'],
  {
    revalidate: 300, // 5 minutes
    tags: ['assignment']
  }
);

// Cache evaluation statistics for 1 minute
export const getCachedEvaluationStats = unstable_cache(
  async (assignmentId: string) => {
    const [totalSubmissions, totalEvaluations, evaluations] = await Promise.all([
      prisma.submission.count({
        where: { assignmentId }
      }),
      prisma.evaluation.count({
        where: { assignmentId }
      }),
      prisma.evaluation.findMany({
        where: { assignmentId },
        select: {
          overallLevel: true,
          domainEvaluations: true
        }
      })
    ]);
    
    // Calculate level distribution
    const levelDistribution = evaluations.reduce((acc, eval) => {
      acc[eval.overallLevel] = (acc[eval.overallLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalSubmissions,
      totalEvaluations,
      levelDistribution,
      completionRate: totalSubmissions > 0 ? (totalEvaluations / totalSubmissions) * 100 : 0
    };
  },
  ['evaluation-stats'],
  {
    revalidate: 60, // 1 minute
    tags: ['evaluations']
  }
);

// Cache user assignments list for 2 minutes
export const getCachedUserAssignments = unstable_cache(
  async (userId: string) => {
    const assignments = await prisma.assignment.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        schoolName: true,
        gradeLevel: true,
        writingType: true,
        evaluationDomains: true,
        evaluationLevels: true,
        levelCount: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true
          }
        }
      }
    });
    
    return assignments.map(assignment => ({
      ...assignment,
      evaluationDomains: JSON.parse(assignment.evaluationDomains),
      evaluationLevels: JSON.parse(assignment.evaluationLevels),
      submissionCount: assignment._count.submissions
    }));
  },
  ['user-assignments'],
  {
    revalidate: 120, // 2 minutes
    tags: ['assignments']
  }
);

// Function to invalidate caches when data changes
export async function invalidateAssignmentCache(assignmentId?: string) {
  const { revalidateTag } = await import('next/cache');
  
  revalidateTag('assignments');
  if (assignmentId) {
    revalidateTag(`assignment-${assignmentId}`);
  }
}

export async function invalidateEvaluationCache(assignmentId?: string) {
  const { revalidateTag } = await import('next/cache');
  
  revalidateTag('evaluations');
  if (assignmentId) {
    revalidateTag(`evaluation-stats-${assignmentId}`);
  }
}