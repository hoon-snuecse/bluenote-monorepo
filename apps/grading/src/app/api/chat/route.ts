import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth';

// Store WebSocket-like connections using SSE
const chatClients = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  // Verify authentication using NextAuth
  const session = await getServerSession();
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const assignmentId = searchParams.get('assignmentId');
  const clientId = `${session.user.email}-${Date.now()}`;

  if (!assignmentId) {
    return new Response('Assignment ID is required', { status: 400 });
  }

  // Create SSE stream for chat
  const stream = new ReadableStream({
    start(controller) {
      // Store client connection
      chatClients.set(clientId, controller);

      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'connected',
            clientId,
            userId: session.user.email,
          })}\n\n`
        )
      );

      // Clean up on disconnect
      request.signal.addEventListener('abort', () => {
        chatClients.delete(clientId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(request: NextRequest) {
  // Verify authentication
  const session = await getServerSession();
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { message, assignmentId } = await request.json();

  if (!message || !assignmentId) {
    return new Response('Message and assignment ID are required', { status: 400 });
  }

  // Broadcast message to all connected clients
  const encoder = new TextEncoder();
  const messageData = JSON.stringify({
    type: 'message',
    userId: session.user.email,
    userName: session.user.name || session.user.email,
    message,
    timestamp: new Date().toISOString(),
  });

  for (const [clientId, controller] of chatClients) {
    try {
      controller.enqueue(encoder.encode(`data: ${messageData}\n\n`));
    } catch (error) {
      // Remove disconnected clients
      chatClients.delete(clientId);
    }
  }

  return Response.json({ success: true });
}