'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function Breakout() {
  const overlayRef = useRef(null);
  const prevFocusRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  // Game state
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    const v = Number(localStorage.getItem('breakoutBest') || '0');
    return Number.isFinite(v) ? v : 0;
  });
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const runningRef = useRef(running);
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const levelRef = useRef(level);

  // Mutable refs
  const wRef = useRef(900);
  const hRef = useRef(600);
  const paddleRef = useRef({ x: 0, y: 0, w: 110, h: 14, speed: 6, hitFlash: 0 });
  const ballRef = useRef({ x: 0, y: 0, r: 7, vx: 4, vy: -4, stuck: true, speedMul: 1 });
  const bricksRef = useRef([]);
  const keysRef = useRef(new Set());
  const powerUpsRef = useRef([]);
  const particlesRef = useRef([]);
  const scorePopupsRef = useRef([]);
  const binaryStreamsRef = useRef([]);
  const wideUntilRef = useRef(0);
  const slowUntilRef = useRef(0);
  const bestRef = useRef(0);
  const comboRef = useRef(0);
  const comboTimerRef = useRef(0);
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });

  // keep refs in sync with state
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { bestRef.current = best; }, [best]);

  // a11y: focus overlay when visible and restore focus when hidden
  useEffect(() => {
    const visible = !running || lives <= 0;
    if (visible) {
      prevFocusRef.current = document.activeElement;
      const el = overlayRef.current;
      if (el) { try { el.focus(); } catch (_) { } }
    } else {
      const pf = prevFocusRef.current;
      if (pf && typeof pf.focus === 'function') { try { pf.focus(); } catch (_) { } }
      prevFocusRef.current = null;
    }
  }, [running, lives]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const neonGreen = '#00ff8c';
    const neonPurple = '#9b5de5';
    const neonPink = '#ff006e';

    function sizeCanvas() {
      wRef.current = canvas.width = Math.min(920, Math.floor(window.innerWidth * 0.92));
      hRef.current = canvas.height = Math.min(640, Math.floor(window.innerHeight * 0.6));
      paddleRef.current.y = hRef.current - 40;
      paddleRef.current.x = wRef.current / 2;
      if (ballRef.current.stuck) {
        ballRef.current.x = paddleRef.current.x;
        ballRef.current.y = paddleRef.current.y - 16;
      }
    }

    // Initialize circuit board nodes
    for (let i = 0; i < 8; i++) {
      binaryStreamsRef.current.push({
        x: Math.random() * wRef.current,
        y: Math.random() * hRef.current,
        pulseOffset: Math.random() * Math.PI * 2,
        size: 2 + Math.random() * 2
      });
    }

    function resetBall(center = true) {
      const p = paddleRef.current;
      ballRef.current.x = center ? wRef.current / 2 : p.x;
      ballRef.current.y = p.y - 16;
      ballRef.current.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
      ballRef.current.vy = -4;
      ballRef.current.stuck = true;
      ballRef.current.speedMul = 1;
    }

    function buildBricks(lv) {
      const cols = 10;
      const rows = Math.min(6, 3 + lv);
      const gap = 8;
      const bw = Math.floor((wRef.current - (cols + 1) * gap) / cols);
      const bh = 20;
      const top = 70;
      const arr = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const maxHp = 1 + Math.floor((lv - 1) / 2);
          arr.push({
            x: gap + c * (bw + gap),
            y: top + r * (bh + gap),
            w: bw,
            h: bh,
            hp: maxHp,
            maxHp
          });
        }
      }
      bricksRef.current = arr;
    }

    function hexA(hex, a) {
      const v = hex.replace('#', '');
      const r = parseInt(v.slice(0, 2), 16), g = parseInt(v.slice(2, 4), 16), b = parseInt(v.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    function addParticle(x, y, vx, vy, color, life = 1, size = 2) {
      particlesRef.current.push({ x, y, vx, vy, color, life, maxLife: life, size });
    }

    function createExplosion(x, y, color) {
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = 2 + Math.random() * 2;
        addParticle(
          x, y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          0.5 + Math.random() * 0.3,
          1.5 + Math.random() * 1
        );
      }
    }

    function createImpactSparks(x, y) {
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        addParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, neonGreen, 0.3, 1);
      }
    }

    function addScorePopup(x, y, points, combo = 1) {
      const text = combo > 1 ? `+${points} x${combo}` : `+${points}`;
      scorePopupsRef.current.push({ x, y, text, life: 1.5, maxLife: 1.5 });
    }

    function screenShake(intensity) {
      shakeRef.current.intensity = intensity;
    }

    function drawPixelatedBrick(x, y, w, h, hp, maxHp) {
      const color = hp >= 3 ? neonPink : (hp === 2 ? neonPurple : neonGreen);

      // Main brick fill
      ctx.fillStyle = hexA(color, 0.15);
      ctx.fillRect(x, y, w, h);

      // Border glow
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.shadowBlur = 0;

      // Damage cracks
      if (hp < maxHp) {
        ctx.strokeStyle = hexA(color, 0.5);
        ctx.lineWidth = 1;
        if (hp === maxHp - 1) {
          ctx.beginPath();
          ctx.moveTo(x + w * 0.3, y);
          ctx.lineTo(x + w * 0.4, y + h);
          ctx.stroke();
        } else if (hp === maxHp - 2) {
          ctx.beginPath();
          ctx.moveTo(x + w * 0.3, y);
          ctx.lineTo(x + w * 0.4, y + h);
          ctx.moveTo(x + w * 0.7, y);
          ctx.lineTo(x + w * 0.6, y + h);
          ctx.stroke();
        }
      }

      // Edge highlights
      ctx.strokeStyle = hexA('#ffffff', 0.3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + 3);
      ctx.stroke();
    }

    function drawPaddle(px, py, w, h, isPoweredUp, hitFlash) {
      const color = isPoweredUp ? neonPink : neonGreen;

      if (hitFlash > 0 && hitFlash % 4 < 2) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px - w / 2, py, w, h);
      } else {
        // Paddle segments
        ctx.fillStyle = hexA(color, 0.2);
        ctx.fillRect(px - w / 2, py, w, h);

        // Glow
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.strokeRect(px - w / 2, py, w, h);
        ctx.shadowBlur = 0;

        // Center line
        ctx.strokeStyle = hexA('#ffffff', 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - 2, py);
        ctx.lineTo(px - 2, py + h);
        ctx.moveTo(px + 2, py);
        ctx.lineTo(px + 2, py + h);
        ctx.stroke();
      }
    }

    function drawBall(x, y, r, stuck) {
      // Trail particles
      if (!stuck && Math.random() < 0.4) {
        addParticle(x, y, 0, 0, neonGreen, 0.2, r * 0.8);
      }

      // Charge effect when stuck
      if (stuck) {
        const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
        ctx.shadowColor = neonGreen;
        ctx.shadowBlur = 15 * pulse;
      }

      // Ball
      ctx.fillStyle = neonGreen;
      ctx.shadowColor = neonGreen;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Core highlight
      ctx.fillStyle = hexA('#ffffff', 0.6);
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawPowerUp(x, y, type) {
      const color = type === 'wide' ? neonGreen : neonPurple;
      const rotation = (Date.now() / 1000) % (Math.PI * 2);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Box
      ctx.fillStyle = hexA(color, 0.2);
      ctx.fillRect(-8, -8, 16, 16);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeRect(-8, -8, 16, 16);
      ctx.shadowBlur = 0;

      // Icon
      ctx.fillStyle = color;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(type === 'wide' ? '⬌' : '⏱', 0, 0);

      ctx.restore();

      // Shimmer particles
      if (Math.random() < 0.3) {
        addParticle(x, y, (Math.random() - 0.5) * 2, -1, color, 0.3, 1);
      }
    }

    function step(ts = performance.now()) {
      const w = wRef.current, h = hRef.current;

      // Update screen shake
      if (shakeRef.current.intensity > 0) {
        shakeRef.current.x = (Math.random() - 0.5) * shakeRef.current.intensity;
        shakeRef.current.y = (Math.random() - 0.5) * shakeRef.current.intensity;
        shakeRef.current.intensity *= 0.9;
        if (shakeRef.current.intensity < 0.1) {
          shakeRef.current.intensity = 0;
          shakeRef.current.x = 0;
          shakeRef.current.y = 0;
        }
      }

      ctx.save();
      ctx.translate(shakeRef.current.x, shakeRef.current.y);

      ctx.clearRect(-10, -10, w + 20, h + 20);

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0a0a1f');
      bg.addColorStop(0.5, '#0d0d28');
      bg.addColorStop(1, '#050510');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Circuit board pattern
      const nodes = binaryStreamsRef.current;
      const pulse = Math.sin(ts / 1000) * 0.5 + 0.5;

      // Draw connecting lines
      ctx.strokeStyle = hexA(neonGreen, 0.03 + pulse * 0.02);
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        const nodePulse = Math.sin(ts / 1000 + node.pulseOffset) * 0.5 + 0.5;
        ctx.fillStyle = hexA(neonGreen, 0.1 + nodePulse * 0.15);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grid
      ctx.strokeStyle = hexA(neonPurple, 0.06);
      ctx.lineWidth = 1;
      for (let gy = 40; gy < h; gy += 22) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Update combo timer
      if (comboTimerRef.current > 0) {
        comboTimerRef.current -= 16;
        if (comboTimerRef.current <= 0) comboRef.current = 0;
      }

      const p = paddleRef.current;
      if (ts > wideUntilRef.current) p.w = 110;
      const speedMul = ts > slowUntilRef.current ? 1 : 0.68;

      if (p.hitFlash > 0) p.hitFlash--;

      let vx = 0;
      if (runningRef.current) {
        const keys = keysRef.current;
        if (keys.has('arrowleft') || keys.has('a')) vx = -p.speed;
        if (keys.has('arrowright') || keys.has('d')) vx = p.speed;
      }
      p.x = Math.max(50, Math.min(w - 50, p.x + vx));

      // Paddle
      const isPoweredUp = ts < wideUntilRef.current;
      drawPaddle(p.x, p.y, p.w, p.h, isPoweredUp, p.hitFlash);

      // Ball
      const ball = ballRef.current;
      if (ball.stuck) {
        ball.x = p.x;
        ball.y = p.y - 16;
      } else if (runningRef.current) {
        ball.x += ball.vx * speedMul * ball.speedMul;
        ball.y += ball.vy * speedMul * ball.speedMul;
      }
      drawBall(ball.x, ball.y, ball.r, ball.stuck);

      // Walls
      if (ball.x - ball.r < 6) {
        ball.x = 6 + ball.r;
        ball.vx *= -1;
        createImpactSparks(ball.x, ball.y);
        screenShake(2);
      }
      if (ball.x + ball.r > w - 6) {
        ball.x = w - 6 - ball.r;
        ball.vx *= -1;
        createImpactSparks(ball.x, ball.y);
        screenShake(2);
      }
      if (ball.y - ball.r < 40) {
        ball.y = 40 + ball.r;
        ball.vy *= -1;
        createImpactSparks(ball.x, ball.y);
        screenShake(2);
      }
      if (ball.y - ball.r > h) {
        const nv = livesRef.current - 1;
        if (nv <= 0) {
          setLives(0);
          livesRef.current = 0;
          setRunning(false);
          runningRef.current = false;
          ball.stuck = true;
        } else {
          setLives(nv);
          livesRef.current = nv;
          resetBall(false);
          setRunning(true);
          runningRef.current = true;
        }
      }

      // Paddle collision
      const px = p.x - p.w / 2, py = p.y, pw = p.w, ph = p.h;
      if (!ball.stuck && ball.y + ball.r >= py && ball.y - ball.r <= py + ph && ball.x >= px && ball.x <= px + pw && ball.vy > 0) {
        const hit = (ball.x - p.x) / (pw / 2);
        ball.vx = hit * 5;
        ball.vy = -Math.max(3, Math.abs(ball.vy));
        createImpactSparks(ball.x, ball.y);
        p.hitFlash = 10;
        screenShake(2);
      }

      // Bricks
      for (let i = bricksRef.current.length - 1; i >= 0; i--) {
        const b = bricksRef.current[i];
        if (b.hp <= 0) continue;

        drawPixelatedBrick(b.x, b.y, b.w, b.h, b.hp, b.maxHp);

        // Collision
        const cx = Math.max(b.x, Math.min(ball.x, b.x + b.w));
        const cy = Math.max(b.y, Math.min(ball.y, b.y + b.h));
        const dx = ball.x - cx, dy = ball.y - cy;

        if (dx * dx + dy * dy < ball.r * ball.r && !ball.stuck && runningRef.current) {
          if (Math.abs(dx) > Math.abs(dy)) ball.vx *= -1;
          else ball.vy *= -1;

          b.hp -= 1;
          createImpactSparks(cx, cy);
          screenShake(3);

          if (b.hp <= 0) {
            comboRef.current += 1;
            comboTimerRef.current = 2000;

            const color = b.maxHp >= 3 ? neonPink : (b.maxHp === 2 ? neonPurple : neonGreen);
            createExplosion(b.x + b.w / 2, b.y + b.h / 2, color);

            const points = 50 * comboRef.current;
            const ns = scoreRef.current + points;
            setScore(ns);
            scoreRef.current = ns;

            addScorePopup(b.x + b.w / 2, b.y, 50, comboRef.current);

            if (ns > bestRef.current) {
              localStorage.setItem('breakoutBest', String(ns));
              setBest(ns);
            }

            // Power-up drop
            if (Math.random() < 0.18) {
              const type = Math.random() < 0.5 ? 'wide' : 'slow';
              powerUpsRef.current.push({ x: b.x + b.w / 2, y: b.y, vy: 2.1, type });
            }

            // Increase ball speed slightly
            ball.speedMul = Math.min(1.5, ball.speedMul + 0.02);
            screenShake(5);
          }
        }
      }

      // Power-ups
      for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
        const u = powerUpsRef.current[i];
        u.y += u.vy;

        drawPowerUp(u.x, u.y, u.type);

        if (u.y >= p.y && u.x >= p.x - p.w / 2 && u.x <= p.x + p.w / 2) {
          if (u.type === 'wide') {
            p.w = 150;
            wideUntilRef.current = ts + 12000;
          } else {
            slowUntilRef.current = ts + 10000;
          }
          createExplosion(u.x, u.y, u.type === 'wide' ? neonGreen : neonPurple);
          powerUpsRef.current.splice(i, 1);
        } else if (u.y > h - 10) {
          powerUpsRef.current.splice(i, 1);
        }
      }

      // Next level
      if (bricksRef.current.length > 0 && bricksRef.current.every(b => b.hp <= 0)) {
        const next = levelRef.current + 1;
        setLevel(next);
        levelRef.current = next;
        buildBricks(next);
        resetBall(true);
        setRunning(false);
        runningRef.current = false;
        comboRef.current = 0;
        screenShake(10);
      }

      // Update particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.016;
        return p.life > 0;
      });

      // Update score popups
      scorePopupsRef.current = scorePopupsRef.current.filter(popup => {
        popup.y -= 1;
        popup.life -= 0.016;
        return popup.life > 0;
      });

      // Render particles
      particlesRef.current.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      // Render score popups
      scorePopupsRef.current.forEach(popup => {
        const alpha = popup.life / popup.maxLife;
        ctx.fillStyle = neonGreen;
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = neonGreen;
        ctx.shadowBlur = 8;
        ctx.fillText(popup.text, popup.x, popup.y);
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;

      // Combo display
      if (comboRef.current > 1) {
        ctx.fillStyle = neonPink;
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = neonPink;
        ctx.shadowBlur = 12;
        ctx.fillText(`${comboRef.current}x COMBO!`, w / 2, 50);
        ctx.shadowBlur = 0;
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(step);
    }

    function onKeyDown(e) {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'arrowright' || k === 'arrowup' || k === 'arrowdown' || k === ' ' || k === 'spacebar' || k === 'pageup' || k === 'pagedown') {
        e.preventDefault();
      }
      if (k === 'p') setRunning(v => !v);
      if ((k === ' ' || k === 'enter')) {
        ballRef.current.stuck = false;
        setRunning(true);
      }
      if (k === 'r') {
        setScore(0);
        setLives(3);
        setLevel(1);
        buildBricks(1);
        resetBall(true);
        setRunning(false);
        comboRef.current = 0;
      }
      keysRef.current.add(k);
    }

    function onKeyUp(e) {
      keysRef.current.delete(e.key.toLowerCase());
    }

    function init() {
      sizeCanvas();
      buildBricks(1);
      resetBall(true);
    }

    init();
    // Touch controls for mobile - move paddle to touch position, tap to launch
    function onTouchStart(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const scaleX = wRef.current / rect.width;
      paddleRef.current.x = Math.max(50, Math.min(wRef.current - 50, tx * scaleX));
      if (ballRef.current.stuck) {
        ballRef.current.stuck = false;
        setRunning(true);
      }
    }
    function onTouchMove(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const scaleX = wRef.current / rect.width;
      paddleRef.current.x = Math.max(50, Math.min(wRef.current - 50, tx * scaleX));
    }
    canvas.style.touchAction = 'none';
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    window.addEventListener('resize', sizeCanvas);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', sizeCanvas);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return (
    <div className="br-wrapper">
      <div className="hud">
        <div className="hud-badges">
          <div className="hud-badge hud-green"><span className="hud-label">Score</span><span className="hud-value">{score}</span></div>
          <div className="hud-badge hud-green"><span className="hud-label">Best</span><span className="hud-value">{best}</span></div>
          <div className="hud-badge hud-pink"><span className="hud-label">Lives</span><span className="hud-value">{lives}</span></div>
          <div className="hud-badge hud-purple"><span className="hud-label">Level</span><span className="hud-value">{level}</span></div>
        </div>
      </div>
      <div className="si-controls">
        <button className="si-btn" aria-label="Start Breakout" onClick={() => { setRunning(true); ballRef.current.stuck = false; }}>Start</button>
        <button className="si-btn" aria-label={running ? 'Pause Breakout' : 'Resume Breakout'} onClick={() => setRunning(v => !v)}>{running ? 'Pause' : 'Resume'}</button>
        <button className="si-btn" aria-label="Reset Breakout" onClick={() => { setScore(0); setLives(3); setLevel(1); buildBricks(1); resetBall(true); setRunning(false); comboRef.current = 0; }}>Reset</button>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="br-canvas" />
        {(!running || lives <= 0) && (
          <div className="game-overlay">
            <div className="overlay-panel" role="dialog" aria-modal="true" aria-labelledby="br-overlay-title" aria-describedby="br-overlay-desc" ref={overlayRef} tabIndex={-1}>
              <h3 id="br-overlay-title" className="overlay-title">{lives <= 0 ? 'Game Over' : 'Paused'}</h3>
              <p id="br-overlay-desc" className="overlay-sub">Space/Enter to start · P to pause · R to restart</p>
            </div>
          </div>
        )}
      </div>
      <div className="controls-chip">Arrows/A-D/Touch move • Space/Enter/Tap launch • P pause • R restart</div>
    </div>
  );
}
