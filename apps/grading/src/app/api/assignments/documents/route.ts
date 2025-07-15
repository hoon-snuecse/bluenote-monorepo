import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const importedDocsData = cookieStore.get('imported_documents')?.value;
    
    if (!importedDocsData) {
      return NextResponse.json({ documents: [] });
    }

    const importedDocs = JSON.parse(importedDocsData);
    
    // Get evaluations from cookie
    const evaluationsData = cookieStore.get('evaluations')?.value;
    const evaluations = evaluationsData ? JSON.parse(evaluationsData) : {};
    
    // Transform to student format for dashboard
    const students = importedDocs.map((doc: any, index: number) => {
      const studentId = `student-${index + 1}`;
      const evaluation = evaluations[studentId];
      
      return {
        id: studentId,
        name: doc.studentName,
        documentId: `doc-${index + 1}`,
        documentName: doc.fileName,
        content: doc.content,
        googleDriveFileId: doc.googleDriveFileId,
        evaluationStatus: evaluation ? 'completed' : 'pending',
        scores: evaluation ? evaluation.scores : {
          clarity: 0,
          evidence: 0,
          structure: 0,
          expression: 0,
          overall: 0
        },
        grade: evaluation ? evaluation.grade : '-',
        feedback: evaluation ? evaluation.feedback : null,
      };
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}