import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const template = await prisma.evaluationTemplate.findUnique({
      where: { id: params.templateId },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 비공개 템플릿인 경우 소유자만 접근 가능
    if (!template.isPublic && template.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      template: {
        ...template,
        evaluationDomains: template.evaluationDomains as string[],
        evaluationLevels: template.evaluationLevels as string[]
      }
    })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: '템플릿 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}