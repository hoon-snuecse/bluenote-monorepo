import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.evaluationTemplate.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    // JSON 문자열 파싱
    const formattedTemplates = templates.map(template => ({
      ...template,
      evaluationDomains: JSON.parse(template.evaluationDomains),
      evaluationLevels: JSON.parse(template.evaluationLevels)
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
    const data = await request.json();
    
    // 새 템플릿 생성
    const newTemplate = await prisma.evaluationTemplate.create({
      data: {
        name: data.name,
        description: data.description || '',
        writingType: data.writingType,
        evaluationDomains: JSON.stringify(data.evaluationDomains),
        evaluationLevels: JSON.stringify(data.evaluationLevels),
        levelCount: data.levelCount,
        gradingCriteria: data.gradingCriteria
      }
    });
    
    // JSON 문자열 파싱하여 반환
    const formattedTemplate = {
      ...newTemplate,
      evaluationDomains: JSON.parse(newTemplate.evaluationDomains),
      evaluationLevels: JSON.parse(newTemplate.evaluationLevels)
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
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { success: false, error: '템플릿 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 기존 템플릿 업데이트
    const updatedTemplate = await prisma.evaluationTemplate.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        writingType: data.writingType,
        evaluationDomains: JSON.stringify(data.evaluationDomains),
        evaluationLevels: JSON.stringify(data.evaluationLevels),
        levelCount: data.levelCount,
        gradingCriteria: data.gradingCriteria
      }
    });
    
    // JSON 문자열 파싱하여 반환
    const formattedTemplate = {
      ...updatedTemplate,
      evaluationDomains: JSON.parse(updatedTemplate.evaluationDomains),
      evaluationLevels: JSON.parse(updatedTemplate.evaluationLevels)
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '템플릿 ID가 필요합니다.' },
        { status: 400 }
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