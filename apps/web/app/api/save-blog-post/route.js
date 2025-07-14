import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ 
        error: '로그인이 필요합니다.' 
      }, { status: 401 });
    }

    const { content, filename } = await request.json();

    if (!content || !filename) {
      return Response.json({ 
        error: '내용과 파일명이 필요합니다.' 
      }, { status: 400 });
    }

    // 파일명 검증 (보안을 위해)
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9가-힣\-_.]/g, '-');
    
    // posts 디렉토리 경로
    const postsDir = path.join(process.cwd(), 'posts');
    
    // posts 디렉토리가 없으면 생성
    try {
      await fs.access(postsDir);
    } catch {
      await fs.mkdir(postsDir, { recursive: true });
    }

    // 파일 경로
    let filepath = path.join(postsDir, sanitizedFilename);
    
    // 파일이 이미 존재하는 경우 번호 추가
    let counter = 1;
    let finalFilename = sanitizedFilename;
    while (true) {
      try {
        await fs.access(filepath);
        // 파일이 존재하면 번호 추가
        const nameParts = sanitizedFilename.split('.');
        const ext = nameParts.pop();
        const baseName = nameParts.join('.');
        finalFilename = `${baseName}-${counter}.${ext}`;
        filepath = path.join(postsDir, finalFilename);
        counter++;
      } catch {
        // 파일이 존재하지 않으면 break
        break;
      }
    }

    // 파일 저장
    await fs.writeFile(filepath, content, 'utf8');
    
    console.log('블로그 글 저장 완료:', filepath);

    return Response.json({ 
      success: true,
      filename: finalFilename,
      filepath: `/posts/${finalFilename}`
    });

  } catch (error) {
    console.error('블로그 글 저장 오류:', error);
    return Response.json({ 
      error: '파일 저장 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}

// GET 요청 - 저장된 글 목록 조회
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ 
        error: '로그인이 필요합니다.' 
      }, { status: 401 });
    }

    const postsDir = path.join(process.cwd(), 'posts');
    
    try {
      const files = await fs.readdir(postsDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      // 파일 정보 가져오기
      const fileInfos = await Promise.all(
        mdFiles.map(async (file) => {
          const filepath = path.join(postsDir, file);
          const stats = await fs.stat(filepath);
          return {
            filename: file,
            filepath: `/posts/${file}`,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            size: stats.size
          };
        })
      );
      
      // 최신 파일부터 정렬
      fileInfos.sort((a, b) => b.createdAt - a.createdAt);
      
      return Response.json({ 
        files: fileInfos 
      });
      
    } catch (error) {
      // posts 디렉토리가 없는 경우
      return Response.json({ 
        files: [] 
      });
    }

  } catch (error) {
    console.error('파일 목록 조회 오류:', error);
    return Response.json({ 
      error: '파일 목록을 가져오는 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}