import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const baseDir = path.join(process.cwd(), 'chat-history');
    const files = [];

    try {
      // Check if directory exists
      await fs.access(baseDir);
      
      // Read all year directories
      const years = await fs.readdir(baseDir);
      
      for (const year of years) {
        const yearPath = path.join(baseDir, year);
        const yearStat = await fs.stat(yearPath);
        
        if (yearStat.isDirectory()) {
          // Read all month directories
          const months = await fs.readdir(yearPath);
          
          for (const month of months) {
            const monthPath = path.join(yearPath, month);
            const monthStat = await fs.stat(monthPath);
            
            if (monthStat.isDirectory()) {
              // Read all files in month directory
              const monthFiles = await fs.readdir(monthPath);
              
              for (const file of monthFiles) {
                if (file.endsWith('.md')) {
                  const filePath = path.join(monthPath, file);
                  const fileStat = await fs.stat(filePath);
                  
                  // Parse filename
                  const match = file.match(/^(\d{8})-(.+)-(.+)\.md$/);
                  if (match) {
                    const [_, dateStr, topic, username] = match;
                    const date = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
                    
                    files.push({
                      filename: file,
                      path: `/chat-history/${year}/${month}/${file}`,
                      date,
                      topic,
                      username,
                      size: fileStat.size,
                      createdAt: fileStat.birthtime
                    });
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist yet
      console.log('Chat history directory not found');
    }

    // Sort by date descending
    files.sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ files });
  } catch (error) {
    console.error('Chat history list error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}