import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createServerSupabaseClient } from '@/lib/database/supabase';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId, googleDocsUrl, docId } = await request.json();

    if (!assignmentId || !googleDocsUrl || !docId) {
      return NextResponse.json({ 
        success: false, 
        error: '필수 정보가 누락되었습니다.' 
      }, { status: 400 });
    }

    // Google Docs export URL (텍스트 형식으로 내보내기)
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    
    try {
      // Google Docs 내용 가져오기
      const response = await fetch(exportUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('문서를 찾을 수 없습니다. URL을 확인해주세요.');
        } else if (response.status === 403) {
          throw new Error('문서에 접근할 수 없습니다. "링크가 있는 모든 사용자" 공유로 설정해주세요.');
        }
        throw new Error('문서를 가져올 수 없습니다.');
      }

      const text = await response.text();
      
      // 학생 글 파싱
      const students = parseStudentSubmissions(text);
      
      if (students.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: '문서에서 학생 글을 찾을 수 없습니다. "이름: 홍길동" 형식으로 시작하는지 확인해주세요.' 
        });
      }

      // Supabase에 저장
      const supabase = createServerSupabaseClient();
      const submissions = [];
      const errors = [];

      for (const student of students) {
        try {
          // 기존 제출물 확인
          const { data: existing } = await supabase
            .from('submissions')
            .select('id')
            .eq('assignment_id', assignmentId)
            .eq('student_name', student.name)
            .single();

          if (existing) {
            // 기존 제출물 업데이트
            const { data, error } = await supabase
              .from('submissions')
              .update({
                content: student.content,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id)
              .select()
              .single();

            if (error) throw error;
            submissions.push(data);
          } else {
            // 새 제출물 생성
            const { data, error } = await supabase
              .from('submissions')
              .insert({
                assignment_id: assignmentId,
                student_name: student.name,
                content: student.content,
                submitted_at: new Date().toISOString()
              })
              .select()
              .single();

            if (error) throw error;
            submissions.push(data);
          }
        } catch (error) {
          console.error(`Error saving submission for ${student.name}:`, error);
          errors.push(`${student.name}: ${error.message}`);
        }
      }

      return NextResponse.json({ 
        success: true, 
        count: submissions.length,
        students: submissions.map(s => s.student_name),
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (fetchError) {
      console.error('Google Docs fetch error:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: fetchError.message 
      });
    }

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}

// 학생 글 파싱 함수
function parseStudentSubmissions(text) {
  const students = [];
  
  // 줄바꿈으로 텍스트 분리
  const lines = text.split('\n');
  
  let currentStudent = null;
  let contentLines = [];
  
  for (const line of lines) {
    // "이름: 홍길동" 패턴 찾기
    const nameMatch = line.match(/^이름\s*[:：]\s*(.+?)$/);
    
    if (nameMatch) {
      // 이전 학생의 글 저장
      if (currentStudent && contentLines.length > 0) {
        students.push({
          name: currentStudent,
          content: contentLines.join('\n').trim()
        });
      }
      
      // 새 학생 시작
      currentStudent = nameMatch[1].trim();
      contentLines = [];
    } else if (currentStudent) {
      // 현재 학생의 글 내용 추가
      contentLines.push(line);
    }
  }
  
  // 마지막 학생의 글 저장
  if (currentStudent && contentLines.length > 0) {
    students.push({
      name: currentStudent,
      content: contentLines.join('\n').trim()
    });
  }
  
  return students;
}