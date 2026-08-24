import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const sendUpdate = async () => {
        if (isClosed) return;
        try {
          // Fetch internal status endpoint
          const res = await fetch('http://127.0.0.1:3100/api/v1/system-status', {
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (res.ok) {
            const data = await res.json();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }
        } catch {
          // ignore error
        }
      };

      // Initial send
      await sendUpdate();

      // Interval send every 2s
      const interval = setInterval(sendUpdate, 2000);

      req.signal.addEventListener('abort', () => {
        isClosed = true;
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
