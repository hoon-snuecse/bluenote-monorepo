import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file');

    if (!filePath || !filePath.startsWith('/chat-history/')) {
      return new Response('Invalid file path', { status: 400 });
    }

    // Security: Remove any .. to prevent path traversal
    const cleanPath = filePath.replace(/\.\./g, '');
    const fullPath = path.join(process.cwd(), cleanPath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return new Response('File not found', { status: 404 });
    }

    // Read file
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    const filename = path.basename(fullPath);

    // Return file as download
    return new Response(fileContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}