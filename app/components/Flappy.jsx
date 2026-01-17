'use client';

import React, { useEffect, useRef, useState } from 'react';
import './Flappy.css';

export default function Flappy() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [prevScore, setPrevScore] = useState(0);
  const scoreRef = useRef(0);
  const aliveRef = useRef(true);
  const controlsRef = useRef({ start: () => { }, togglePause: () => { } });
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const overlayRef = useRef(null);
  const prevFocusRef = useRef(null);

  // keep refs in sync with state
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => {
    setPrevScore(scoreRef.current);
    scoreRef.current = score;
  }, [score]);

  // a11y: focus overlay when visible and restore on close
  useEffect(() => {
    const visible = !running;
    if (visible) {
      prevFocusRef.current = document.activeElement;
      const el = overlayRef.current;
      if (el) {
        try { el.focus(); } catch (_) { }
      }
    } else {
      const pf = prevFocusRef.current;
      if (pf && typeof pf.focus === 'function') {
        try { pf.focus(); } catch (_) { }
      }
      prevFocusRef.current = null;
    }
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 720; let H = 420;
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    function resize() {
      const rectW = Math.min(window.innerWidth * 0.9, 900);
      const rectH = rectW * (H / W);
      canvas.style.width = rectW + 'px';
      canvas.style.height = rectH + 'px';
      canvas.width = rectW * DPR;
      canvas.height = rectH * DPR;
    }
    resize();
    window.addEventListener('resize', resize);
    setTimeout(() => { try { canvas.focus(); } catch (_) { } }, 0);

    // Game state
    let bird = { x: 0.22, y: 0.5, vy: 0, r: 0.018, wingPhase: 0, flapTime: 0 };
    let pipes = [];
    let particles = [];
    let t = 0;
    let alive = true;
    aliveRef.current = true;
    let best = Number(localStorage.getItem('flappy_best') || 0);
    let bgOffset = 0;
    let starField = [];

    // Initialize starfield
    for (let i = 0; i < 50; i++) {
      starField.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 0.003 + 0.001,
        speed: Math.random() * 0.02 + 0.01,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    function reset() {
      bird = { x: 0.22, y: 0.5, vy: 0, r: 0.018, wingPhase: 0, flapTime: 0 };
      pipes = [];
      particles = [];
      t = 0;
      alive = true;
      aliveRef.current = true;
      setScore(0);
    }

    const G = 1.45;
    const JUMP = -0.5;

    function spawnPipe() {
      const gap = 0.22;
      const center = 0.3 + Math.random() * 0.4;
      const x = 1.2;
      const w = 0.08;
      pipes.push({
        x, w,
        gapTop: center - gap / 2,
        gapBot: center + gap / 2,
        passed: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    function addParticle(x, y, vx, vy, color, life = 1) {
      particles.push({ x, y, vx, vy, color, life, maxLife: life, size: 0.005 + Math.random() * 0.005 });
    }

    function createExplosion(x, y) {
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = 0.3 + Math.random() * 0.4;
        addParticle(
          x, y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          ['#ffd43b', '#ff77e9', '#00ff8c'][Math.floor(Math.random() * 3)],
          0.8 + Math.random() * 0.4
        );
      }
    }

    function createFlapParticles(x, y) {
      for (let i = 0; i < 3; i++) {
        addParticle(
          x - bird.r,
          y + (Math.random() - 0.5) * bird.r,
          -0.2 - Math.random() * 0.1,
          (Math.random() - 0.5) * 0.2,
          '#00ff8c',
          0.4 + Math.random() * 0.2
        );
      }
    }

    function step(dt) {
      if (!alive) return;

      // Bird physics
      bird.vy += G * dt;
      bird.y += bird.vy * dt;
      bird.wingPhase += dt * 10;
      bird.flapTime -= dt;

      // Background animation
      bgOffset += dt * 0.05;

      // Starfield parallax
      starField.forEach(star => {
        star.x -= star.speed * dt * 0.05;
        if (star.x < 0) star.x = 1;
        star.twinkle += dt * 2;
      });

      // Spawn pipes
      t += dt;
      if (t > 1.3) { t = 0; spawnPipe(); }

      // Move pipes
      for (const p of pipes) {
        p.x -= 0.35 * dt;
        p.pulsePhase += dt * 3;
      }
      while (pipes.length && pipes[0].x + pipes[0].w < -0.2) pipes.shift();

      // Update particles
      particles = particles.filter(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += G * dt * 0.3;
        p.life -= dt;
        return p.life > 0;
      });

      // Scoring
      for (const p of pipes) {
        if (!p.passed && bird.x > p.x + p.w) {
          p.passed = true;
          // Score particles
          for (let i = 0; i < 10; i++) {
            addParticle(
              bird.x, bird.y,
              (Math.random() - 0.5) * 0.3,
              -Math.random() * 0.3,
              '#00ff8c',
              0.6
            );
          }
          setScore((s) => {
            const ns = s + 1;
            if (ns > best) {
              best = ns;
              localStorage.setItem('flappy_best', String(best));
            }
            return ns;
          });
        }
      }

      // Collisions
      if (bird.y - bird.r < 0 || bird.y + bird.r > 1) alive = false;
      for (const p of pipes) {
        const inX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + p.w;
        const inY = bird.y - bird.r > p.gapTop && bird.y + bird.r < p.gapBot;
        if (inX && !inY) { alive = false; break; }
      }

      if (!alive) {
        createExplosion(bird.x, bird.y);
        aliveRef.current = false;
        setRunning(false);
      }
    }

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.scale(w, h);

      // Layered background
      const g1 = ctx.createLinearGradient(0, 0, 0, 1);
      g1.addColorStop(0, '#0a0f1f');
      g1.addColorStop(0.5, '#0d1428');
      g1.addColorStop(1, '#05070d');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, 1, 1);

      // Animated stars
      ctx.fillStyle = '#ffffff';
      starField.forEach(star => {
        const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1;

      // Enhanced neon grid (animated)
      ctx.strokeStyle = 'rgba(0, 255, 140, 0.12)';
      ctx.lineWidth = 0.002;
      const gridOffset = (bgOffset % 0.05);
      for (let i = 0; i < 24; i++) {
        const y = (i * 0.05) - gridOffset;
        if (y >= 0 && y <= 1) {
          ctx.globalAlpha = 0.3 + Math.sin(bgOffset * 2 + i * 0.5) * 0.1;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1, y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Pipes with neon pulse
      for (const p of pipes) {
        const pulseIntensity = 0.25 + Math.sin(p.pulsePhase) * 0.15;

        ctx.fillStyle = `rgba(0, 255, 140, ${pulseIntensity * 0.4})`;
        ctx.strokeStyle = `rgba(0, 255, 140, ${pulseIntensity + 0.3})`;
        ctx.lineWidth = 0.006;

        // Top pipe
        ctx.beginPath();
        ctx.rect(p.x, 0, p.w, p.gapTop);
        ctx.fill();

        // Neon glow
        ctx.shadowColor = '#00ff8c';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Bottom pipe
        ctx.beginPath();
        ctx.rect(p.x, p.gapBot, p.w, 1 - p.gapBot);
        ctx.fill();
        ctx.shadowColor = '#00ff8c';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Edge highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 0.002;
        ctx.strokeRect(p.x, 0, p.w, p.gapTop);
        ctx.strokeRect(p.x, p.gapBot, p.w, 1 - p.gapBot);
      }

      // Particles
      particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      // Enhanced bird (8-bit style with animation)
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(Math.atan2(bird.vy, 0.8) * 0.3);

      // Pixelated effect
      const pixelSize = bird.r / 6;

      // Glow aura
      ctx.fillStyle = '#ff77e9';
      ctx.globalAlpha = 0.25 + Math.sin(bird.wingPhase) * 0.05;
      ctx.beginPath();
      ctx.arc(0, 0, bird.r * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Body (pixelated circles)
      ctx.fillStyle = '#ffd43b';
      for (let i = -3; i <= 3; i++) {
        for (let j = -3; j <= 3; j++) {
          const dist = Math.sqrt(i * i + j * j);
          if (dist < 3.5) {
            ctx.fillRect(i * pixelSize - pixelSize / 2, j * pixelSize - pixelSize / 2, pixelSize, pixelSize);
          }
        }
      }

      // Wing animation
      const wingOffset = Math.sin(bird.wingPhase) * bird.r * 0.3;
      ctx.fillStyle = '#ffed4e';
      ctx.fillRect(-bird.r * 0.8, wingOffset, bird.r * 0.5, pixelSize * 2);

      // Eye
      ctx.fillStyle = '#000';
      ctx.fillRect(bird.r * 0.2, -bird.r * 0.2, pixelSize * 2, pixelSize * 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(bird.r * 0.25, -bird.r * 0.15, pixelSize, pixelSize);

      // Beak (pixelated triangle)
      ctx.fillStyle = '#ff6b6b';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(bird.r * 0.8 + i * pixelSize, -pixelSize * (2 - i), pixelSize, pixelSize * (3 - i * 0.5));
      }

      ctx.restore();

      ctx.scale(1 / w, 1 / h);
      ctx.restore();
    }

    let last = 0;
    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      const now = ts / 1000;
      if (!last) last = now;
      const dt = Math.min(0.033, now - last);
      last = now;
      if (runningRef.current && !pausedRef.current) step(dt);
      draw();
    }
    rafRef.current = requestAnimationFrame(loop);

    function onPress() {
      if (!aliveRef.current) {
        reset();
      }
      bird.vy = JUMP;
      bird.flapTime = 0.1;
      createFlapParticles(bird.x, bird.y);
      runningRef.current = true;
      setRunning(true);
      pausedRef.current = false;
      setPaused(false);
    }

    function onKey(e) {
      if (e.code === 'Space') { e.preventDefault(); onPress(); }
      if (e.code === 'KeyR') { e.preventDefault(); reset(); runningRef.current = false; setRunning(false); }
      if (e.code === 'KeyP') { e.preventDefault(); if (aliveRef.current) { pausedRef.current = !pausedRef.current; setPaused(p => !p); } }
    }

    controlsRef.current.start = () => { if (!aliveRef.current) reset(); runningRef.current = true; setRunning(true); pausedRef.current = false; setPaused(false); };
    controlsRef.current.togglePause = () => { if (aliveRef.current) { pausedRef.current = !pausedRef.current; setPaused(p => !p); } };

    const onPointer = () => { try { canvas.focus(); } catch (_) { }; onPress(); };
    canvas.addEventListener('pointerdown', onPointer, { passive: true });
    window.addEventListener('keydown', onKey);
    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
      document.addEventListener('keydown', onKey);
    };
  }, []);

  const scoreChanged = score !== prevScore;

  return (
    <div className="flappy-root">
      <div className="hud">
        <div className="hud-badges">
          <div className={`hud-badge hud-green ${scoreChanged ? 'score-pop' : ''}`}>
            <span className="hud-label">Score</span>
            <span className="hud-value">{score}</span>
          </div>
        </div>
      </div>
      <div className="si-controls">
        <button className="si-btn" aria-label="Start Flappy" onClick={() => controlsRef.current.start()}>Start</button>
        <button className="si-btn" aria-label={paused ? 'Resume Flappy' : 'Pause Flappy'} onClick={() => controlsRef.current.togglePause()}>{paused ? 'Resume' : 'Pause'}</button>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="flappy-canvas" tabIndex={0} />
        {!running && (
          <div className="game-overlay">
            <div
              className="overlay-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="fl-overlay-title"
              aria-describedby="fl-overlay-desc"
              ref={overlayRef}
              tabIndex={-1}
            >
              <h3 id="fl-overlay-title" className="overlay-title">{!aliveRef.current ? 'Game Over' : (paused ? 'Paused' : 'READY')}</h3>
              <p id="fl-overlay-desc" className="overlay-sub">Click/Space to flap · P pause · R restart</p>
            </div>
          </div>
        )}
      </div>
      <div className="controls-chip">Click/Space to flap • P pause • R restart</div>
    </div>
  );
}
