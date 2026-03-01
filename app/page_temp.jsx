import React, { useState, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import { labData } from './data/labData';
import ErrorBoundary from './components/ErrorBoundary';
import SecretChat from './components/SecretChat';
const Doom = lazy(() => import('./components/Doom'));
const ChessGame = lazy(() => import('./components/Chess'));
const Flappy = lazy(() => import('./components/Flappy'));
const Game2048 = lazy(() => import('./components/Game2048'));
const SnakeGame = lazy(() => import('./components/Snake'));
const TetrisGame = lazy(() => import('./components/Tetris'));
const PongGame = lazy(() => import('./components/Pong'));
const SpaceInvaders = lazy(() => import('./components/SpaceInvadersNeon'));
const Breakout = lazy(() => import('./components/Breakout'));

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState('');
  const [currentExperiment, setCurrentExperiment] = useState(null);
  const [showArcade, setShowArcade] = useState(false);
  const [activeGame, setActiveGame] = useState('tic-tac-toe');
  const [showSelector, setShowSelector] = useState(true);

  // prevent page scroll during gameplay across all arcade games
  useEffect(() => {
    function onKeyDown(e) {
      if (!showArcade) return;
      const target = e.target;
      const tag = (target?.tagName || '').toLowerCase();
      const isEditable = target?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
      if (isEditable) return;
      const k = e.key?.toLowerCase();
      if (k === 'arrowleft' || k === 'arrowright' || k === 'arrowup' || k === 'arrowdown' || k === ' ' || k === 'spacebar' || k === 'pageup' || k === 'pagedown') {
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showArcade]);
  const [showExperiment, setShowExperiment] = useState(true);
  const [secretOpen, setSecretOpen] = useState(false);
  // Tic-Tac-Toe state
  const [tttBoard, setTttBoard] = useState(Array(9).fill(null));
  const [tttXIsNext, setTttXIsNext] = useState(true);
  const [tttVsComputer, setTttVsComputer] = useState(true);
  const tttWinner = calculateTttWinner(tttBoard);

  const canvasRef = useRef(null);
  const coinRef = useRef(null);
  const coinRotation = useRef(0);
  const titleRef = useRef(null);
  const overlayRef = useRef(null);
  const tttAiTimeout = useRef(null);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update current experiment when selections change
  useEffect(() => {
    if (selectedYear && selectedSubject && selectedExperiment) {
      const experiment = labData[selectedYear]?.[selectedSubject]?.[selectedExperiment];
      setCurrentExperiment(experiment);
    } else {
      setCurrentExperiment(null);
    }
  }, [selectedYear, selectedSubject, selectedExperiment]);

  // Original particle background with "zemo" watermark
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let dots = [];
    let animationFrameId;
    const off = document.createElement('canvas');
    const octx = off.getContext('2d', { willReadFrequently: true });

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function buildDots() {
      if (canvas.width === 0 || canvas.height === 0) {
        requestAnimationFrame(buildDots);
        return;
      }
      dots = [];
      off.width = canvas.width;
      off.height = canvas.height;
      const text = 'zemo';
      const fontSize = Math.min(Math.max(window.innerWidth * 0.25, 120), 220);
      octx.clearRect(0, 0, off.width, off.height);
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.font = `bold ${fontSize}px 'Bungee'`;
      octx.fillStyle = '#ffffff';
      const cy = Math.min(canvas.height * 0.58, canvas.height - fontSize * 0.6);
      octx.fillText(text, canvas.width / 2, cy);
      const img = octx.getImageData(0, 0, off.width, off.height);
      const step = 7; // grid step
      for (let y = 0; y < img.height; y += step) {
        for (let x = 0; x < img.width; x += step) {
          const a = img.data[(y * 4 * img.width) + (x * 4) + 3];
          if (a > 128) {
            dots.push({ x, y, seed: Math.random() * 1000 });
          }
        }
      }
    }

    function animate(ts = 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dark = document.documentElement.classList.contains('dark');
      const base = dark ? [0, 255, 140] : [0, 0, 0];
      const scan = (Math.sin(ts * 0.001 * 0.5) + 1) * 0.5; // 0..1 slow scanline factor
      const r = 2; // dot radius
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        // per-dot flicker with multiple frequencies for more dynamic effect
        const flick1 = Math.sin((ts * 0.006) + d.seed);
        const flick2 = Math.sin((ts * 0.01) + d.seed * 2);
        const flick = 0.8 + 0.2 * ((flick1 + flick2) * 0.5 + 0.5);
        // vertical scanline brightness boost
        const scanBoost = 0.75 + 0.25 * Math.cos((d.y / canvas.height) * Math.PI * 2 + scan * Math.PI * 2);
        const a = (dark ? 0.7 : 0.5) * flick * scanBoost;
        ctx.shadowColor = `rgba(${base[0]}, ${base[1]}, ${base[2]}, 0.5)`;
        ctx.shadowBlur = 5;
        ctx.fillStyle = `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${a})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    function start() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      resizeCanvas();
      buildDots();
      animate();
    }

    resizeCanvas();
    window.addEventListener('resize', start);

    start();

    return () => {
      window.removeEventListener('resize', start);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  // Title glitch effect
  useEffect(() => {
    const target = titleRef.current;
    if (!target) return;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>";
    let interval = null;
    const originalText = "ZEMO'S VAULT";

    const handleMouseOver = () => {
      let iteration = 0;
      clearInterval(interval);
      interval = setInterval(() => {
        target.innerText = originalText.split("").map((letter, index) => {
          if (index < iteration) return originalText[index];
          return letters[Math.floor(Math.random() * letters.length)];
        }).join("");
        if (iteration >= originalText.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 30);
    };

    target.addEventListener('mouseover', handleMouseOver);
    return () => {
      target.removeEventListener('mouseover', handleMouseOver);
      if (interval) clearInterval(interval);
    };
  }, []);

  // Overlay effects
  useEffect(() => {
    const overlayContainer = overlayRef.current;
    if (!overlayContainer) return;

    const scanner = overlayContainer.querySelector('.scanner');
    const shatterContainer = overlayContainer.querySelector('.scanner-shatter');
    const rainCanvas = overlayContainer.querySelector('#bit-rain-canvas');
    const rainCtx = rainCanvas?.getContext('2d');
    const crtOverlay = overlayContainer.querySelector('.crt-overlay');

    const timeouts = [];
    const intervals = [];
    let rainAfId = 0;
    let columns = [];

    const addTimeout = (callback, delay) => {
      const id = setTimeout(() => {
        callback();
      }, delay);
      timeouts.push(id);
      return id;
    };

    const wait = (ms) => new Promise((resolve) => {
      addTimeout(resolve, ms);
    });

    let corruptionLevel = 0;
    const cleanChars = '01';
    const glitchChars = '#?*&§%$@!';

    const resetScannerAnimation = () => {
      if (!scanner) return;
      scanner.classList.remove('animate');
      void scanner.offsetWidth; // force reflow
      scanner.classList.add('animate');
    };

    const resetCRTAnimation = () => {
      if (!crtOverlay) return;
      crtOverlay.classList.remove('animate');
      void crtOverlay.offsetWidth;
      crtOverlay.classList.add('animate');
    };

    const triggerShatterEffect = () => {
      if (!shatterContainer) return;
      shatterContainer.classList.add('animate');
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'shatter-particle';
        const xStart = Math.random() * window.innerWidth;
        const yStart = Math.random() * window.innerHeight;
        const xOffset = (Math.random() - 0.5) * 800;
        const yOffset = (Math.random() - 1) * 400;
        particle.style.left = `${xStart}px`;
        particle.style.top = `${yStart}px`;
        particle.style.setProperty('--x-end', `${xOffset}px`);
        particle.style.setProperty('--y-end', `${yOffset}px`);
        shatterContainer.appendChild(particle);
        addTimeout(() => particle.remove(), 2000);
      }
    };

    function initRainColumns() {
      if (!rainCanvas || !rainCtx) return;
      rainCanvas.width = window.innerWidth;
      rainCanvas.height = window.innerHeight;
      const cw = rainCanvas.width;
      const ch = rainCanvas.height;
      const colW = 20; // column width (legacy-ish spacing)
      const count = Math.ceil(cw / colW);
      const rows = Math.ceil(ch / 26) + 6;
      columns = Array.from({ length: count }, (_, i) => ({
        x: i * colW + (Math.random() * 4 - 2),
        head: Math.floor(Math.random() * rows),
        speed: 1.1 + Math.random() * 0.6, // slightly faster baseline
      }));
    }

    function drawRain(ts = 0) {
      if (!rainCanvas || !rainCtx) return;
      const cw = rainCanvas.width;
      const ch = rainCanvas.height;
      rainCtx.clearRect(0, 0, cw, ch);
      const lineH = 26; // legacy-ish line height
      const rows = Math.ceil(ch / lineH) + 6;
      const headColor = 'rgba(0,255,140,0.9)';
      const tailColor = 'rgba(0,255,140,0.15)';
      const charSetLvl = (lvl) => lvl === 0 ? '01' : (lvl === 1 ? '01#?*&%$@!' : '#?*&§%$@!');
      rainCtx.font = '18px "Roboto Mono", monospace';
      rainCtx.textAlign = 'center';
      rainCtx.textBaseline = 'top';
      for (const col of columns) {
        let speedMul = 1;
        if (corruptionLevel === 1) speedMul = 1.35;
        if (corruptionLevel === 2) speedMul = 1.7; // fast-paced end
        col.head -= col.speed * speedMul;
        if (col.head < -8) col.head = rows - 1;
        const tail = 6; // slightly shorter tail like legacy
        for (let i = 0; i <= tail; i++) {
          const r = Math.floor(col.head) + i;
          const y = r * lineH;
          if (y < -lineH || y > ch + lineH) continue;
          const t = i / tail;
          const a = 0.95 * (1 - t);
          const chars = charSetLvl(corruptionLevel);
          const chx = chars[Math.floor(Math.random() * chars.length)];
          rainCtx.fillStyle = i === 0 ? headColor : `rgba(0,255,140,${a * 0.6})`;
          if (corruptionLevel > 0 && Math.random() < 0.10) { // subtler purple bursts
            rainCtx.fillStyle = i === 0 ? 'rgba(255,119,233,0.9)' : 'rgba(255,119,233,0.42)';
          }
          rainCtx.fillText(chx, col.x + 9, y);
        }
      }
      rainAfId = requestAnimationFrame(drawRain);
    }

    const triggerBitRain = () => {
      if (!rainCanvas || !rainCtx) return;
      initRainColumns();
      if (rainAfId) cancelAnimationFrame(rainAfId);
      rainAfId = requestAnimationFrame(drawRain);
    };

    const runOverlaySequence = async () => {
      if (!overlayContainer) return;
      overlayContainer.classList.add('active');
      if (shatterContainer) {
        shatterContainer.classList.remove('animate');
        shatterContainer.innerHTML = '';
      }
      if (rainAfId) { cancelAnimationFrame(rainAfId); rainAfId = 0; }
      corruptionLevel = 0;
      resetCRTAnimation();
      resetScannerAnimation();

      await new Promise((resolve) => {
        if (!scanner) {
          resolve();
          return;
        }
        const onEnd = (event) => {
          if (event.animationName === 'cyber-scan') {
            scanner.removeEventListener('animationend', onEnd);
            resolve();
          }
        };
        scanner.addEventListener('animationend', onEnd);
      });

      triggerShatterEffect();
      await wait(200);
      triggerBitRain();

      addTimeout(() => {
        overlayContainer.classList.remove('active');
        if (shatterContainer) shatterContainer.classList.remove('animate');
        if (scanner) scanner.classList.remove('animate');
        if (crtOverlay) crtOverlay.classList.remove('animate');
      }, 9000);

      addTimeout(() => { corruptionLevel = 1; }, 2300);
      addTimeout(() => { corruptionLevel = 2; }, 4700);
    };

    runOverlaySequence();
    const intervalId = setInterval(() => {
      timeouts.forEach(clearTimeout);
      timeouts.length = 0;
      if (shatterContainer) shatterContainer.innerHTML = '';
      if (rainAfId) { cancelAnimationFrame(rainAfId); rainAfId = 0; }
      runOverlaySequence();
    }, 300000);
    intervals.push(intervalId);

    return () => {
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
      addTimeout(() => {
        overlayContainer.classList.remove('active');
        if (rainAfId) { cancelAnimationFrame(rainAfId); rainAfId = 0; }
        if (shatterContainer) shatterContainer.classList.remove('animate');
        if (scanner) scanner.classList.remove('animate');
        if (crtOverlay) crtOverlay.classList.remove('animate');
      }, 7000);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    if (newTheme) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const showToast = (message, duration = 2200) => {
    const toast = document.createElement('div');
    toast.className = 'coinflip-toast';
    toast.textContent = message;
    const host = document.getElementById('coin-flipper-widget') || document.body;
    host.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 200);
    }, duration);
  };

  const flipCoin = () => {
    const coin = coinRef.current;
    if (!coin) return;

    const spins = Math.floor(Math.random() * 4) + 5;
    const randomOffset = Math.random() * 360; // Random starting point for more dynamic spins
    const baseSpin = 720; // Ensure at least 2 full spins for visible animation
    coinRotation.current += baseSpin + randomOffset;

    const isHeadsResult = Math.random() < 0.5;
    const resultText = isHeadsResult ? 'Heads' : 'Tails';

    const finalOrientation = ((coinRotation.current % 360) + 360) % 360;
    const target = isHeadsResult ? 180 : 0;
    const delta = (target - finalOrientation + 360) % 360;
    coinRotation.current += delta;

    coin.style.transform = `rotateY(${coinRotation.current}deg)`;

    setTimeout(() => {
      showToast(`${resultText}!`, 3000);
    }, 900);
  };

  const openArcade = () => {
    setShowSelector(false);
    setShowExperiment(false);
    setShowArcade(true);
  };

  const closeArcade = () => {
    setShowArcade(false);
    setShowSelector(true);
    setShowExperiment(true);
  };

  function handleTttClick(index) {
    if (tttWinner || tttBoard[index]) return;
    if (tttVsComputer && !tttXIsNext) return;
    setTttBoard((prev) => {
      if (prev[index]) return prev;
      const next = prev.slice();
      next[index] = tttXIsNext ? 'X' : 'O';
      return next;
    });
    setTttXIsNext((prev) => !prev);
  }

  function restartTtt() {
    if (tttAiTimeout.current) {
      clearTimeout(tttAiTimeout.current);
      tttAiTimeout.current = null;
    }
    setTttBoard(Array(9).fill(null));
    setTttXIsNext(true);
  }

  function isTttBoardFull(board) {
    return board.every((cell) => cell);
  }

  function calculateTttWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }

  function minimax(board, isMaximizing) {
    const winner = calculateTttWinner(board);
    if (winner === 'X') return 1;
    if (winner === 'O') return -1;
    if (isTttBoardFull(board)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
          board[i] = 'X';
          const score = minimax(board, false);
          board[i] = null;
          bestScore = Math.max(bestScore, score);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
          board[i] = 'O';
          const score = minimax(board, true);
          board[i] = null;
          bestScore = Math.min(bestScore, score);
        }
      }
      return bestScore;
    }
  }

  function findBestTttMove(board) {
    let bestScore = Infinity;
    let move = null;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const score = minimax(board, true);
        board[i] = null;
        if (score < bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  useEffect(() => {
    if (!tttVsComputer) return;
    if (tttWinner) return;
    if (tttXIsNext) return;
    if (isTttBoardFull(tttBoard)) return;

    if (tttAiTimeout.current) {
      clearTimeout(tttAiTimeout.current);
    }

    const currentBoard = tttBoard.slice();
    const move = findBestTttMove(currentBoard);
    if (move === null) return undefined;

    tttAiTimeout.current = setTimeout(() => {
      setTttBoard((prev) => {
        if (calculateTttWinner(prev) || isTttBoardFull(prev) || prev[move]) {
          return prev;
        }
        const next = prev.slice();
        next[move] = 'O';
        return next;
      });
      setTttXIsNext(true);
    }, 300);

    return () => {
      if (tttAiTimeout.current) {
        clearTimeout(tttAiTimeout.current);
        tttAiTimeout.current = null;
      }
    };
  }, [tttVsComputer, tttXIsNext, tttWinner, tttBoard]);

  const toggleTttMode = () => {
    setTttVsComputer((prev) => !prev);
    restartTtt();
  };

  const tttStatus = useMemo(() => {
    if (tttWinner) return `${tttWinner} wins`;
    if (isTttBoardFull(tttBoard)) return 'Draw';
    if (tttVsComputer) {
      return tttXIsNext ? 'Your move (X)' : 'Computer is thinking…';
    }
    return `Turn: ${tttXIsNext ? 'X' : 'O'}`;
  }, [tttWinner, tttBoard, tttVsComputer, tttXIsNext]);

  const years = Object.keys(labData);
  const subjects = selectedYear ? Object.keys(labData[selectedYear]) : [];
  const experiments = selectedYear && selectedSubject ? Object.keys(labData[selectedYear][selectedSubject]) : [];

  return (
    <div className="main-container">
      {/* Particle Background Canvas */}
      <canvas
        ref={canvasRef}
        id="particle-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2,
          pointerEvents: 'none'
        }}
      />

      {/* Overlay Effects (disabled while Flappy is active to allow input) */}
      {!(showArcade && activeGame === 'flappy') && (
        <div ref={overlayRef} className="overlay-container" id="overlay-container">
          <div className="crt-overlay"></div>
          <div className="scanner" id="scanner"></div>
          <div className="scanner-shatter" id="scanner-shatter"></div>
          <canvas className="bit-rain-canvas" id="bit-rain-canvas" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }} />
        </div>
      )}

      {/* Header */}
      <header className="header">
        <h1 className="title">
          <span ref={titleRef} id="animated-title" data-value="ZEMO'S VAULT">
            ZEMO'S VAULT
          </span>
          <span
            className="alien-emoji"
            onClick={openArcade}
            style={{ cursor: 'pointer' }}
          >
            👾
          </span>
        </h1>

        <div className="theme-toggle" onClick={toggleTheme}>
          <div className={`toggle-switch ${isDarkMode ? 'active' : ''}`}>
            <div className="toggle-knob"></div>
          </div>
        </div>
      </header>

      {/* Selector */}
      {showSelector && (
        <div className="glass-panel" id="selector-ui">
          <div className="grid grid-cols-3">
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                className="form-select"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedSubject('');
                  setSelectedExperiment('');
                }}
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedExperiment('');
                }}
                disabled={!selectedYear}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experiment</label>
              <select
                className="form-select"
                value={selectedExperiment}
                onChange={(e) => setSelectedExperiment(e.target.value)}
                disabled={!selectedSubject}
              >
                <option value="">Select Experiment</option>
                {experiments.map(exp => (
                  <option key={exp} value={exp}>
                    {labData[selectedYear]?.[selectedSubject]?.[exp]?.title || exp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Arcade Section */}
      {showArcade && (
        <div className="arcade-section" id="arcade-section">
          <div className="arcade-header">
            <h2 className="arcade-title">ARCADE</h2>
            <button
              className="close-btn"
              onClick={closeArcade}
            >
              ×
            </button>
          </div>

          <div className="game-buttons">
            <button
              className={`game-btn ${activeGame === 'tic-tac-toe' ? 'active' : ''}`}
              onClick={() => setActiveGame('tic-tac-toe')}
            >
              Tic-Tac-Toe
            </button>
            <button
              className={`game-btn ${activeGame === '2048' ? 'active' : ''}`}
              onClick={() => setActiveGame('2048')}
            >
              2048
            </button>
            <button
              className={`game-btn ${activeGame === 'snake' ? 'active' : ''}`}
              onClick={() => setActiveGame('snake')}
            >
              Snake
            </button>
            <button
              className={`game-btn ${activeGame === 'tetris' ? 'active' : ''}`}
              onClick={() => setActiveGame('tetris')}
            >
              Tetris
            </button>
            <button
              className={`game-btn ${activeGame === 'pong' ? 'active' : ''}`}
              onClick={() => setActiveGame('pong')}
            >
              Pong
            </button>
            <button
              className={`game-btn ${activeGame === 'breakout' ? 'active' : ''}`}
              onClick={() => setActiveGame('breakout')}
            >
              Breakout
            </button>
            <button
              className={`game-btn ${activeGame === 'space' ? 'active' : ''}`}
              onClick={() => setActiveGame('space')}
            >
              Space Invaders
            </button>
            <button
              className={`game-btn ${activeGame === 'flappy' ? 'active' : ''}`}
              onClick={() => setActiveGame('flappy')}
            >
              Flappy
            </button>
            <button
              className={`game-btn ${activeGame === 'chess' ? 'active' : ''}`}
              onClick={() => setActiveGame('chess')}
            >
              Chess
            </button>

            <button
              className={`game-btn ${activeGame === 'doom' ? 'active' : ''}`}
              onClick={() => setActiveGame('doom')}
            >
              Doom
            </button>
          </div>

          {/* Game Containers */}
          <div>
            {activeGame === 'tic-tac-toe' && (
              <div className="game-container active" id="tic-tac-toe-container">
                <h3 className="game-title">Tic-Tac-Toe</h3>
                <div className="flex justify-center items-center gap-4 mb-4">
                  <button className="control-btn" onClick={toggleTttMode}>
                    Mode: {tttVsComputer ? 'Player vs Computer' : 'Player vs Player'}
                  </button>
                  <button className="control-btn" onClick={restartTtt}>Restart</button>
                </div>
                <div className="ttt-board" id="tic-tac-toe-board">
                  {Array.from({ length: 9 }, (_, i) => (
                    <button
                      key={i}
                      className="ttt-cell"
                      onClick={() => handleTttClick(i)}
                    >
                      {tttBoard[i]}
                    </button>
                  ))}
                </div>
                <p className="text-center text-green mt-4" id="tic-tac-toe-status">
                  {tttStatus}
                </p>
              </div>
            )}

            {activeGame === '2048' && (
              <div className="game-container active" id="game-2048">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <Game2048 />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}

            {activeGame === 'snake' && (
              <div className="game-container active" id="snake-container">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <SnakeGame />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}

            {activeGame === 'tetris' && (
              <div className="game-container active" id="tetris-container">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <TetrisGame />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}

            {activeGame === 'pong' && (
              <div className="game-container active" id="pong-container">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <PongGame />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}

            {activeGame === 'breakout' && (
              <div className="game-container active" id="breakout-container">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <Breakout />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}

            {activeGame === 'space' && (
              <div className="game-container active" id="space-invaders-container">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <SpaceInvaders />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}

            {activeGame === 'flappy' && (
              <div className="game-container active" id="flappy-container">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <Flappy />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}

            {activeGame === 'chess' && (
              <div className="game-container active" id="chess-container">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <ChessGame />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}



            {activeGame === 'doom' && (
              <div className="game-container active" id="doom-container">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <Doom />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experiment Display */}
      <div id="experiment-display">
        {selectedYear && subjects.length === 0 && (
          <div className="glass-panel">
            <h2 className="arcade-title mb-4">No Subjects Available</h2>
            <p className="text-center text-cyberpunk-green">This year has no subjects yet. Check back later!</p>
          </div>
        )}
        {currentExperiment && (
          <div className="glass-panel">
            <h2 className="arcade-title mb-4">{currentExperiment.title}</h2>
            {currentExperiment.parts && currentExperiment.parts.map((part, index) => (
              <div key={index} className="mb-4">
                {part.subtitle && (
                  <h3 className="game-title mb-2">{part.subtitle}</h3>
                )}
                {part.code && (
                  <div className="code-section">
                    <div className="code-header">
                      <h4 className="code-title">Code:</h4>
                      <button
                        className="copy-btn"
                        onClick={() => {
                          let textToCopy = part.code;
                          if (selectedSubject === 'ML') {
                            textToCopy = textToCopy
                              .split('\\n')
                              .filter(line => !line.trim().startsWith('#'))
                              .join('\\n');
                          }
                          navigator.clipboard.writeText(textToCopy).then(() => {
                            showToast('Code copied to clipboard!', 2000);
                          });
                        }}
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="code-block"><code>{part.code}</code></pre>
                  </div>
                )}
                {part.explanation && (
                  <div className="code-section">
                    <div className="code-title">Explanation:</div>
                    <pre className="code-block"><code>{part.explanation}</code></pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className="footer">
        <p>
          made by
          <span onClick={() => setSecretOpen(true)} style={{ cursor: 'pointer', color: '#00ff8c' }}> zemo </span>
          powered by big D and support from Guzz
        </p>
      </footer>

      {/* Coin Flip Widget (legacy) */}
      <div className="coin-widget" id="coin-flipper-widget" onClick={flipCoin} role="button" aria-label="Flip coin" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCoin(); } }}>
        <div
          ref={coinRef}
          className="coin"
          id="coin"
        >
          <div className="coin-face coin-front">
            {/* 8-bit coin for Tails with 8-bit Rose icon */}
            <svg width="60" height="60" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
              <g>
                {/* The coin border (Tails color) */}
                <path fillRule="evenodd" d="M4 1 H12 V2 H14 V4 H15 V12 H14 V14 H12 V15 H4 V14 H2 V12 H1 V4 H2 V2 H4 Z M4 3 H12 V4 H13 V12 H12 V13 H4 V12 H3 V4 H4 Z" fill="#00ff8c" />
                {/* The 8-bit fallen rose */}
                {/* Petals (bright pink) */}
                <path d="M5 6 H7 V7 H5 V6 Z" fill="#ff4dd6" />
                <path d="M7 6 H9 V7 H7 V6 Z" fill="#ff4dd6" />
                <path d="M6 7 H9 V8 H6 V7 Z" fill="#ff4dd6" />
                <path d="M5 8 H8 V9 H5 V8 Z" fill="#ff4dd6" />
                {/* Petal shadow (darker magenta) */}
                <path d="M8 7 H9 V8 H8 V7 Z" fill="#d03ab5" />
                <path d="M7 8 H8 V9 H7 V8 Z" fill="#d03ab5" />
                {/* Stem and leaf (neon green) */}
                <path d="M9 8 H12 V9 H9 V8 Z" fill="#26d07c" />
                <path d="M10 9 H11 V10 H10 V9 Z" fill="#26d07c" />
                <path d="M11 9 H12 V10 H11 V9 Z" fill="#17b56a" />
                {/* Fallen leaf */}
                <path d="M8 9 H9 V10 H8 V9 Z" fill="#17b56a" />
              </g>
            </svg>
          </div>
          <div className="coin-face coin-back">
            {/* 8-bit coin for Heads with Z icon */}
            <svg width="60" height="60" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
              <g fill="#8cffc7">
                {/* Rounder coin shape */}
                <path fillRule="evenodd" d="M4 1 H12 V2 H14 V4 H15 V12 H14 V14 H12 V15 H4 V14 H2 V12 H1 V4 H2 V2 H4 Z M4 3 H12 V4 H13 V12 H12 V13 H4 V12 H3 V4 H4 Z" />
                {/* Z icon for Heads */}
                <path d="M5 5 H11 V6 L6 10 H11 V11 H5 V10 L10 6 H5 V5 Z" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <SecretChat open={secretOpen} onClose={() => setSecretOpen(false)} />
    </div>
  );
}

export default App;
