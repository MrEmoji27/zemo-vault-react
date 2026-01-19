'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import './SecretChat.css';

// Dynamic import for emoji picker (client-side only)
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

export default function SecretChat({ open, onClose }) {
  // Core State - persists across minimize/restore
  const [stage, setStage] = useState('password'); // password | name | chat
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

  // Refs
  const wsRef = useRef(null);
  const listRef = useRef(null);
  const pwInputRef = useRef(null);

  // Deterministic color per username
  const nameColor = useCallback((n) => {
    if (!n) return '#00ff8c';
    let h = 0;
    for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    return `hsl(${hue}, 80%, 65%)`;
  }, []);

  // WebSocket URL
  const url = useMemo(() => {
    const chatHost = process.env.NEXT_PUBLIC_CHAT_HOST;
    const chatPort = process.env.NEXT_PUBLIC_CHAT_PORT || '6769';
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd && chatHost) {
      return `wss://${chatHost}`;
    } else if (chatHost) {
      return `wss://${chatHost}`;
    } else {
      return `ws://localhost:${chatPort}`;
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Handle close - disconnect and reset everything
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
    onClose();
  }, [onClose]);

  // Handle minimize - just hide, keep connection alive
  const handleMinimize = useCallback(() => {
    setMinimized(true);
  }, []);

  // Handle restore from dock
  const handleRestore = useCallback(() => {
    setMinimized(false);
    setUnread(0);
  }, []);

  // Send message
  const send = useCallback(() => {
    if (!text.trim()) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'chat', text: text.trim() }));
    setText('');
    setShowEmoji(false);
  }, [text]);

  // Handle emoji selection
  const onEmojiClick = useCallback((emojiData) => {
    setText(prev => prev + emojiData.emoji);
  }, []);

  // CRT flicker state
  const [crtFlicker, setCrtFlicker] = useState(false);

  // Trigger CRT flicker effect on stage changes
  useEffect(() => {
    if (!open) return;
    setCrtFlicker(true);
    const timer = setTimeout(() => setCrtFlicker(false), 150);
    return () => clearTimeout(timer);
  }, [stage, open]);

  // Password submit
  const handlePasswordSubmit = useCallback(() => {
    if (!password || loading) return;
    setLoading(true);
    setErr('');
    setConnectionStatus('connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    const timeoutId = setTimeout(() => {
      if (loading) {
        setErr('Connection timeout. Is the server running?');
        setLoading(false);
        setConnectionStatus('disconnected');
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
        setStage('name');
      } else if (data.type === 'ready') {
        setLoading(false);
        setStage('chat');
        setMessages(m => [...m, {
          type: 'system',
          text: `Welcome, ${data.name}! You're now connected.`,
          ts: Date.now()
        }]);
      } else if (data.type === 'chat' || data.type === 'system') {
        setMessages(m => [...m, { ...data, ts: Date.now() }]);
        if (minimized) setUnread(u => u + 1);
      } else if (data.type === 'error' && data.error === 'bad_password') {
        setErr('Wrong password. Access denied.');
        setLoading(false);
        setConnectionStatus('disconnected');
        setTimeout(() => { try { pwInputRef.current?.focus(); } catch { } }, 0);
      }
    });

    ws.addEventListener('close', () => {
      clearTimeout(timeoutId);
      if (loading) {
        setErr('Connection failed.');
        setLoading(false);
      }
      setConnectionStatus('disconnected');
    });

    ws.addEventListener('error', () => {
      setConnectionStatus('disconnected');
    });
  }, [password, loading, url, minimized]);

  // Name submit
  const handleNameSubmit = useCallback(() => {
    if (!name.trim() || loading) return;
    setLoading(true);
    const ws = wsRef.current;
    if (!ws) return;
    ws.send(JSON.stringify({ type: 'setName', name: name.trim() }));
  }, [name, loading]);

  // Don't render if not open and not authenticated
  if (!open && !authenticated) return null;

  // Framer Motion variants
  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 20, stiffness: 300 }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const dockVariants = {
    hidden: { opacity: 0, scale: 0, x: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { type: "spring", damping: 15, stiffness: 200 }
    },
    exit: { opacity: 0, scale: 0, x: 20 }
  };

  const stageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10 }
  };

  const messageVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const pixelVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, type: "spring", damping: 10 }
    })
  };

  // Render subtle dock when minimized - almost invisible until hovered
  if (minimized) {
    return (
      <motion.button
        className={`secret-dock-subtle ${dockHovered ? 'hovered' : ''} ${unread > 0 ? 'has-unread' : ''}`}
        onClick={handleRestore}
        onMouseEnter={() => setDockHovered(true)}
        onMouseLeave={() => setDockHovered(false)}
        variants={dockVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Tiny dot - only visible indicator */}
        <motion.span
          className={`dock-dot ${connectionStatus}`}
          animate={{
            scale: unread > 0 ? [1, 1.2, 1] : 1,
            opacity: dockHovered ? 1 : 0.3
          }}
          transition={{ repeat: unread > 0 ? Infinity : 0, duration: 1.5 }}
        />

        {/* Label only shows on hover */}
        <AnimatePresence>
          {dockHovered && (
            <motion.span
              className="dock-label-subtle"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
            >
              {unread > 0 ? `${unread} new` : 'Open'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="secret-modal"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="secret-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <div className="secret-header">
            <div className="header-left">
              <motion.div
                className="header-icon"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="pixel-char">▓</span>
                <span className="pixel-char">▓</span>
              </motion.div>
              <div className="header-info">
                <h3 className="header-title">SECRET CHAT</h3>
                <span className={`header-status ${connectionStatus}`}>
                  {connectionStatus === 'connected' && '● SECURE'}
                  {connectionStatus === 'connecting' && '◐ CONNECTING...'}
                  {connectionStatus === 'disconnected' && '○ OFFLINE'}
                </span>
              </div>
            </div>
            <div className="header-actions">
              <motion.button
                className="header-btn minimize"
                onClick={handleMinimize}
                title="Minimize"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span>─</span>
              </motion.button>
              <motion.button
                className="header-btn close"
                onClick={handleClose}
                title="Close"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span>×</span>
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="secret-content">
            <AnimatePresence mode="wait">
              {/* Password Stage */}
              {stage === 'password' && (
                <motion.div
                  className={`stage-container ${crtFlicker ? 'crt-flicker-anim' : ''}`}
                  key="password"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* CRT Lock - Simple Blink */}
                  <div className="lock-container">
                    <span className={`lock-icon ${loading ? 'unlocking' : ''}`}>
                      {loading ? '🔓' : '🔒'}
                    </span>
                  </div>

                  {/* Terminal Lines - Typing Effect */}
                  <div className="terminal-lines">
                    <div className="terminal-line">
                      <span className="line-prefix">{'>'}</span>
                      <span className="line-text">SYSTEM_READY... OK</span>
                    </div>
                    <div className="terminal-line">
                      <span className="line-prefix">{'>'}</span>
                      <span className="line-text">ENCRYPTION... 256-BIT</span>
                    </div>
                    <div className="terminal-line">
                      <span className="line-prefix">{'>'}</span>
                      <span className="line-text blink-text">AWAITING_INPUT_</span>
                    </div>
                  </div>

                  <h3 className="stage-title">
                    <span className="title-bracket">[</span>
                    ACCESS_CONTROL
                    <span className="title-bracket">]</span>
                  </h3>
                  <p className="stage-subtitle">ENTER_PASSPHRASE</p>

                  <div className="input-wrapper">
                    <span className="input-prefix">{'>'}</span>
                    <input
                      ref={pwInputRef}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                      type="password"
                      placeholder="••••••••"
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  <button
                    className="stage-btn"
                    onClick={handlePasswordSubmit}
                    disabled={loading || password.length === 0}
                  >
                    {loading ? 'VERIFYING...' : 'INITIATE_HANDSHAKE'}
                  </button>

                  {/* Raw Data Loading */}
                  {loading && (
                    <div className="crt-loading">
                      <div className="loading-text">
                        CONNECTING_TO_MAINFRAME...
                      </div>
                      <div className="loading-bar">
                        {Array(10).fill(0).map((_, i) => (
                          <span key={i} className="loading-block" style={{
                            animationDelay: `${i * 0.1}s`
                          }}>█</span>
                        ))}
                      </div>
                      <div className="raw-data">
                        {Math.random().toString(16).substr(2, 8).toUpperCase()} ::
                        {Math.random().toString(16).substr(2, 8).toUpperCase()}
                      </div>
                    </div>
                  )}

                  {err && (
                    <div className="error-box shake-anim">
                      <span className="error-icon">!</span>
                      <span className="error-text">{err}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Name Stage */}
              {stage === 'name' && (
                <motion.div
                  className={`stage-container ${crtFlicker ? 'crt-flicker-anim' : ''}`}
                  key="name"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="success-icon">
                    ✓
                  </div>
                  <h3 className="stage-title">
                    <span className="title-bracket">[</span>
                    IDENTITY_MODULE
                    <span className="title-bracket">]</span>
                  </h3>
                  <p className="stage-subtitle blink-text">INPUT_USER_ALIAS</p>
                  <div className="input-wrapper">
                    <span className="input-prefix">@</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                      placeholder="OPERATOR"
                      disabled={loading}
                      autoFocus
                      maxLength={16}
                    />
                  </div>
                  <button
                    className="stage-btn"
                    onClick={handleNameSubmit}
                    disabled={loading || !name.trim()}
                  >
                    {loading ? (
                      <span className="loading-bar">
                        {Array(5).fill(0).map((_, i) => (
                          <span key={i} className="loading-block" style={{
                            animationDelay: `${i * 0.1}s`
                          }}>█</span>
                        ))}
                      </span>
                    ) : (
                      <>ESTABLISH_CONNECTION</>
                    )}
                  </button>
                </motion.div>
              )}

              {/* Chat Stage */}
              {stage === 'chat' && (
                <motion.div
                  className="chat-container"
                  key="chat"
                  variants={stageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div ref={listRef} className="messages-area">
                    {messages.length === 0 && (
                      <div className="empty-chat">
                        <span className="empty-icon">💬</span>
                        <p>No messages yet. Say something!</p>
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <motion.div
                        key={i}
                        className={`message ${m.type}`}
                        style={m.type === 'chat' ? { '--name-color': nameColor(m.name) } : undefined}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.05 }}
                      >
                        {m.type === 'chat' ? (
                          <>
                            <span className="msg-name">{m.name}</span>
                            <span className="msg-text">{m.text}</span>
                            <span className="msg-time">
                              {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        ) : (
                          <span className="msg-system">{m.text}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Emoji Picker */}
                  <AnimatePresence>
                    {showEmoji && (
                      <motion.div
                        className="emoji-picker-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 300 }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          theme="dark"
                          width="100%"
                          height={300}
                          searchDisabled
                          skinTonesDisabled
                          previewConfig={{ showPreview: false }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Composer */}
                  <div className="composer">
                    <motion.button
                      className={`emoji-btn ${showEmoji ? 'active' : ''}`}
                      onClick={() => setShowEmoji(!showEmoji)}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      😊
                    </motion.button>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder="Type a message..."
                      maxLength={500}
                    />
                    <motion.button
                      className="send-btn"
                      onClick={send}
                      disabled={!text.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="send-icon">▶</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer scanline effect */}
          <div className="scanline" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
