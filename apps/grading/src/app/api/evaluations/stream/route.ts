import { NextRequest } from 'next/server';

// SSE 연결을 저장하는 맵
const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const assignmentId = searchParams.get('assignmentId');
  const clientId = searchParams.get('clientId') || crypto.randomUUID();

  if (!assignmentId) {
    return new Response('Assignment ID is required', { status: 400 });
  }

  // SSE 스트림 생성
  const stream = new ReadableStream({
    start(controller) {
      // 클라이언트 저장
      clients.set(clientId, controller);

      // 초기 연결 메시지 전송
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`)
      );

      // 연결 종료 시 클리어
      request.signal.addEventListener('abort', () => {
        clients.delete(clientId);
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

// 이벤트를 특정 과제의 모든 클라이언트에게 전송
export function sendEvaluationUpdate(assignmentId: string, data: any) {
  const encoder = new TextEncoder();
  const message = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  clients.forEach((controller) => {
    try {
      controller.enqueue(message);
    } catch (error) {
      // 연결이 끊긴 클라이언트 제거
      clients.delete(assignmentId);
    }
  });
}