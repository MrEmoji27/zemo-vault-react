'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import './SecretChat.css';

export default function SecretChat({ open, onClose }) {
  const [stage, setStage] = useState('password'); // password | name | chat
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false); // Add loading state
  const wsRef = useRef(null);
  const listRef = useRef(null);
  const pwInputRef = useRef(null);

  // Deterministic color per username
  const nameColor = (n) => {
    if (!n) return '#cfe';
    let h = 0;
    for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    const hue = h % 360; // 0..359
    return `hsl(${hue}, 80%, 65%)`;
  };

  const url = useMemo(() => {
    // Next.js uses process.env, not import.meta.env
    // For client-side env vars in Next.js, prefix with NEXT_PUBLIC_
    const chatHost = process.env.NEXT_PUBLIC_CHAT_HOST;
    const chatPort = process.env.NEXT_PUBLIC_CHAT_PORT || '6769';
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd && chatHost) {
      // Production: connect to Render WebSocket server
      return `wss://${chatHost}`;
    } else if (chatHost) {
      // Custom host specified (can be used for staging/testing)
      return `wss://${chatHost}`;
    } else {
      // Development: connect to local WebSocket server
      return `ws://localhost:${chatPort}`;
    }
  }, []);


  useEffect(() => {
    if (!open) return;
    setStage('password'); setPassword(''); setName(''); setErr(''); setMessages([]); setText(''); setMinimized(false); setUnread(0);
  }, [open]);


  useEffect(() => {
    const el = listRef.current; if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    const ws = wsRef.current; if (!ws) return;
    ws.send(JSON.stringify({ type: 'chat', text }));
    setText('');
  };

  const handlePasswordSubmit = () => {
    if (!password || loading) return;
    setLoading(true);
    setErr('');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    // Timeout for connection
    const timeoutId = setTimeout(() => {
      if (loading) {
        setErr('Connection timeout. Is the server running?');
        setLoading(false);
        try { ws.close(); } catch { }
      }
    }, 5000); // 5s timeout

    ws.addEventListener('open', () => {
      clearTimeout(timeoutId);
      ws.send(JSON.stringify({ type: 'auth', password }));
    });
    ws.addEventListener('message', (ev) => {
      clearTimeout(timeoutId);
      let data; try { data = JSON.parse(ev.data); } catch { return; }
      if (data.type === 'authed') {
        setLoading(false);
        setStage('name');
      } else if (data.type === 'ready') {
        setLoading(false);
        setStage('chat');
        setMessages((m) => [...m, { type: 'system', text: `You are ${data.name}.`, ts: Date.now() }]);
      } else if (data.type === 'chat' || data.type === 'system') {
        setMessages((m) => [...m, data]);
        if (minimized) setUnread((u) => u + 1);
      } else if (data.type === 'error' && data.error === 'bad_password') {
        setErr('Wrong password.');
        setLoading(false);
        setTimeout(() => { try { pwInputRef.current?.focus(); } catch { } }, 0);
      }
    });
    ws.addEventListener('close', () => {
      clearTimeout(timeoutId);
      if (loading) {
        setErr('Connection failed.');
        setLoading(false);
      }
    });
  };

  const handleNameSubmit = () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    const ws = wsRef.current; if (!ws) return;
    ws.send(JSON.stringify({ type: 'setName', name: name.trim() }));
    // Wait for 'ready' message
  };

  if (!open) return null;

  if (minimized) {
    return null;
  }

  return (
    <div className="secret-modal">
      <div className="secret-card">
        <div className="topbar">
          <button className="min" onClick={onClose}>–</button>
          <button className="close" onClick={onClose}>×</button>
        </div>
        {stage === 'password' && (
          <div className="stage">
            <h3>Enter Password</h3>
            <input ref={pwInputRef} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" disabled={loading} />
            <button onClick={handlePasswordSubmit} disabled={loading}>{loading ? 'Connecting...' : 'Continue'}</button>
            {err && <div className="err">{err}</div>}
          </div>
        )}
        {stage === 'name' && (
          <div className="stage">
            <h3>Choose a Username</h3>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. neo" disabled={loading} />
            <button onClick={handleNameSubmit} disabled={loading}>{loading ? 'Setting...' : 'Enter'}</button>
          </div>
        )}
        {stage === 'chat' && (
          <div className="chat-stage">
            <div ref={listRef} className="messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`msg ${m.type}`}
                  style={m.type === 'chat' ? { borderLeft: `3px solid ${nameColor(m.name)}`, paddingLeft: 8 } : undefined}
                >
                  {m.type === 'chat' ? (
                    <>
                      <span className="name" style={{ color: nameColor(m.name) }}>{m.name}</span>
                      <span className="text">{m.text}</span>
                    </>
                  ) : (
                    <span className="text">{m.text}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="composer">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} placeholder="Say something…" />
              <button onClick={send}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

