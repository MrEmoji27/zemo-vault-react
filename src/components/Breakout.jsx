import React, { useEffect, useRef, useState } from 'react';

export default function Breakout() {
  const overlayRef = useRef(null);
  const prevFocusRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  // Game state
  const [running, setRunning] = useState(true);
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
  const paddleRef = useRef({ x: 0, y: 0, w: 110, h: 14, speed: 6 });
  const ballRef = useRef({ x: 0, y: 0, r: 7, vx: 4, vy: -4, stuck: true });
  const bricksRef = useRef([]);
  const keysRef = useRef(new Set());
  const powerUpsRef = useRef([]); // falling power-ups
  const wideUntilRef = useRef(0);
  const slowUntilRef = useRef(0);
  const bestRef = useRef(0);

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
      if (el) {
        try { el.focus(); } catch (_) {}
      }
    } else {
      const pf = prevFocusRef.current;
      if (pf && typeof pf.focus === 'function') {
        try { pf.focus(); } catch (_) {}
      }
      prevFocusRef.current = null;
    }
  }, [running, lives]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const neonGreen = '#00ff8c';
    const neonPurple = '#9b5de5';

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

    function resetBall(center = true) {
      const p = paddleRef.current;
      ballRef.current.x = center ? wRef.current / 2 : p.x;
      ballRef.current.y = p.y - 16;
      ballRef.current.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
      ballRef.current.vy = -4;
      ballRef.current.stuck = true;
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
          arr.push({ x: gap + c * (bw + gap), y: top + r * (bh + gap), w: bw, h: bh, hp: 1 + Math.floor((lv - 1) / 2) });
        }
      }
      bricksRef.current = arr;
    }

    function hexA(hex, a) {
      const v = hex.replace('#','');
      const r = parseInt(v.slice(0,2),16), g = parseInt(v.slice(2,4),16), b = parseInt(v.slice(4,6),16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    function rectNeon(x,y,w,h,color,fill=0.1) {
      ctx.fillStyle = hexA(color, fill);
      ctx.fillRect(x,y,w,h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
      ctx.shadowBlur = 0;
    }

    function circle(x,y,r,color) {
      ctx.fillStyle = hexA(color, 0.9);
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }

    function drawHUD() { /* moved to overlay badges */ }

    function step(ts = performance.now()) {
      const w = wRef.current, h = hRef.current;
      ctx.clearRect(0,0,w,h);

      // subtle grid
      ctx.strokeStyle = hexA(neonPurple, 0.06);
      ctx.lineWidth = 1;
      for (let gy=40; gy<h; gy+=22) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke(); }

      // canvas HUD moved to overlay badges

      // input
      const p = paddleRef.current;
      // handle timed effects
      if (ts > wideUntilRef.current) p.w = 110;
      const speedMul = ts > slowUntilRef.current ? 1 : 0.68;
      let vx = 0;
      if (runningRef.current) {
        const keys = keysRef.current;
        if (keys.has('arrowleft') || keys.has('a')) vx = -p.speed;
        if (keys.has('arrowright') || keys.has('d')) vx = p.speed;
      }
      p.x = Math.max(50, Math.min(w-50, p.x + vx));

      // paddle
      rectNeon(p.x - p.w/2, p.y, p.w, p.h, neonGreen, 0.12);

      // ball
      const ball = ballRef.current;
      if (ball.stuck) {
        ball.x = p.x; ball.y = p.y - 16;
      } else if (runningRef.current) {
        ball.x += ball.vx * speedMul; ball.y += ball.vy * speedMul;
      }
      circle(ball.x, ball.y, ball.r, neonGreen);

      // walls
      if (ball.x - ball.r < 6) { ball.x = 6 + ball.r; ball.vx *= -1; }
      if (ball.x + ball.r > w-6) { ball.x = w-6 - ball.r; ball.vx *= -1; }
      if (ball.y - ball.r < 40) { ball.y = 40 + ball.r; ball.vy *= -1; }
      if (ball.y - ball.r > h) { // lost
        const nv = livesRef.current - 1;
        if (nv <= 0) {
          setLives(0); livesRef.current = 0; setRunning(false); runningRef.current = false; ball.stuck = true;
        } else {
          setLives(nv); livesRef.current = nv; resetBall(false); setRunning(true); runningRef.current = true; // keep game running, ball stuck awaits launch
        }
      }

      // paddle collision
      const px = p.x - p.w/2, py = p.y, pw = p.w, ph = p.h;
      if (!ball.stuck && ball.y + ball.r >= py && ball.y - ball.r <= py + ph && ball.x >= px && ball.x <= px + pw && ball.vy > 0) {
        const hit = (ball.x - (p.x)) / (pw/2); // -1..1
        ball.vx = hit * 5;
        ball.vy = -Math.max(3, Math.abs(ball.vy));
      }

      // bricks
      for (let i = bricksRef.current.length - 1; i >= 0; i--) {
        const b = bricksRef.current[i];
        if (b.hp <= 0) continue;
        // tint by HP
        const hp = Math.max(1, b.hp);
        const color = hp >= 3 ? '#ff6bd6' : (hp === 2 ? '#9b5de5' : '#00ff8c');
        rectNeon(b.x, b.y, b.w, b.h, color, 0.12);
        // collision AABB vs circle (approx)
        const cx = Math.max(b.x, Math.min(ball.x, b.x + b.w));
        const cy = Math.max(b.y, Math.min(ball.y, b.y + b.h));
        const dx = ball.x - cx, dy = ball.y - cy;
        if (dx*dx + dy*dy < ball.r*ball.r && !ball.stuck && runningRef.current) {
          // decide reflection side rudely
          if (Math.abs(dx) > Math.abs(dy)) ball.vx *= -1; else ball.vy *= -1;
          b.hp -= 1;
          if (b.hp <= 0) {
            const ns = scoreRef.current + 50;
            setScore(ns); scoreRef.current = ns;
            if (ns > bestRef.current) { localStorage.setItem('breakoutBest', String(ns)); setBest(ns); }
            // chance to drop power-up
            if (Math.random() < 0.18) {
              const type = Math.random() < 0.5 ? 'wide' : 'slow';
              powerUpsRef.current.push({ x: b.x + b.w/2, y: b.y, vy: 2.1, type });
            }
          }
        }
      }

      // power-ups falling
      for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
        const u = powerUpsRef.current[i];
        u.y += u.vy;
        // draw
        const uc = u.type === 'wide' ? '#00ff8c' : '#9b5de5';
        rectNeon(u.x - 8, u.y - 8, 16, 16, uc, 0.15);
        // collect with paddle
        if (u.y >= p.y && u.x >= p.x - p.w/2 && u.x <= p.x + p.w/2) {
          if (u.type === 'wide') { p.w = 150; wideUntilRef.current = ts + 12000; }
          else { slowUntilRef.current = ts + 10000; }
          powerUpsRef.current.splice(i, 1);
        } else if (u.y > h - 10) {
          powerUpsRef.current.splice(i, 1);
        }
      }

      // next level if all broken
      if (bricksRef.current.length > 0 && bricksRef.current.every(b => b.hp <= 0)) {
        const next = levelRef.current + 1;
        setLevel(next); levelRef.current = next;
        buildBricks(next);
        resetBall(true);
        setRunning(false); runningRef.current = false;
      }

      // overlay handled via DOM

      rafRef.current = requestAnimationFrame(step);
    }

    function onKeyDown(e) {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'arrowright' || k === 'arrowup' || k === 'arrowdown' || k === ' ' || k === 'spacebar' || k === 'pageup' || k === 'pagedown') {
        e.preventDefault();
      }
      if (k === 'p') setRunning((v) => !v);
      if ((k === ' ' || k === 'enter')) { ballRef.current.stuck = false; setRunning(true); }
      if (k === 'r') { setScore(0); setLives(3); setLevel(1); buildBricks(1); resetBall(true); setRunning(false); }
      keysRef.current.add(k);
    }
    function onKeyUp(e) { keysRef.current.delete(e.key.toLowerCase()); }

    function init() {
      sizeCanvas();
      buildBricks(1);
      resetBall(true);
    }

    init();
    window.addEventListener('resize', sizeCanvas);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
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
        <button className="si-btn" aria-label={running ? 'Pause Breakout' : 'Resume Breakout'} onClick={() => setRunning((v)=>!v)}>{running ? 'Pause' : 'Resume'}</button>
        <button className="si-btn" aria-label="Reset Breakout" onClick={() => { setScore(0); setLives(3); setLevel(1); buildBricks(1); resetBall(true); setRunning(false); }}>Reset</button>
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
      <div className="controls-chip">Arrows/A-D move • Space/Enter launch • P pause • R restart</div>
    </div>
  );
}
