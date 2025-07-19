import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const dateStr = `${year}${month}${day}_${hour}${minute}`;
    
    // Create ASCII-safe filename
    const filename = `claude_chat_${dateStr}.md`;
    
    // Generate markdown content
    const mdContent = generateMarkdown(messages, session.user, topic, date);
    
    // Return markdown as downloadable file
    return new Response(mdContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error('Chat export error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
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