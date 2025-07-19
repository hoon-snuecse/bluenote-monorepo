import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { message, model } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response('Invalid message', { status: 400 });
    }

    // Use provided model or default
    const selectedModel = model || 'claude-sonnet-4-20250514';

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Claude API key not configured. Please set ANTHROPIC_API_KEY in Vercel environment variables.' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      console.log('Creating Claude stream for message:', message.substring(0, 50) + '...');

      // For now, let's use non-streaming API to verify it works
      const completion = await anthropic.messages.create({
        model: selectedModel,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        system: '당신은 도움이 되고 친절한 AI 어시스턴트입니다. 한국어로 자연스럽게 대화하며, 사용자의 질문에 정확하고 유용한 답변을 제공합니다.',
      });

      const responseText = completion.content[0].text;

      // Simulate streaming by sending the response in chunks
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send response in chunks
          const chunkSize = 20; // characters per chunk
          for (let i = 0; i < responseText.length; i += chunkSize) {
            const chunk = responseText.slice(i, i + chunkSize);
            const data = `data: ${JSON.stringify({ text: chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          
          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    } catch (apiError) {
      console.error('Claude API error:', apiError);
      const errorMessage = apiError.message || 'Failed to call Claude API';
      
      // Check if it's an API key error
      if (errorMessage.includes('authentication') || errorMessage.includes('API key')) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key. Please check your ANTHROPIC_API_KEY in Vercel environment variables.' }), 
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Chat stream error:', error);
    console.error('Error details:', error.message, error.stack);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}