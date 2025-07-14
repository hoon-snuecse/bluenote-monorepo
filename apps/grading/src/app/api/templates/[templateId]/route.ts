import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'data', 'templates');

export async function DELETE(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const filePath = path.join(TEMPLATES_DIR, `${params.templateId}.json`);
    
    // 파일 존재 확인
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { success: false, error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 템플릿 삭제
    await fs.unlink(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('템플릿 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '템플릿 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}