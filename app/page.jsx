'use client';

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
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
import CyberSelect from './components/CyberSelect';
import PixelCard from './components/PixelCard';
import TicTacToe from './components/TicTacToe';
import ExperimentViewer from './components/ExperimentViewer';
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

const FruitNinja = lazy(() => import('./components/FruitNinja'));
const LudoGame = lazy(() => import('./components/Ludo'));

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
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    setLabLoading(true);
    setLabError(null);
    getExperiments()
      .then(data => {
        setLabData(data);
      })
      .catch(err => {
        console.error("Experiment Fetch Error:", err);
        setLabError('Failed to load experiments. Please refresh the page.');
      })
      .finally(() => setLabLoading(false));
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
  const [labLoading, setLabLoading] = useState(true);
  const [labError, setLabError] = useState(null);

  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const overlayRef = useRef(null);


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
        <div className="glass-panel no-corner-accent" id="selector-ui" style={{ margin: '1.5rem auto', maxWidth: '1200px', padding: '1.5rem', border: '1px solid rgba(0, 255, 140, 0.15)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
          <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
            <CyberSelect
              label="Academic Year"
              placeholder="Select Year"
              value={selectedYear}
              onChange={(val) => {
                setSelectedYear(val);
                setSelectedSubject('');
                setSelectedExperiment('');
              }}
              options={years.map(y => ({ value: y, label: y }))}
            />
            <CyberSelect
              label="Subject"
              placeholder="Select Subject"
              value={selectedSubject}
              onChange={(val) => {
                setSelectedSubject(val);
                setSelectedExperiment('');
              }}
              options={subjects.map(s => ({ value: s, label: s }))}
              disabled={!selectedYear}
            />
            <CyberSelect
              label="Experiment"
              placeholder="Select Experiment"
              value={selectedExperiment}
              onChange={(val) => setSelectedExperiment(val)}
              options={experiments.map(exp => ({
                value: exp,
                label: labData[selectedYear]?.[selectedSubject]?.[exp]?.title || exp,
              }))}
              disabled={!selectedSubject}
            />
          </div>
        </div>
      )}

      {/* Arcade Section */}
      {showArcade && (
        <div className="arcade-container-enhanced" id="arcade-section" style={{ margin: isMobile ? '0.75rem auto' : '1.5rem auto', maxWidth: '1200px', padding: isMobile ? '1rem' : '1.5rem' }}>
          <div className="arcade-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '1rem' : '1.5rem', gap: '0.75rem' }}>
            <h2 className="arcade-title" style={{ color: 'var(--color-accent-green)', margin: 0, fontSize: isMobile ? '1.3rem' : undefined }}>ARCADE</h2>
            {!isMobile && <CoinFlip />}

            <button
              className="neon-button-green"
              onClick={closeArcade}
              style={{ padding: isMobile ? '0.6rem 1.2rem' : '0.5rem 1rem', fontSize: '1.2rem', lineHeight: 1, minWidth: '44px', minHeight: '44px', display: 'grid', placeItems: 'center' }}
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
              { name: 'Fruit Ninja', id: 'fruit-ninja' },
              { name: 'Ludo', id: 'ludo' }
            ]}
            numVisible={4}
            numScroll={1}
            responsiveOptions={[
              { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
              { breakpoint: '768px', numVisible: 3, numScroll: 1 },
              { breakpoint: '560px', numVisible: 2, numScroll: 1 }
            ]}
            itemTemplate={(game) => {
              const isActive = activeGame === game.id;
              const label = (
                <span style={{
                  fontFamily: "'Bungee', sans-serif",
                  fontSize: isMobile ? '0.9rem' : '0.85rem',
                  color: isActive ? '#00ff8c' : 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  transition: 'color 0.3s ease',
                }}>
                  {game.name}
                </span>
              );
              const cardStyle = {
                height: isMobile ? '64px' : '80px',
                background: isActive ? 'rgba(0, 255, 140, 0.06)' : 'rgba(10, 10, 10, 0.8)',
                borderRadius: '12px',
                border: `1px solid ${isActive ? 'rgba(0, 255, 140, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                boxShadow: isActive ? '0 0 20px rgba(0, 255, 140, 0.12)' : 'none',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              };
              return (
                <div style={{ padding: '0.4rem' }} onClick={() => setActiveGame(game.id)}>
                  {isMobile ? (
                    <div style={cardStyle}>{label}</div>
                  ) : (
                    <PixelCard
                      gap={7}
                      speed={40}
                      colors={isActive ? '#00ff8c,#00cc70,#005c33' : '#333,#444,#222'}
                      style={cardStyle}
                    >
                      {label}
                    </PixelCard>
                  )}
                </div>
              );
            }}
            style={{ padding: '1rem 0' }}
          />

          {/* Game Containers */}
          <div>
            {activeGame === 'tic-tac-toe' && <TicTacToe />}

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

            {activeGame === 'ludo' && (
              <div className="game-container active" id="ludo-container">
                <ErrorBoundary>
                  <Suspense fallback={<div className="suspense-fallback"><div className="skeleton-bar" /></div>}>
                    <LudoGame />
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
        {labLoading && (
          <div className="glass-panel" style={{ margin: '1.5rem auto', maxWidth: '1200px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-accent-green)', fontFamily: "'Roboto Mono', monospace" }}>Loading experiments...</p>
          </div>
        )}
        {labError && (
          <div className="glass-panel" style={{ margin: '1.5rem auto', maxWidth: '1200px', padding: '2rem', textAlign: 'center', borderColor: 'rgba(255, 80, 80, 0.3)' }}>
            <p style={{ color: '#ff5050', fontFamily: "'Roboto Mono', monospace" }}>{labError}</p>
          </div>
        )}
        {selectedYear && subjects.length === 0 && !labLoading && (
          <div className="glass-panel">
            <h2 className="arcade-title mb-4">No Subjects Available</h2>
            <p className="text-center text-cyberpunk-green">This year has no subjects yet. Check back later!</p>
          </div>
        )}
        {currentExperiment && (
          <ExperimentViewer experiment={currentExperiment} selectedSubject={selectedSubject} />
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
