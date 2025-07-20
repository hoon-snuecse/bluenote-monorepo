import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { folderId, documentIds, assignmentId } = await request.json();

    if (!folderId || !documentIds || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'Folder ID and document IDs required' },
        { status: 400 }
      );
    }

    // Get current session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's Google token from database using admin client
    const supabase = createAdminClient();
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('access_token')
      .eq('user_email', session.user.email)
      .single();

    console.log('[Import] Token lookup for:', session.user.email, {
      hasData: !!tokenData,
      hasAccessToken: !!tokenData?.access_token,
      error: tokenError?.message
    });

    if (tokenError || !tokenData?.access_token) {
      return NextResponse.json({ error: 'Google authentication required' }, { status: 401 });
    }

    const accessToken = tokenData.access_token;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const importedDocuments = [];

    for (const docId of documentIds) {
      try {
        // Get document metadata
        const fileMetadata = await drive.files.get({
          fileId: docId,
          fields: 'id, name, mimeType, modifiedTime',
        });

        // Export Google Docs as plain text
        if (fileMetadata.data.mimeType === 'application/vnd.google-apps.document') {
          const content = await drive.files.export({
            fileId: docId,
            mimeType: 'text/plain',
          });

          importedDocuments.push({
            id: fileMetadata.data.id,
            name: fileMetadata.data.name,
            content: content.data,
            mimeType: fileMetadata.data.mimeType,
            modifiedTime: fileMetadata.data.modifiedTime,
          });
        } else {
          // For other file types, get the file content
          const content = await drive.files.get({
            fileId: docId,
            alt: 'media',
          });

          importedDocuments.push({
            id: fileMetadata.data.id,
            name: fileMetadata.data.name,
            content: content.data,
            mimeType: fileMetadata.data.mimeType,
            modifiedTime: fileMetadata.data.modifiedTime,
          });
        }
      } catch (error) {
        console.error(`Failed to import document ${docId}:`, error);
      }
    }

    // Extract student names from file names (assuming format: "논설문_학생이름.docx")
    const processedDocuments = importedDocuments.map(doc => {
      const nameMatch = doc.name.match(/([가-힣]+)(?:\.|_)/);
      const studentName = nameMatch ? nameMatch[1] : doc.name.split('.')[0];
      
      return {
        studentName,
        fileName: doc.name,
        content: doc.content as string,
        googleDriveFileId: doc.id,
        mimeType: doc.mimeType,
      };
    });

    // If assignmentId is provided, save submissions directly
    if (assignmentId) {
      console.log('[Import] Creating submissions with assignmentId:', assignmentId);
      console.log('[Import] Documents to process:', processedDocuments.length);
      console.log('[Import] Document details:', processedDocuments.map(d => ({
        studentName: d.studentName,
        fileName: d.fileName,
        contentLength: d.content?.length || 0
      })));
      
      const submissions = [];
      for (const doc of processedDocuments) {
        try {
          console.log(`[Import] Creating submission for ${doc.studentName}`);
          
          // Ensure content is string
          const contentStr = typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content);
          
          const submission = await prisma.submission.create({
            data: {
              assignmentId: assignmentId,
              studentName: doc.studentName,
              studentId: `google_${doc.googleDriveFileId}`, // Use Google Drive file ID as studentId
              content: contentStr,
              submittedAt: new Date(),
              createdAt: new Date() // Explicitly set createdAt
            }
          });
          console.log('[Import] Created submission:', {
            id: submission.id,
            studentName: submission.studentName,
            assignmentId: submission.assignmentId,
            createdAt: submission.createdAt,
            submittedAt: submission.submittedAt
          });
          submissions.push(submission);
        } catch (error) {
          console.error(`Failed to create submission for ${doc.studentName}:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        imported: submissions.length,
        assignmentId: assignmentId,
        documents: submissions.map(sub => ({
          studentName: sub.studentName,
          submissionId: sub.id,
        })),
      });
    } else {
      // Store in session/cookie temporarily (in production, use database)
      const cookieStore = await cookies();
      cookieStore.set('imported_documents', JSON.stringify(processedDocuments), {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });

      return NextResponse.json({
        success: true,
        imported: processedDocuments.length,
        documents: processedDocuments.map(doc => ({
          studentName: doc.studentName,
          fileName: doc.fileName,
        })),
      });
    }
  } catch (error) {
    console.error('Error importing documents:', error);
    return NextResponse.json(
      { error: 'Failed to import documents' },
      { status: 500 }
    );
  }
}