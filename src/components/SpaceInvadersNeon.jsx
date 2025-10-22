import React, { useEffect, useRef, useState } from 'react';

export default function SpaceInvadersNeon() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  const fleetRef = useRef([]);
  const bulletsRef = useRef([]);
  const bombsRef = useRef([]);
  const dirRef = useRef(1);
  const stepDownRef = useRef(false);
  const playerRef = useRef({ x: 0, y: 0, w: 42, h: 14, vx: 0, speed: 4.2, cooldown: 0 });
  const keysRef = useRef(new Set());
  const gameOverRef = useRef(false);
  const widthRef = useRef(900);
  const heightRef = useRef(600);
  const runningRef = useRef(false);
  const overlayRef = useRef(null);
  const prevFocusRef = useRef(null);

  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  // a11y: focus overlay when visible and restore focus when hidden
  useEffect(() => {
    const visible = !running || gameOverRef.current;
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
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function sizeCanvas() {
      widthRef.current = canvas.width = Math.min(920, window.innerWidth * 0.92);
      heightRef.current = canvas.height = Math.min(640, window.innerHeight * 0.6);
      playerRef.current.x = widthRef.current / 2;
      playerRef.current.y = heightRef.current - 48;
    }
    sizeCanvas();

    const neonGreen = '#00ff8c';
    const neonPurple = '#9b5de5';

    function createFleet(lv) {
      const w = widthRef.current;
      const rows = 4 + Math.min(3, lv - 1);
      const cols = 9;
      const gapX = 18;
      const gapY = 18;
      const startX = (w - (cols * 24 + (cols - 1) * gapX)) / 2;
      const startY = 60;
      const arr = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          arr.push({ x: startX + c * (24 + gapX), y: startY + r * (18 + gapY), w: 24, h: 18, alive: true, t: Math.random() * 1000 });
        }
      }
      return arr;
    }

    function hexToRgba(hex, a = 1) {
      const v = hex.replace('#', '');
      const r = parseInt(v.substring(0, 2), 16);
      const g = parseInt(v.substring(2, 4), 16);
      const b = parseInt(v.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    function rectNeon(x, y, w, h, color, fillAlpha = 0.08) {
      ctx.fillStyle = hexToRgba(color, fillAlpha);
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.shadowBlur = 0;
    }

    function aabb(a, b) {
      return a.x < b.x + b.w && a.x + (a.w || a.r * 2) > b.x && a.y < b.y + b.h && a.y + (a.h || a.r * 2) > b.y;
    }

    function fire() {
      const p = playerRef.current;
      if (p.cooldown > 0) return;
      bulletsRef.current.push({ x: p.x, y: p.y - 10, vy: -7, r: 2.2 });
      p.cooldown = 12;
    }

    function enemyFire(inv) {
      bombsRef.current.push({ x: inv.x + inv.w / 2, y: inv.y + inv.h + 2, vy: 3 + Math.random() * 1.2, r: 2.4 });
    }

    function drawHUD() { /* moved to overlay badges */ }

    function step() {
      const w = widthRef.current;
      const h = heightRef.current;
      ctx.clearRect(0, 0, w, h);

      // background grid
      ctx.strokeStyle = hexToRgba(neonPurple, 0.07);
      ctx.lineWidth = 1;
      for (let gy = 40; gy < h; gy += 20) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

      // canvas HUD moved to overlay badges

      const p = playerRef.current;
      if (running && !gameOverRef.current) {
        // input
        const keys = keysRef.current;
        p.vx = 0;
        if (keys.has('arrowleft') || keys.has('a')) p.vx = -p.speed;
        if (keys.has('arrowright') || keys.has('d')) p.vx = p.speed;
        if (keys.has(' ') || keys.has('space')) fire();
        p.x = Math.max(24, Math.min(w - 24, p.x + p.vx));
        if (p.cooldown > 0) p.cooldown--;

        // player
        rectNeon(p.x - p.w / 2, p.y, p.w, p.h, neonGreen, 0.12);

        // bullets
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];
          b.y += b.vy;
          ctx.fillStyle = hexToRgba(neonGreen, 0.85);
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
          if (b.y < -8) bulletsRef.current.splice(i, 1);
        }

        // fleet bounds
        let minX = Infinity, maxX = -Infinity;
        for (const inv of fleetRef.current) if (inv.alive) { minX = Math.min(minX, inv.x); maxX = Math.max(maxX, inv.x + inv.w); }
        if (maxX >= w - 20 && dirRef.current === 1) { dirRef.current = -1; stepDownRef.current = true; }
        if (minX <= 20 && dirRef.current === -1) { dirRef.current = 1; stepDownRef.current = true; }

        // invaders
        for (const inv of fleetRef.current) {
          if (!inv.alive) continue;
          inv.x += dirRef.current * (0.6 + level * 0.12);
          if (stepDownRef.current) inv.y += 10;
          inv.t += 0.16;
          const color = Math.sin(inv.t) > 0 ? neonPurple : neonGreen;
          rectNeon(inv.x, inv.y, inv.w, inv.h, color, 0.1);
          if (Math.random() < (0.002 + level * 0.0006)) enemyFire(inv);
          if (inv.y + inv.h >= p.y) { loseLife(); break; }
        }
        stepDownRef.current = false;

        // bullet hits
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];
          for (const inv of fleetRef.current) {
            if (!inv.alive) continue;
            if (b.x > inv.x && b.x < inv.x + inv.w && b.y > inv.y && b.y < inv.y + inv.h) {
              inv.alive = false;
              bulletsRef.current.splice(i, 1);
              setScore((s) => s + 10);
              break;
            }
          }
        }

        // enemy bombs
        for (let i = bombsRef.current.length - 1; i >= 0; i--) {
          const m = bombsRef.current[i];
          m.y += m.vy;
          ctx.fillStyle = hexToRgba(neonPurple, 0.9);
          ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
          const box = { x: p.x - p.w / 2, y: p.y, w: p.w, h: p.h };
          if (m.y > h + 10) bombsRef.current.splice(i, 1);
          else if (aabb({ x: m.x - m.r, y: m.y - m.r, w: m.r * 2, h: m.r * 2 }, box)) { bombsRef.current.splice(i, 1); loseLife(); }
        }

        // next level
        if (fleetRef.current.every((f) => !f.alive)) {
          setLevel((lv) => lv + 1);
          fleetRef.current = createFleet(level + 1);
          dirRef.current = 1; stepDownRef.current = false; bulletsRef.current.length = 0; bombsRef.current.length = 0;
        }
      } else {
        // paused/game over static draw
        rectNeon(p.x - p.w / 2, p.y, p.w, p.h, neonGreen, 0.12);
        for (const inv of fleetRef.current) if (inv.alive) rectNeon(inv.x, inv.y, inv.w, inv.h, neonPurple, 0.08);
      }

      // overlay handled via DOM

      rafRef.current = requestAnimationFrame(step);
    }

    function loseLife() {
      setLives((v) => {
        const nv = v - 1;
        if (nv <= 0) { gameOverRef.current = true; setRunning(false); }
        return nv;
      });
    }

    function onResize() { sizeCanvas(); }
    function onKeyDown(e) {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'arrowright' || k === 'arrowup' || k === 'arrowdown' || k === ' ' || k === 'spacebar' || k === 'pageup' || k === 'pagedown') {
        e.preventDefault();
      }
      if (k === 'r' && (!running || lives <= 0)) {
        setScore(0); setLives(3); setLevel(1); setRunning(true); gameOverRef.current = false;
        fleetRef.current = createFleet(1); dirRef.current = 1; stepDownRef.current = false; bulletsRef.current.length = 0; bombsRef.current.length = 0;
      }
      if (k === 'p') setRunning((prev) => !prev);
      if (k === 'enter' && !running && lives > 0 && !gameOverRef.current) setRunning(true);
      keysRef.current.add(k);
    }
    function onKeyUp(e) { keysRef.current.delete(e.key.toLowerCase()); }

    fleetRef.current = createFleet(level);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [level, lives, running, score]);

  const handleStart = () => {
    if (lives <= 0) { setScore(0); setLives(3); setLevel(1); }
    setRunning(true);
  };

  return (
    <div className="si-wrapper">
      <div className="hud">
        <div className="hud-badges">
          <div className="hud-badge hud-green"><span className="hud-label">Score</span><span className="hud-value">{score}</span></div>
          <div className="hud-badge hud-pink"><span className="hud-label">Lives</span><span className="hud-value">{lives}</span></div>
          <div className="hud-badge hud-purple"><span className="hud-label">Level</span><span className="hud-value">{level}</span></div>
        </div>
      </div>
      <div className="si-controls">
        <button className="si-btn" aria-label="Start Space Invaders" onClick={handleStart}>Start</button>
        <button className="si-btn" aria-label={running ? 'Pause Space Invaders' : 'Resume Space Invaders'} onClick={() => setRunning((p) => !p)}>{running ? 'Pause' : 'Resume'}</button>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="si-canvas" />
        {(!running || gameOverRef.current) && (
          <div className="game-overlay">
            <div className="overlay-panel" role="dialog" aria-modal="true" aria-labelledby="si-overlay-title" aria-describedby="si-overlay-desc" ref={overlayRef} tabIndex={-1}>
              <h3 id="si-overlay-title" className="overlay-title">{gameOverRef.current ? 'Game Over' : 'Paused'}</h3>
              <p id="si-overlay-desc" className="overlay-sub">Enter start · P pause · Space shoot · R restart</p>
            </div>
          </div>
        )}
      </div>
      <div className="controls-chip">Arrows/A-D move • Space shoot • P pause • R restart • Enter start</div>
    </div>
  );
}
