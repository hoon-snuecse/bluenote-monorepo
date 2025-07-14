import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, topic } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid messages', { status: 400 });
    }

    // Generate filename
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Clean username for filename
    const username = session.user?.name || session.user?.email || 'unknown';
    const cleanUsername = username.replace(/[^a-zA-Z0-9가-힣]/g, '');
    
    // Clean topic for filename
    const cleanTopic = (topic || 'Claude와의대화').replace(/[^a-zA-Z0-9가-힣]/g, '');
    
    const filename = `${dateStr}-${cleanTopic}-${cleanUsername}.md`;
    
    // Create directory structure
    const baseDir = path.join(process.cwd(), 'chat-history', year.toString(), month);
    await fs.mkdir(baseDir, { recursive: true });
    
    // Generate markdown content
    const mdContent = generateMarkdown(messages, session.user, topic, date);
    
    // Save file
    const filePath = path.join(baseDir, filename);
    await fs.writeFile(filePath, mdContent, 'utf-8');
    
    // Return success with file info
    return Response.json({ 
      success: true, 
      filename,
      path: `/chat-history/${year}/${month}/${filename}`
    });
    
  } catch (error) {
    console.error('Chat history save error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

function generateMarkdown(messages, user, topic, date) {
  const dateStr = date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let md = `# Claude와의 대화\n`;
  md += `- 일시: ${dateStr}\n`;
  md += `- 참여자: ${user?.name || user?.email || 'Unknown'}\n`;
  md += `- 주제: ${topic || '일반 대화'}\n\n`;
  md += `---\n\n`;
  md += `## 대화 내용\n\n`;
  
  messages.forEach((msg) => {
    if (msg.role === 'user') {
      md += `**사용자**: ${msg.content}\n\n`;
    } else if (msg.role === 'assistant') {
      md += `**Claude**: ${msg.content}\n\n`;
    } else if (msg.role === 'system') {
      md += `> *시스템*: ${msg.content}\n\n`;
    }
  });
  
  md += `---\n`;
  md += `생성일: ${date.toISOString().split('T')[0]}\n`;
  md += `BlueNote Atelier\n`;
  
  return md;
}