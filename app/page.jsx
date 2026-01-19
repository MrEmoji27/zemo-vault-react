'use client';

import React, { useState, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { getExperiments } from './actions/getExperiments';
import ErrorBoundary from './components/ErrorBoundary';
import SecretChat from './components/SecretChat';
import ASCIIText from './components/ASCIIText';
import AuroraBackground from './components/AuroraBackground';
import PixelTrail from './components/PixelTrail';
import MobileControls from './components/MobileControls';
import CoinFlip from './components/CoinFlip';
import ASCIIHeader from './components/ASCIIHeader';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Carousel } from 'primereact/carousel';
import 'primereact/resources/themes/lara-dark-cyan/theme.css';
import 'primeicons/primeicons.css';

const Doom = lazy(() => import('./components/Doom'));
const ChessGame = lazy(() => import('./components/ChessCanvas'));
const Flappy = lazy(() => import('./components/Flappy'));
const Game2048 = lazy(() => import('./components/Game2048'));
const SnakeGame = lazy(() => import('./components/Snake'));
const TetrisGame = lazy(() => import('./components/Tetris'));
const PongGame = lazy(() => import('./components/Pong'));
const SpaceInvaders = lazy(() => import('./components/SpaceInvadersNeon'));
const Breakout = lazy(() => import('./components/Breakout'));

// Helper function to map language to Prism identifier
const getPrismLanguage = (language) => {
  const langMap = {
    'python': 'python',
    'c': 'c',
    'c/cpp': 'cpp',
    'cpp': 'cpp',
    'javascript': 'javascript',
    'bash': 'bash',
    'text': 'text'
  };
  return langMap[language?.toLowerCase()] || 'text';
};
const FruitNinja = lazy(() => import('./components/FruitNinja'));

function App() {
  const [labData, setLabData] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState('');
  const [currentExperiment, setCurrentExperiment] = useState(null);
  const [showArcade, setShowArcade] = useState(false);
  const [activeGame, setActiveGame] = useState('tic-tac-toe');
  const [showSelector, setShowSelector] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    getExperiments()
      .then(data => {
        console.log("Experiments Loaded:", data);
        setLabData(data);
      })
      .catch(err => console.error("Experiment Fetch Error:", err));
  }, []);

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

  const [tttBoard, setTttBoard] = useState(Array(9).fill(null));
  const [tttXIsNext, setTttXIsNext] = useState(true);
  const [tttVsComputer, setTttVsComputer] = useState(true);
  const tttWinner = calculateTttWinner(tttBoard);

  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const overlayRef = useRef(null);
  const tttAiTimeout = useRef(null);


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


  useEffect(() => {
    if (selectedYear && selectedSubject && selectedExperiment) {
      const experiment = labData[selectedYear]?.[selectedSubject]?.[selectedExperiment];
      setCurrentExperiment(experiment);
    } else {
      setCurrentExperiment(null);
    }
  }, [selectedYear, selectedSubject, selectedExperiment]);




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
      void scanner.offsetWidth;
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
      const colW = 20;
      const count = Math.ceil(cw / colW);
      const rows = Math.ceil(ch / 26) + 6;
      columns = Array.from({ length: count }, (_, i) => ({
        x: i * colW + (Math.random() * 4 - 2),
        head: Math.floor(Math.random() * rows),
        speed: 1.1 + Math.random() * 0.6,
      }));
    }

    function drawRain(ts = 0) {
      if (!rainCanvas || !rainCtx) return;
      const cw = rainCanvas.width;
      const ch = rainCanvas.height;
      rainCtx.clearRect(0, 0, cw, ch);
      const lineH = 26;
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
        if (corruptionLevel === 2) speedMul = 1.7;
        col.head -= col.speed * speedMul;
        if (col.head < -8) col.head = rows - 1;
        const tail = 6;
        for (let i = 0; i <= tail; i++) {
          const r = Math.floor(col.head) + i;
          const y = r * lineH;
          if (y < -lineH || y > ch + lineH) continue;
          const t = i / tail;
          const a = 0.95 * (1 - t);
          const chars = charSetLvl(corruptionLevel);
          const chx = chars[Math.floor(Math.random() * chars.length)];
          rainCtx.fillStyle = i === 0 ? headColor : `rgba(0,255,140,${a * 0.6})`;
          if (corruptionLevel > 0 && Math.random() < 0.10) {
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
      {/* ASCIIText Background */}
      <ASCIIText
        text='zemo'
        enableWaves={true}
        asciiFontSize={8}
      />

      {/* Aurora Background - Subtle Ambient Glow */}
      <AuroraBackground />

      {/* Pixel Trail - 8-bit Mouse Effect */}
      <PixelTrail />

      {/* Header */}
      <ASCIIHeader onArcadeClick={openArcade} />

      {/* Selector */}
      {showSelector && (
        <div className="glass-panel" id="selector-ui" style={{ margin: '1.5rem auto', maxWidth: '1200px', padding: '1.5rem' }}>
          <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--color-accent-green)', marginBottom: '0.5rem', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Academic Year</label>
              <select
                className="form-select"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  padding: '0.75rem',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedSubject('');
                  setSelectedExperiment('');
                }}
              >
                <option value="" style={{ background: '#000' }}>Select Year</option>
                {years.map(year => (
                  <option key={year} value={year} style={{ background: '#000' }}>{year}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--color-accent-green)', marginBottom: '0.5rem', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Subject</label>
              <select
                className="form-select"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  padding: '0.75rem',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedExperiment('');
                }}
                disabled={!selectedYear}
              >
                <option value="" style={{ background: '#000' }}>Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject} style={{ background: '#000' }}>{subject}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--color-accent-green)', marginBottom: '0.5rem', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Experiment</label>
              <select
                className="form-select"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  padding: '0.75rem',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                value={selectedExperiment}
                onChange={(e) => setSelectedExperiment(e.target.value)}
                disabled={!selectedSubject}
              >
                <option value="" style={{ background: '#000' }}>Select Experiment</option>
                {experiments.map(exp => (
                  <option key={exp} value={exp} style={{ background: '#000' }}>
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
        <div className="arcade-container-enhanced" id="arcade-section" style={{ margin: '1.5rem auto', maxWidth: '1200px' }}>
          <div className="arcade-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="arcade-title" style={{ color: 'var(--color-accent-green)', margin: 0 }}>ARCADE</h2>
            {/* 3D Coin Flip Widget */}
            <CoinFlip />

            <button
              className="neon-button-green"
              onClick={closeArcade}
              style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', lineHeight: 1 }}
            >
              ×
            </button>
          </div>


          {/* Game Carousel */}
          <Carousel
            value={[
              { name: 'Tic-Tac-Toe', id: 'tic-tac-toe' },
              { name: '2048', id: '2048' },
              { name: 'Snake', id: 'snake' },
              { name: 'Tetris', id: 'tetris' },
              { name: 'Pong', id: 'pong' },
              { name: 'Breakout', id: 'breakout' },
              { name: 'Space Invaders', id: 'space' },
              { name: 'Flappy', id: 'flappy' },
              { name: 'Chess', id: 'chess' },
              { name: 'Doom', id: 'doom' },
              { name: 'Fruit Ninja', id: 'fruit-ninja' }
            ]}
            numVisible={4}
            numScroll={1}
            responsiveOptions={[
              { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
              { breakpoint: '768px', numVisible: 2, numScroll: 1 },
              { breakpoint: '560px', numVisible: 1, numScroll: 1 }
            ]}
            itemTemplate={(game) => (
              <div style={{ padding: '0.5rem' }}>
                <button
                  className={`neon-button-green ${activeGame === game.id ? 'active' : ''}`}
                  onClick={() => setActiveGame(game.id)}
                  style={{
                    opacity: activeGame === game.id ? 1 : 0.7,
                    width: '100%'
                  }}
                >
                  {game.name}
                </button>
              </div>
            )}
            style={{ padding: '1rem 0' }}
          />

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
                      className={`ttt-cell ${tttBoard[i] === 'O' ? 'ai-mark' : tttBoard[i] === 'X' ? 'player-mark' : ''}`}
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

            {activeGame === 'fruit-ninja' && (
              <div className="game-container active" id="fruit-ninja-container">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <FruitNinja />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}
          </div>

          {/* Mobile Touch Controls */}
          {(['snake', 'tetris', '2048', 'pong', 'breakout', 'space', 'flappy', 'doom'].includes(activeGame)) && (
            <MobileControls
              showArrows={activeGame !== 'flappy'}
              showActions={['tetris', 'space', 'breakout', 'flappy', 'doom'].includes(activeGame)}
              onAction=" "
            />
          )}

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
          <div className="glass-panel-enhanced" style={{ margin: '1.5rem auto', maxWidth: '1200px' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}></div>
            <h2 className="arcade-title mb-4" style={{ color: 'var(--color-accent-green)', textAlign: 'center', marginBottom: '2rem' }}>{currentExperiment.title}</h2>
            {currentExperiment.parts && currentExperiment.parts.map((part, index) => (
              <div key={index} className="mb-4">
                {part.subtitle && (
                  <h3 className="game-title mb-2">{part.subtitle}</h3>
                )}
                {part.code && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div className="code-header-cyber">
                      <h4 className="code-title-cyber">Code:</h4>
                      <button
                        className="copy-btn-cyber"
                        onClick={() => {
                          navigator.clipboard.writeText(part.code).then(() => {
                            showToast('Code copied to clipboard!', 2000);
                          });
                        }}
                      >
                        Copy
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language={getPrismLanguage(part.language)}
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.85) 0%, rgba(15, 15, 20, 0.9) 100%)',
                        border: '1px solid rgba(0, 255, 140, 0.15)',
                        fontSize: '0.9rem',
                        lineHeight: '1.7',
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily: "'Fira Code', monospace",
                        }
                      }}
                      showLineNumbers={true}
                      wrapLines={true}
                    >
                      {part.code}
                    </SyntaxHighlighter>
                  </div>
                )}
                {part.explanation && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div className="code-title-cyber" style={{ marginBottom: '0.75rem' }}>Explanation:</div>
                    <div className="terminal-output">
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}><code>{part.explanation}</code></pre>
                    </div>
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

      <SecretChat open={secretOpen} onClose={() => setSecretOpen(false)} />
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#00ff8c',
          border: '1px solid #00ff8c',
        }
      }} />
    </div>
  );
}

export default App;
