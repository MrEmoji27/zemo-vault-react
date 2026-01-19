import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT) || 6769;
const CHAT_PASSWORD = process.env.CHAT_PASSWORD || 'ALONSO@2005';

const wss = new WebSocketServer({ port: PORT });

function broadcast(data, except = null) {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1 && client !== except && client.authed) {
      try { client.send(msg); } catch { }
    }
  }
}

wss.on('connection', (ws) => {
  ws.authed = false;
  ws.username = null;
  ws.isAlive = true;

  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    let data;
    try { data = JSON.parse(String(raw)); } catch { return; }

    if (!ws.authed) {
      if (data?.type === 'auth' && typeof data?.password === 'string') {
        if (data.password === CHAT_PASSWORD) {
          ws.authed = true;
          ws.send(JSON.stringify({ type: 'authed' }));
        } else {
          ws.send(JSON.stringify({ type: 'error', error: 'bad_password' }));
          try { ws.close(4001, 'bad_password'); } catch { }
        }
      }
      return;
    }

    if (!ws.username) {
      if (data?.type === 'setName' && typeof data?.name === 'string' && data.name.trim().length > 0) {
        ws.username = data.name.trim().slice(0, 24);
        broadcast({ type: 'system', text: `${ws.username} joined.`, ts: Date.now() });
        ws.send(JSON.stringify({ type: 'ready', name: ws.username }));
      }
      return;
    }

    if (data?.type === 'chat' && typeof data?.text === 'string') {
      const text = data.text.slice(0, 500);
      broadcast({ type: 'chat', name: ws.username, text, ts: Date.now() });
    }
  });

  ws.on('close', () => {
    if (ws.authed && ws.username) {
      broadcast({ type: 'system', text: `${ws.username} left.`, ts: Date.now() }, ws);
    }
  });
});

// heartbeat
const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) { try { ws.terminate(); } catch { }; continue; }
    ws.isAlive = false;
    try { ws.ping(); } catch { }
  }
}, 30000);

wss.on('close', () => clearInterval(interval));

console.log(`[secret-chat] WebSocket server running on ws://localhost:${PORT}`);
