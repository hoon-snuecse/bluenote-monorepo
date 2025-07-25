import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get statistics for the dashboard
    const userId = session.user.id;
    
    const [groupCount, studentCount, recentGroups] = await Promise.all([
      prisma.studentGroup.count({
        where: { createdBy: userId }
      }),
      prisma.student.count({
        where: {
          group: {
            createdBy: userId
          }
        }
      }),
      prisma.studentGroup.findMany({
        where: { createdBy: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          _count: {
            select: { students: true }
          }
        }
      })
    ])

    return NextResponse.json({
      stats: {
        totalGroups: groupCount,
        totalStudents: studentCount
      },
      recentGroups: recentGroups.map(group => ({
        id: group.id,
        name: group.name,
        schoolName: group.schoolName,
        gradeLevel: group.gradeLevel,
        className: group.className,
        studentCount: group._count.students,
        createdAt: group.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}