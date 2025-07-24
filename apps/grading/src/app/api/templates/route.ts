import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const isPublic = searchParams.get('public') === 'true';
    const userOnly = searchParams.get('userOnly') === 'true';

    let whereClause: any = {};
    
    if (userOnly) {
      whereClause.createdBy = session.user.id;
    } else if (!isPublic) {
      whereClause = {
        OR: [
          { createdBy: session.user.id },
          { isPublic: true }
        ]
      };
    } else {
      whereClause.isPublic = true;
    }

    const templates = await prisma.evaluationTemplate.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // PostgreSQL JSON 타입은 이미 파싱되어 있음
    const formattedTemplates = templates.map(template => ({
      ...template,
      evaluationDomains: template.evaluationDomains as string[],
      evaluationLevels: template.evaluationLevels as string[]
    }));
    
    return NextResponse.json({ success: true, templates: formattedTemplates });
  } catch (error) {
    console.error('템플릿 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '템플릿 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // 새 템플릿 생성
    const newTemplate = await prisma.evaluationTemplate.create({
      data: {
        name: data.name,
        description: data.description || '',
        writingType: data.writingType,
        gradeLevel: data.gradeLevel,
        evaluationDomains: data.evaluationDomains,
        evaluationLevels: data.evaluationLevels,
        levelCount: data.levelCount,
        gradingCriteria: data.gradingCriteria,
        isPublic: data.isPublic || false,
        createdBy: session.user.id
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    // PostgreSQL JSON 타입은 이미 파싱되어 있음
    const formattedTemplate = {
      ...newTemplate,
      evaluationDomains: newTemplate.evaluationDomains as string[],
      evaluationLevels: newTemplate.evaluationLevels as string[]
    };
    
    return NextResponse.json({ success: true, template: formattedTemplate });
  } catch (error) {
    console.error('템플릿 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '템플릿 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { success: false, error: '템플릿 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 권한 확인
    const existingTemplate = await prisma.evaluationTemplate.findUnique({
      where: { id: data.id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingTemplate.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '수정 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 기존 템플릿 업데이트
    const updatedTemplate = await prisma.evaluationTemplate.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        writingType: data.writingType,
        gradeLevel: data.gradeLevel,
        evaluationDomains: data.evaluationDomains,
        evaluationLevels: data.evaluationLevels,
        levelCount: data.levelCount,
        gradingCriteria: data.gradingCriteria,
        isPublic: data.isPublic
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    // PostgreSQL JSON 타입은 이미 파싱되어 있음
    const formattedTemplate = {
      ...updatedTemplate,
      evaluationDomains: updatedTemplate.evaluationDomains as string[],
      evaluationLevels: updatedTemplate.evaluationLevels as string[]
    };
    
    return NextResponse.json({ success: true, template: formattedTemplate });
  } catch (error) {
    console.error('템플릿 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '템플릿 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '템플릿 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 권한 확인
    const existingTemplate = await prisma.evaluationTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingTemplate.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    await prisma.evaluationTemplate.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: '템플릿이 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('템플릿 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '템플릿 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}