import { checkAuth } from '@/lib/supabase-auth-helpers';
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    // Check authentication
    const { user, error } = await checkAuth();
    if (error) {
      return new Response(error.message, { status: error.status });
    }

    const { message, model } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response('Invalid message', { status: 400 });
    }

    // Supported models
    const supportedModels = [
      'claude-sonnet-4-20250514',    // Claude Sonnet 4
      'claude-3-5-sonnet-20241022',  // Claude 3.5 Sonnet
      'claude-opus-4-1-20250805',    // Claude Opus 4.1
      'claude-3-opus-20240229',      // Claude 3 Opus
      'claude-3-5-haiku-20241022'    // Claude 3.5 Haiku
    ];

    // Validate model if provided
    if (model && !supportedModels.includes(model)) {
      console.warn(`Unsupported model requested: ${model}, falling back to default`);
    }

    // Get system settings for Claude configuration
    let systemPrompt = '당신은 도움이 되고 친절한 AI 어시스턴트입니다. 한국어로 자연스럽게 대화하며, 사용자의 질문에 정확하고 유용한 답변을 제공합니다.';
    let selectedModel = model && supportedModels.includes(model) ? model : 'claude-3-5-sonnet-20241022';
    
    try {
      const supabase = createAdminClient();
      const { data: settings } = await supabase
        .from('system_settings')
        .select('claude_system_prompt, claude_model')
        .single();
      
      if (settings) {
        systemPrompt = settings.claude_system_prompt || systemPrompt;
        selectedModel = model || settings.claude_model || selectedModel;
      }
    } catch (error) {
      console.log('Could not fetch system settings, using defaults');
    }

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

      console.log('[AI Chat API] Request details:', {
        message: message.substring(0, 50) + '...',
        model: selectedModel,
        user: user.email
      });

      // Adjust max_tokens based on model
      const maxTokens = selectedModel === 'claude-opus-4-1-20250805' ? 8192 :  // Opus 4.1 can handle more
                       selectedModel === 'claude-sonnet-4-20250514' ? 4096 :    // Sonnet 4 
                       selectedModel.includes('opus') ? 4096 : 
                       selectedModel.includes('haiku') ? 1024 : 2048;

      console.log('[AI Chat API] Model configuration:', {
        model: selectedModel,
        maxTokens: maxTokens,
        systemPromptLength: systemPrompt.length
      });

      // For now, let's use non-streaming API to verify it works
      const startTime = Date.now();
      const completion = await anthropic.messages.create({
        model: selectedModel,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        system: systemPrompt,
      });

      const responseTime = Date.now() - startTime;
      console.log('[AI Chat API] Response received:', {
        model: selectedModel,
        responseTime: `${responseTime}ms`,
        responseLength: completion.content[0].text.length
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