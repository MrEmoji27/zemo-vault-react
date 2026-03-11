'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import './SecretChat.css';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

// ── Trippy checkerboard background (inspired by ascii.co.uk) ──
const DENSE = ['@', '#', '8', '0', '%', '&', 'W', 'M'];
const LIGHT = ['.', ',', '·', ':', ';', '`', ' ', ' '];

function TripCheckerBg() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame(f => f + 1), 200);
    return () => clearInterval(id);
  }, []);

  const grid = useMemo(() => {
    const rows = 12;
    const cols = 60;
    const lines = [];
    for (let r = 0; r < rows; r++) {
      let line = '';
      for (let c = 0; c < cols; c++) {
        const checker = (c + r + frame) % 2 === 0;
        const pool = checker ? DENSE : LIGHT;
        line += pool[(c + r + frame) % pool.length];
      }
      lines.push(line);
    }
    return lines.join('\n');
  }, [frame]);

  return <pre className="bbs-checker-bg" aria-hidden="true">{grid}</pre>;
}

// ── Animated ASCII border strip ──
function AsciiStrip({ active }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setFrame(f => f + 1), 130);
    return () => clearInterval(id);
  }, [active]);

  const line = useMemo(() => {
    if (!active) return '═'.repeat(44);
    const chars = '░▒▓█▓▒░═╬═░▒▓█▓▒░';
    let s = '';
    for (let i = 0; i < 44; i++) {
      s += chars[(i + frame) % chars.length];
    }
    return s;
  }, [frame, active]);

  return <span className="bbs-ascii-strip" aria-hidden="true">{line}</span>;
}

// Slant Relief font from patorjk.com/software/taag — trailing spaces trimmed for centering
const VAULT_ASCII = String.raw`__/\\\________/\\\_____/\\\\\\\\\_____/\\\________/\\\__/\\\______________/\\\\\\\\\\\\\\\_
 _\/\\\_______\/\\\___/\\\\\\\\\\\\\__\/\\\_______\/\\\_\/\\\_____________\///////\\\/////__
  _\//\\\______/\\\___/\\\/////////\\\_\/\\\_______\/\\\_\/\\\___________________\/\\\_______
   __\//\\\____/\\\___\/\\\_______\/\\\_\/\\\_______\/\\\_\/\\\___________________\/\\\_______
    ___\//\\\__/\\\____\/\\\\\\\\\\\\\\\_\/\\\_______\/\\\_\/\\\___________________\/\\\_______
     ____\//\\\/\\\_____\/\\\/////////\\\_\/\\\_______\/\\\_\/\\\___________________\/\\\_______
      _____\//\\\\\______\/\\\_______\/\\\_\//\\\______/\\\__\/\\\___________________\/\\\_______
       ______\//\\\_______\/\\\_______\/\\\__\///\\\\\\\\\/___\/\\\\\\\\\\\\\\\_______\/\\\_______
        _______\///________\///________\///_____\/////////_____\///////////////________\///________`
  .split('\n').map(l => l.trimEnd()).join('\n');

export default function SecretChat({ open, onClose }) {
  const [stage, setStage] = useState('password');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [dockHovered, setDockHovered] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [modemLines, setModemLines] = useState([]);

  const wsRef = useRef(null);
  const listRef = useRef(null);
  const pwInputRef = useRef(null);

  const nameColor = useCallback((n) => {
    if (!n) return '#00ff8c';
    let h = 0;
    for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    return `hsl(${h % 360}, 70%, 65%)`;
  }, []);

  const url = useMemo(() => {
    const chatHost = process.env.NEXT_PUBLIC_CHAT_HOST;
    const chatPort = process.env.NEXT_PUBLIC_CHAT_PORT || '6769';
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd && chatHost) return `wss://${chatHost}`;
    if (chatHost) return `wss://${chatHost}`;
    return `ws://localhost:${chatPort}`;
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleClose = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
    setStage('password');
    setPassword('');
    setName('');
    setErr('');
    setMessages([]);
    setText('');
    setMinimized(false);
    setUnread(0);
    setLoading(false);
    setAuthenticated(false);
    setShowEmoji(false);
    setOnlineCount(0);
    setModemLines([]);
    onClose();
  }, [onClose]);

  const handleMinimize = useCallback(() => setMinimized(true), []);
  const handleRestore = useCallback(() => {
    setMinimized(false);
    setUnread(0);
  }, []);

  const send = useCallback(() => {
    if (!text.trim()) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'chat', text: text.trim() }));
    setText('');
    setShowEmoji(false);
  }, [text]);

  const onEmojiClick = useCallback((emojiData) => {
    setText(prev => prev + emojiData.emoji);
  }, []);

  // Modem dialing simulation
  const simulateModem = useCallback(() => {
    const lines = [
      'ATDT 555-0142',
      'DIALING...',
      '',
      'CONNECT 9600/ARQ/V32/LAPM',
      '',
    ];
    setModemLines([]);
    lines.forEach((line, i) => {
      setTimeout(() => {
        setModemLines(prev => [...prev, line]);
      }, i * 400);
    });
  }, []);

  const handlePasswordSubmit = useCallback(() => {
    if (!password || loading) return;
    setLoading(true);
    setErr('');
    setConnectionStatus('connecting');
    simulateModem();

    const ws = new WebSocket(url);
    wsRef.current = ws;

    const timeoutId = setTimeout(() => {
      if (loading) {
        setErr('CONNECTION TIMEOUT - NO CARRIER');
        setLoading(false);
        setConnectionStatus('disconnected');
        setModemLines([]);
        try { ws.close(); } catch { }
      }
    }, 5000);

    ws.addEventListener('open', () => {
      clearTimeout(timeoutId);
      ws.send(JSON.stringify({ type: 'auth', password }));
    });

    ws.addEventListener('message', (ev) => {
      clearTimeout(timeoutId);
      let data;
      try { data = JSON.parse(ev.data); } catch { return; }

      if (data.type === 'authed') {
        setLoading(false);
        setConnectionStatus('connected');
        setAuthenticated(true);
        setModemLines([]);
        setStage('name');
      } else if (data.type === 'ready') {
        setLoading(false);
        setStage('chat');
        setMessages(m => [...m, {
          type: 'system',
          text: `${data.name} has entered the chat`,
          ts: Date.now()
        }]);
      } else if (data.type === 'online') {
        setOnlineCount(data.count);
      } else if (data.type === 'chat' || data.type === 'system') {
        setMessages(m => [...m, { ...data, ts: Date.now() }]);
        if (minimized) setUnread(u => u + 1);
      } else if (data.type === 'error' && data.error === 'bad_password') {
        setErr('ACCESS DENIED - BAD PASSWORD');
        setLoading(false);
        setConnectionStatus('disconnected');
        setModemLines([]);
        setTimeout(() => { try { pwInputRef.current?.focus(); } catch { } }, 0);
      }
    });

    ws.addEventListener('close', () => {
      clearTimeout(timeoutId);
      if (loading) {
        setErr('NO CARRIER');
        setLoading(false);
      }
      setConnectionStatus('disconnected');
      setModemLines([]);
    });

    ws.addEventListener('error', () => {
      setConnectionStatus('disconnected');
      setModemLines([]);
    });
  }, [password, loading, url, minimized, simulateModem]);

  const handleNameSubmit = useCallback(() => {
    if (!name.trim() || loading) return;
    setLoading(true);
    const ws = wsRef.current;
    if (!ws) return;
    ws.send(JSON.stringify({ type: 'setName', name: name.trim() }));
  }, [name, loading]);

  if (!open && !authenticated) return null;

  // Minimized dock
  if (minimized) {
    return (
      <motion.button
        className={`bbs-dock ${dockHovered ? 'hovered' : ''} ${unread > 0 ? 'has-unread' : ''}`}
        onClick={handleRestore}
        onMouseEnter={() => setDockHovered(true)}
        onMouseLeave={() => setDockHovered(false)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <motion.span
          className={`dock-indicator ${connectionStatus}`}
          animate={{
            scale: unread > 0 ? [1, 1.3, 1] : 1,
            opacity: dockHovered ? 1 : 0.4
          }}
          transition={{ repeat: unread > 0 ? Infinity : 0, duration: 1.5 }}
        />
        <AnimatePresence>
          {dockHovered && (
            <motion.span
              className="dock-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
            >
              {unread > 0 ? `${unread} NEW` : 'VAULT BBS'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="bbs-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bbs-terminal"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 24, stiffness: 300 } }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
        >
          {/* CRT scanline overlay */}
          <div className="bbs-scanlines" aria-hidden="true" />

          {/* ═══ Title bar ═══ */}
          <div className="bbs-titlebar">
            <span>╔═══════════════════════════════════════════════╗</span>
          </div>
          <div className="bbs-titlebar-content">
            <span className="bbs-title">║ ░▒▓█ ZEMO VAULT BBS █▓▒░</span>
            <span className="bbs-titlebar-right">
              {stage === 'chat' && onlineCount > 0 && (
                <span className="bbs-online">[ {onlineCount} ONLINE ]</span>
              )}
              <span className={`bbs-conn-status ${connectionStatus}`}>
                {connectionStatus === 'connected' ? '■ CONNECTED' : connectionStatus === 'connecting' ? '□ DIALING' : '○ OFFLINE'}
              </span>
              <button className="bbs-chrome-btn" onClick={handleMinimize} title="Minimize">─</button>
              <button className="bbs-chrome-btn bbs-close-btn" onClick={handleClose} title="Disconnect">×</button>
            ║</span>
          </div>
          <div className="bbs-titlebar">
            <span>╠═══════════════════════════════════════════════╣</span>
          </div>

          {/* ═══ Body ═══ */}
          <div className="bbs-body">
            <AnimatePresence mode="wait">

              {/* ── PASSWORD STAGE ── */}
              {stage === 'password' && (
                <motion.div
                  className="bbs-stage"
                  key="password"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <TripCheckerBg />
                  <div className="bbs-stage-inner">
                    <pre className="bbs-banner" dangerouslySetInnerHTML={{
                      __html: VAULT_ASCII.replace(/_/g, '<span class="bbs-banner-dim">_</span>')
                    }} />
                    <div className="bbs-sysinfo">
                      <span>Node 1 of 4 │ Est. 2024 │ SysOp: ZEMO</span>
                      <span>Running SecureChat v2.1 on Port {process.env.NEXT_PUBLIC_CHAT_PORT || '6769'}</span>
                    </div>

                    {modemLines.length > 0 && (
                      <div className="bbs-modem">
                        {modemLines.map((line, i) => (
                          <div key={i} className="bbs-modem-line">{line}</div>
                        ))}
                      </div>
                    )}

                    {!loading && (
                      <div className="bbs-prompt-section">
                        <span className="bbs-prompt-label">ENTER PASSWORD TO CONTINUE:</span>
                        <AsciiStrip active={inputFocused} />
                        <div className="bbs-input-row">
                          <span className="bbs-cursor">{'>'}</span>
                          <input
                            ref={pwInputRef}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            type="password"
                            placeholder="********"
                            disabled={loading}
                            autoFocus
                            className="bbs-input"
                          />
                        </div>
                        <AsciiStrip active={inputFocused} />
                        <button
                          className="bbs-action-btn"
                          onClick={handlePasswordSubmit}
                          disabled={loading || password.length === 0}
                        >
                          {'[ AUTHENTICATE ]'}
                        </button>
                      </div>
                    )}

                    {err && (
                      <div className="bbs-error bbs-shake">
                        *** {err} ***
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── NAME STAGE ── */}
              {stage === 'name' && (
                <motion.div
                  className="bbs-stage"
                  key="name"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <TripCheckerBg />
                  <div className="bbs-stage-inner">
                    <pre className="bbs-access-granted">{`
  ╔════════════════════════════════╗
  ║    ░░░ ACCESS GRANTED ░░░     ║
  ╚════════════════════════════════╝`}</pre>
                    <div className="bbs-sysinfo">
                      <span>Welcome to the Vault. Choose your handle.</span>
                      <span>Max 16 characters. This is how others see you.</span>
                    </div>

                    <div className="bbs-handle-preview">
                      ┌─────────────────────┐{'\n'}
                      │ Handle: <span className="bbs-handle-name">@{(name.trim() || 'anonymous').padEnd(12)}</span>│{'\n'}
                      └─────────────────────┘
                    </div>

                    <div className="bbs-prompt-section">
                      <span className="bbs-prompt-label">ENTER YOUR HANDLE:</span>
                      <AsciiStrip active={inputFocused} />
                      <div className="bbs-input-row">
                        <span className="bbs-cursor">@</span>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                          onFocus={() => setInputFocused(true)}
                          onBlur={() => setInputFocused(false)}
                          placeholder="anonymous"
                          disabled={loading}
                          autoFocus
                          maxLength={16}
                          className="bbs-input"
                        />
                      </div>
                      <AsciiStrip active={inputFocused} />
                      <button
                        className="bbs-action-btn"
                        onClick={handleNameSubmit}
                        disabled={loading || !name.trim()}
                      >
                        {loading ? '[ JOINING... ]' : '[ JOIN CHAT ]'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── CHAT STAGE (minimal) ── */}
              {stage === 'chat' && (
                <motion.div
                  className="bbs-chat"
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="bbs-chat-bar">
                    <span className="bbs-chat-room">#secret</span>
                    <span className="bbs-chat-meta">@{name || 'anon'}</span>
                    {onlineCount > 0 && <span className="bbs-chat-online">{onlineCount} online</span>}
                  </div>

                  <div ref={listRef} className="bbs-messages">
                    {messages.length === 0 && (
                      <div className="bbs-empty">no messages yet</div>
                    )}
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={`bbs-msg ${m.type}`}
                        style={m.type === 'chat' ? { '--nc': nameColor(m.name) } : undefined}
                      >
                        {m.type === 'chat' ? (
                          <>
                            <span className="bbs-msg-name">{m.name}</span>
                            <span className="bbs-msg-text">{m.text}</span>
                            <span className="bbs-msg-time">
                              {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </>
                        ) : (
                          <span className="bbs-msg-sys">{m.text}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {showEmoji && (
                      <motion.div
                        className="bbs-emoji-tray"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 280 }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          theme="dark"
                          width="100%"
                          height={280}
                          searchDisabled
                          skinTonesDisabled
                          previewConfig={{ showPreview: false }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="bbs-compose">
                    <button
                      className={`bbs-compose-emoji ${showEmoji ? 'active' : ''}`}
                      onClick={() => setShowEmoji(!showEmoji)}
                      type="button"
                    >:)</button>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                      }}
                      placeholder="message"
                      maxLength={500}
                      className="bbs-input bbs-compose-input"
                    />
                    <button className="bbs-compose-send" onClick={send} disabled={!text.trim()}>↑</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ Footer ═══ */}
          <div className="bbs-titlebar">
            <span>╚═══════════════════════════════════════════════╝</span>
          </div>
          <div className="bbs-footer">
            <span>F1=HELP │ ESC=MINIMIZE │ ALT+X=DISCONNECT │ SecureChat v2.1</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
