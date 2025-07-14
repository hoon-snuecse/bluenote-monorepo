import { NextRequest } from 'next/server';
import { getTokenFromCookie, verifyToken } from '@/lib/auth';

// Store WebSocket-like connections using SSE
const chatClients = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  // Verify authentication
  const token = getTokenFromCookie(request.headers.get('cookie'));
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return new Response('Invalid token', { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const assignmentId = searchParams.get('assignmentId');
  const clientId = `${payload.userId}-${Date.now()}`;

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
        encoder.encode(`data: ${JSON.stringify({
          type: 'connected',
          clientId,
          user: {
            id: payload.userId,
            name: payload.name
          }
        })}\n\n`)
      );

      // Notify other users about new connection
      broadcastMessage(assignmentId, {
        type: 'user_joined',
        user: {
          id: payload.userId,
          name: payload.name
        },
        timestamp: new Date().toISOString()
      }, clientId);

      // Handle disconnection
      request.signal.addEventListener('abort', () => {
        chatClients.delete(clientId);
        // Notify others about disconnection
        broadcastMessage(assignmentId, {
          type: 'user_left',
          user: {
            id: payload.userId,
            name: payload.name
          },
          timestamp: new Date().toISOString()
        }, clientId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// POST endpoint for sending messages
export async function POST(request: NextRequest) {
  // Verify authentication
  const token = getTokenFromCookie(request.headers.get('cookie'));
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return new Response('Invalid token', { status: 401 });
  }

  const { assignmentId, message } = await request.json();

  if (!assignmentId || !message) {
    return new Response('Assignment ID and message are required', { status: 400 });
  }

  // Broadcast message to all connected clients
  broadcastMessage(assignmentId, {
    type: 'message',
    user: {
      id: payload.userId,
      name: payload.name
    },
    message,
    timestamp: new Date().toISOString()
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper function to broadcast messages
function broadcastMessage(assignmentId: string, data: any, excludeClientId?: string) {
  const encoder = new TextEncoder();
  const message = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  chatClients.forEach((controller, clientId) => {
    if (clientId !== excludeClientId) {
      try {
        controller.enqueue(message);
      } catch (error) {
        // Remove disconnected clients
        chatClients.delete(clientId);
      }
    }
  });
}