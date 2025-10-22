import React, { useEffect, useRef, useState } from 'react';

export default function SpaceInvaders() {
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

  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

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

    function drawHUD() {
      ctx.fillStyle = hexToRgba(neonGreen, 0.9);
      ctx.font = '14px "Roboto Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${score}`, 12, 20);
      ctx.textAlign = 'center';
      ctx.fillText(`LEVEL ${level}`, widthRef.current / 2, 20);
      ctx.textAlign = 'right';
      ctx.fillText(`LIVES: ${lives}`, widthRef.current - 12, 20);
    }

    function step() {
      const w = widthRef.current;
      const h = heightRef.current;
      ctx.clearRect(0, 0, w, h);

      // background grid
      ctx.strokeStyle = hexToRgba(neonPurple, 0.07);
      ctx.lineWidth = 1;
      for (let gy = 40; gy < h; gy += 20) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

      drawHUD();

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

      if (gameOverRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = neonGreen;
        ctx.font = '28px "Bungee", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 16);
        ctx.font = '14px "Roboto Mono", monospace';
        ctx.fillText('Press R to Restart', w / 2, h / 2 + 16);
      }

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
      <div className="si-ui">
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        <div>Level: {level}</div>
      </div>
      <div className="si-controls">
        <button className="si-btn" onClick={handleStart}>Start</button>
        <button className="si-btn" onClick={() => setRunning((p) => !p)}>{running ? 'Pause' : 'Resume'}</button>
      </div>
      <canvas ref={canvasRef} className="si-canvas" />
      <div className="si-help">Left/Right or A/D to move • Space to shoot • P to pause • R to restart • Enter to start</div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';

export default function SpaceInvaders() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  // Refs for mutable game objects
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

  // React state
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function sizeCanvas() {
      widthRef.current = (canvas.width = Math.min(920, window.innerWidth * 0.92));
      heightRef.current = (canvas.height = Math.min(640, window.innerHeight * 0.6));
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

    function drawHUD() {
      ctx.fillStyle = hexToRgba(neonGreen, 0.9);
      ctx.font = '14px "Roboto Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${score}`, 12, 20);
      ctx.textAlign = 'center';
      ctx.fillText(`LEVEL ${level}`, widthRef.current / 2, 20);
      ctx.textAlign = 'right';
      ctx.fillText(`LIVES: ${lives}`, widthRef.current - 12, 20);
    }

    function step() {
      const w = widthRef.current;
      const h = heightRef.current;
      ctx.clearRect(0, 0, w, h);

      // background grid
      ctx.strokeStyle = hexToRgba(neonPurple, 0.07);
      ctx.lineWidth = 1;
      for (let gy = 40; gy < h; gy += 20) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

      drawHUD();

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

      // game over overlay
      if (gameOverRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = neonGreen;
        ctx.font = '28px "Bungee", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 16);
        ctx.font = '14px "Roboto Mono", monospace';
        ctx.fillText('Press R to Restart', w / 2, h / 2 + 16);
      }

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
      if (k === 'r' && (!running || lives <= 0)) {
        // restart
        setScore(0); setLives(3); setLevel(1); setRunning(true); gameOverRef.current = false;
        fleetRef.current = createFleet(1); dirRef.current = 1; stepDownRef.current = false; bulletsRef.current.length = 0; bombsRef.current.length = 0;
      }
      if (k === 'p') setRunning((prev) => !prev);
      if (k === 'enter' && !running && lives > 0 && !gameOverRef.current) setRunning(true);
      keysRef.current.add(k);
    }
    function onKeyUp(e) { keysRef.current.delete(e.key.toLowerCase()); }

    // init
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
      <div className="si-ui">
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        <div>Level: {level}</div>
      </div>
      <div className="si-controls">
        <button className="si-btn" onClick={handleStart}>Start</button>
        <button className="si-btn" onClick={() => setRunning((p) => !p)}>{running ? 'Pause' : 'Resume'}</button>
      </div>
      <canvas ref={canvasRef} className="si-canvas" />
      <div className="si-help">Left/Right or A/D to move • Space to shoot • P to pause • R to restart • Enter to start</div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';

export default function SpaceInvaders() {
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

  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

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

    function drawHUD() {
      ctx.fillStyle = hexToRgba(neonGreen, 0.9);
      ctx.font = '14px "Roboto Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${score}`, 12, 20);
      ctx.textAlign = 'center';
      ctx.fillText(`LEVEL ${level}`, widthRef.current / 2, 20);
      ctx.textAlign = 'right';
      ctx.fillText(`LIVES: ${lives}`, widthRef.current - 12, 20);
    }

    function step() {
      const w = widthRef.current;
      const h = heightRef.current;
      ctx.clearRect(0, 0, w, h);

      // background grid
      ctx.strokeStyle = hexToRgba(neonPurple, 0.07);
      ctx.lineWidth = 1;
      for (let gy = 40; gy < h; gy += 20) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

      drawHUD();

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

        // fleet bounds and direction
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
          else if (aabb({ x: m.x - m.r, y: m.y - m.r, w: m.r * 2, h: m.r * 2 }, box)) {
            bombsRef.current.splice(i, 1);
            loseLife();
          }
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

      // game over overlay
      if (gameOverRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = neonGreen;
        ctx.font = '28px "Bungee", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 16);
        ctx.font = '14px "Roboto Mono", monospace';
        ctx.fillText('Press R to Restart', w / 2, h / 2 + 16);
      }

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
      if (k === 'r' && (!running || lives <= 0)) {
        // restart
        setScore(0); setLives(3); setLevel(1); setRunning(true); gameOverRef.current = false;
        fleetRef.current = createFleet(1); dirRef.current = 1; stepDownRef.current = false; bulletsRef.current.length = 0; bombsRef.current.length = 0;
      }
      if (k === 'p') setRunning((prev) => !prev);
      if (k === 'enter' && !running && lives > 0 && !gameOverRef.current) setRunning(true);
      keysRef.current.add(k);
    }
    function onKeyUp(e) { keysRef.current.delete(e.key.toLowerCase()); }

    // init
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
      <div className="si-ui">
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        <div>Level: {level}</div>
      </div>
      <div className="si-controls">
        <button className="si-btn" onClick={handleStart}>Start</button>
        <button className="si-btn" onClick={() => setRunning((p) => !p)}>{running ? 'Pause' : 'Resume'}</button>
      </div>
      <canvas ref={canvasRef} className="si-canvas" />
      <div className="si-help">Left/Right or A/D to move • Space to shoot • P to pause • R to restart • Enter to start</div>

export default function SpaceInvaders() {
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
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = Math.min(920, window.innerWidth * 0.92));
    let h = (canvas.height = Math.min(640, window.innerHeight * 0.6));

    const neonGreen = '#00ff8c';
    const neonPurple = '#9b5de5';

    function initPlayer() {
      playerRef.current.x = w / 2;
      playerRef.current.y = h - 48;
    }

    function createFleet(lv) {
      const rows = 4 + Math.min(3, lv - 1);
      const cols = 9;
      const gapX = 18;
      const gapY = 18;
      const startX = (w - (cols * 24 + (cols - 1) * gapX)) / 2;
      const startY = 60;
      const arr = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          arr.push({
            x: startX + c * (24 + gapX),
            y: startY + r * (18 + gapY),
            w: 24,
            h: 18,
            alive: true,
            t: Math.random() * 1000,
          });
        }
      }
      return arr;
    }

    function onResize() {
      w = canvas.width = Math.min(920, window.innerWidth * 0.92);
      h = canvas.height = Math.min(640, window.innerHeight * 0.6);
      playerRef.current.y = h - 48;
    }

    function keydown(e) { keysRef.current.add(e.key.toLowerCase()); }
    function keyup(e) { keysRef.current.delete(e.key.toLowerCase()); }

    function fire() {
      const p = playerRef.current;
      if (p.cooldown > 0) return;
      bulletsRef.current.push({ x: p.x, y: p.y - 10, vy: -7, r: 2.2 });
      p.cooldown = 12; // frames
    }

    function enemyFire(inv) {
      bombsRef.current.push({ x: inv.x + inv.w / 2, y: inv.y + inv.h + 2, vy: 3 + Math.random() * 1.2, r: 2.4 });
    }

    function rectNeon(x, y, w2, h2, color, fillAlpha = 0.08) {
      ctx.fillStyle = hexToRgba(color, fillAlpha);
      ctx.fillRect(x, y, w2, h2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeRect(x + 0.5, y + 0.5, w2 - 1, h2 - 1);
      ctx.shadowBlur = 0;
    }

    function hexToRgba(hex, a = 1) {
      const v = hex.replace('#', '');
      const r = parseInt(v.substring(0, 2), 16);
      const g = parseInt(v.substring(2, 4), 16);
      const b = parseInt(v.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    function aabb(a, b) {
      return a.x < b.x + b.w && a.x + (a.w || a.r * 2) > b.x && a.y < b.y + b.h && a.y + (a.h || a.r * 2) > b.y;
    }

    function drawHUD() {
      ctx.fillStyle = hexToRgba(neonGreen, 0.9);
      ctx.font = '14px "Roboto Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${score}`, 12, 20);
      ctx.textAlign = 'center';
      ctx.fillText(`LEVEL ${level}`, w / 2, 20);
      ctx.textAlign = 'right';
      ctx.fillText(`LIVES: ${lives}`, w - 12, 20);
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = hexToRgba(neonPurple, 0.07);
      ctx.lineWidth = 1;
      for (let gy = 40; gy < h; gy += 20) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      drawHUD();

      if (running && !gameOverRef.current) {
        // Input
        const keys = keysRef.current;
        const p = playerRef.current;
        p.vx = 0;
        if (keys.has('arrowleft') || keys.has('a')) p.vx = -p.speed;
        if (keys.has('arrowright') || keys.has('d')) p.vx = p.speed;
        if (keys.has(' ') || keys.has('space')) fire();
        p.x = Math.max(24, Math.min(w - 24, p.x + p.vx));
        if (p.cooldown > 0) p.cooldown--;

        // Player
        rectNeon(p.x - p.w / 2, p.y, p.w, p.h, neonGreen, 0.12);

        // Bullets
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];
          b.y += b.vy;
          ctx.fillStyle = hexToRgba(neonGreen, 0.85);
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
          if (b.y < -8) bulletsRef.current.splice(i, 1);
        }

        // Fleet move bounds
        let minX = Infinity, maxX = -Infinity;
        for (const inv of fleetRef.current) if (inv.alive) { minX = Math.min(minX, inv.x); maxX = Math.max(maxX, inv.x + inv.w); }
        if (maxX >= w - 20 && dirRef.current === 1) { dirRef.current = -1; stepDownRef.current = true; }
        if (minX <= 20 && dirRef.current === -1) { dirRef.current = 1; stepDownRef.current = true; }

        // Invaders
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

        // Bullet collisions
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

        // Enemy bombs
        for (let i = bombsRef.current.length - 1; i >= 0; i--) {
          const m = bombsRef.current[i];
          m.y += m.vy;
          ctx.fillStyle = hexToRgba(neonPurple, 0.9);
          ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
          const box = { x: p.x - p.w / 2, y: p.y, w: p.w, h: p.h };
          if (m.y > h + 10) bombsRef.current.splice(i, 1);
          else if (aabb({ x: m.x - m.r, y: m.y - m.r, w: m.r * 2, h: m.r * 2 }, box)) {
            bombsRef.current.splice(i, 1);
            loseLife();
          }
        }

        // Next level
        if (fleetRef.current.every((f) => !f.alive)) {
          setLevel((lv) => lv + 1);
          fleetRef.current = createFleet(level + 1);
          dirRef.current = 1; stepDownRef.current = false; bulletsRef.current.length = 0; bombsRef.current.length = 0;
        }
      } else {
        // paused or game over: still draw player and fleet for static view
        const p = playerRef.current;
        rectNeon(p.x - p.w / 2, p.y, p.w, p.h, neonGreen, 0.12);
        for (const inv of fleetRef.current) if (inv.alive) rectNeon(inv.x, inv.y, inv.w, inv.h, neonPurple, 0.08);
      }

      // Game over overlay
      if (gameOverRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = neonGreen;
        ctx.font = '28px "Bungee", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 16);
        ctx.font = '14px "Roboto Mono", monospace';
        ctx.fillText('Press R to Restart', w / 2, h / 2 + 16);
      }

      rafRef.current = requestAnimationFrame(step);
    }

    function loseLife() {
      setLives((v) => {
        const nv = v - 1;
        if (nv <= 0) {
          gameOverRef.current = true;
          setRunning(false);
        }
        return nv;
      });
    }

    function handleHotkeys(e) {
      const k = e.key.toLowerCase();
      if (k === 'r' && (!running || lives <= 0)) {
        // restart
        setScore(0); setLives(3); setLevel(1); setRunning(true);
        fleetRef.current = createFleet(1); dirRef.current = 1; stepDownRef.current = false; bulletsRef.current.length = 0; bombsRef.current.length = 0; gameOverRef.current = false;
      }
      if (k === 'p') setRunning((prev) => !prev);
      if (k === 'enter' && !running && lives > 0 && !gameOverRef.current) setRunning(true);
    }

    // init
    initPlayer();
    fleetRef.current = createFleet(level);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', handleHotkeys);
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', handleHotkeys);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
    };
  }, [level, lives, running, score]);

  const handleStart = () => {
    if (lives <= 0) {
      // full reset
      setScore(0); setLives(3); setLevel(1);
    }
    setRunning(true);
  };

  return (
    <div className="si-wrapper">
      <div className="si-ui">
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        <div>Level: {level}</div>
      </div>
      <div className="si-controls">
        <button className="si-btn" onClick={handleStart}>Start</button>
        <button className="si-btn" onClick={() => setRunning((p) => !p)}>{running ? 'Pause' : 'Resume'}</button>
      </div>
      <canvas ref={canvasRef} className="si-canvas" />
      <div className="si-help">Left/Right or A/D to move • Space to shoot • P to pause • R to restart • Enter to start</div>
    </div>
  );
}
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const runningRef = useRef(true);
  useEffect(()=>{ runningRef.current = running; },[running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = Math.min(920, window.innerWidth * 0.92));
    let h = (canvas.height = Math.min(640, window.innerHeight * 0.6));

    const neonGreen = '#00ff8c';
    const neonPurple = '#9b5de5';
    const player = {
      x: w / 2,
      y: h - 48,
      w: 42,
      h: 14,
      vx: 0,
      speed: 4.2,
      cooldown: 0,
    };

    const keys = new Set();
    const bullets = [];
    const bombs = [];
    let fleet = createFleet(level);
    let dir = 1; // 1 right, -1 left
    let stepDown = false;
    let gameOver = false;

    function createFleet(lv) {
      const rows = 4 + Math.min(3, lv - 1);
      const cols = 9;
      const gapX = 18;
      const gapY = 18;
      const startX = (w - (cols * 24 + (cols - 1) * gapX)) / 2;
      const startY = 60;
      const arr = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          arr.push({
            x: startX + c * (24 + gapX),
            y: startY + r * (18 + gapY),
            w: 24,
            h: 18,
            alive: true,
            t: Math.random() * 1000,
          });
        }
      }
      return arr;
    }

    function onResize() {
      w = canvas.width = Math.min(920, window.innerWidth * 0.92);
      h = canvas.height = Math.min(640, window.innerHeight * 0.6);
      player.y = h - 48;
    }

    window.addEventListener('resize', onResize);

    function keydown(e) { keys.add(e.key.toLowerCase()); }
    function keyup(e) { keys.delete(e.key.toLowerCase()); }
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);

    function fire() {
      if (player.cooldown > 0) return;
      bullets.push({ x: player.x, y: player.y - 10, vy: -7, r: 2.2 });
      player.cooldown = 12; // frames
    }

    function enemyFire(inv) {
      bombs.push({ x: inv.x + inv.w / 2, y: inv.y + inv.h + 2, vy: 3 + Math.random() * 1.2, r: 2.4 });
    }

    function rectNeon(x, y, w2, h2, color, fillAlpha = 0.08) {
      ctx.fillStyle = hexToRgba(color, fillAlpha);
      ctx.fillRect(x, y, w2, h2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeRect(x + 0.5, y + 0.5, w2 - 1, h2 - 1);
      ctx.shadowBlur = 0;
    }

    function hexToRgba(hex, a = 1) {
      const v = hex.replace('#', '');
      const r = parseInt(v.substring(0, 2), 16);
      const g = parseInt(v.substring(2, 4), 16);
      const b = parseInt(v.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    function aabb(a, b) {
      return a.x < b.x + b.w && a.x + (a.w || a.r * 2) > b.x && a.y < b.y + b.h && a.y + (a.h || a.r * 2) > b.y;
    }

    function drawHUD() {
      ctx.fillStyle = hexToRgba(neonGreen, 0.9);
      ctx.font = '14px "Roboto Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${score}`, 12, 20);
      ctx.textAlign = 'center';
      ctx.fillText(`LEVEL ${level}`, w / 2, 20);
      ctx.textAlign = 'right';
      ctx.fillText(`LIVES: ${lives}`, w - 12, 20);
    }

    function step() {
      if (!running) { rafRef.current = requestAnimationFrame(step); return; }
      ctx.clearRect(0, 0, w, h);

      // Background faint grid for vibe
      ctx.strokeStyle = hexToRgba(neonPurple, 0.07);
      ctx.lineWidth = 1;
      for (let gy = 40; gy < h; gy += 20) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      drawHUD();

      // Player input
      player.vx = 0;
      if (keys.has('arrowleft') || keys.has('a')) player.vx = -player.speed;
      if (keys.has('arrowright') || keys.has('d')) player.vx = player.speed;
      if (keys.has(' ') || keys.has('space')) fire();

      player.x += player.vx;
      player.x = Math.max(24, Math.min(w - 24, player.x));
      if (player.cooldown > 0) player.cooldown--;

      // Draw player
      rectNeon(player.x - player.w / 2, player.y, player.w, player.h, neonGreen, 0.12);

      // Update bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += b.vy;
        // draw bullet
        ctx.fillStyle = hexToRgba(neonGreen, 0.85);
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        if (b.y < -8) bullets.splice(i, 1);
      }

      // Fleet movement
      let minX = Infinity, maxX = -Infinity;
      for (const inv of fleet) if (inv.alive) { minX = Math.min(minX, inv.x); maxX = Math.max(maxX, inv.x + inv.w); }
      if (maxX >= w - 20 && dir === 1) { dir = -1; stepDown = true; }
      if (minX <= 20 && dir === -1) { dir = 1; stepDown = true; }

      // Draw invaders
      for (const inv of fleet) {
        if (!inv.alive) continue;
        inv.x += dir * (0.6 + level * 0.12);
        if (stepDown) inv.y += 10;
        // simple animation flicker
        inv.t += 0.16;
        const color = Math.sin(inv.t) > 0 ? neonPurple : neonGreen;
        rectNeon(inv.x, inv.y, inv.w, inv.h, color, 0.1);
        // random fire
        if (Math.random() < (0.002 + level * 0.0006)) enemyFire(inv);
        // reached player line -> lose life
        if (inv.y + inv.h >= player.y) {
          livesDown();
          break;
        }
      }
      stepDown = false;

      // Bullet collisions
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        for (const inv of fleet) {
          if (!inv.alive) continue;
          if (b.x > inv.x && b.x < inv.x + inv.w && b.y > inv.y && b.y < inv.y + inv.h) {
            inv.alive = false;
            bullets.splice(i, 1);
            setScore((s) => s + 10);
            break;
          }
        }
      }

      // Enemy bombs
      for (let i = bombs.length - 1; i >= 0; i--) {
        const m = bombs[i];
        m.y += m.vy;
        ctx.fillStyle = hexToRgba(neonPurple, 0.9);
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
        const box = { x: player.x - player.w / 2, y: player.y, w: player.w, h: player.h };
        if (m.y > h + 10) bombs.splice(i, 1);
        else if (aabb({ x: m.x - m.r, y: m.y - m.r, w: m.r * 2, h: m.r * 2 }, box)) {
          bombs.splice(i, 1);
          livesDown();
        }
      }

      // Next level if all dead
      if (fleet.every((f) => !f.alive)) {
        setLevel((lv) => lv + 1);
        fleet = createFleet(level + 1);
        dir = 1; stepDown = false; bullets.length = 0; bombs.length = 0;
      }

      // Game over screen
      if (gameOver) {
        ctx.fillStyle = hexToRgba('#000', 0.6);
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = neonGreen;
        ctx.font = '28px "Bungee", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 16);
        ctx.font = '14px "Roboto Mono", monospace';
        ctx.fillText('Press R to Restart', w / 2, h / 2 + 16);
      }

      rafRef.current = requestAnimationFrame(step);
    }

    function livesDown() {
      setLives((v) => {
        const nv = v - 1;
        if (nv <= 0) {
          gameOver = true;
          setRunning(false);
        }
        return nv;
      });
    }

    function onKeyDown(e) {
      const k = e.key.toLowerCase();
      if (k === 'r' && (!running || lives <= 0)) {
        // reset
        setScore(0); setLives(3); setLevel(1); setRunning(true);
        fleet = createFleet(1); dir = 1; stepDown = false; bullets.length = 0; bombs.length = 0;
      }
      if (k === 'p') {
        setRunning((prev) => !prev);
      }
      if (k === 'enter' && !running && lives > 0) {
        setRunning(true);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className="si-wrapper">
}

function enemyFire(inv) {
  bombs.push({ x: inv.x + inv.w / 2, y: inv.y + inv.h + 2, vy: 3 + Math.random() * 1.2, r: 2.4 });
}

function rectNeon(x, y, w2, h2, color, fillAlpha = 0.08) {
  ctx.fillStyle = hexToRgba(color, fillAlpha);
  ctx.fillRect(x, y, w2, h2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.strokeRect(x + 0.5, y + 0.5, w2 - 1, h2 - 1);
  ctx.shadowBlur = 0;
}

function hexToRgba(hex, a = 1) {
  const v = hex.replace('#', '');
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + (a.w || a.r * 2) > b.x && a.y < b.y + b.h && a.y + (a.h || a.r * 2) > b.y;
}

function drawHUD() {
  ctx.fillStyle = hexToRgba(neonGreen, 0.9);
  ctx.font = '14px "Roboto Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 12, 20);
  ctx.textAlign = 'center';
  ctx.fillText(`LEVEL ${level}`, w / 2, 20);
  ctx.textAlign = 'right';
  ctx.fillText(`LIVES: ${lives}`, w - 12, 20);
}

function step() {
  if (!running) { rafRef.current = requestAnimationFrame(step); return; }
  ctx.clearRect(0, 0, w, h);

  // Background faint grid for vibe
  ctx.strokeStyle = hexToRgba(neonPurple, 0.07);
  ctx.lineWidth = 1;
  for (let gy = 40; gy < h; gy += 20) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
  }

  drawHUD();

  // Player input
  player.vx = 0;
  if (keys.has('arrowleft') || keys.has('a')) player.vx = -player.speed;
  if (keys.has('arrowright') || keys.has('d')) player.vx = player.speed;
  if (keys.has(' ') || keys.has('space')) fire();

  player.x += player.vx;
  player.x = Math.max(24, Math.min(w - 24, player.x));
  if (player.cooldown > 0) player.cooldown--;

  // Draw player
  rectNeon(player.x - player.w / 2, player.y, player.w, player.h, neonGreen, 0.12);

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y += b.vy;
    // draw bullet
    ctx.fillStyle = hexToRgba(neonGreen, 0.85);
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    if (b.y < -8) bullets.splice(i, 1);
  }

  // Fleet movement
  let minX = Infinity, maxX = -Infinity;
  for (const inv of fleet) if (inv.alive) { minX = Math.min(minX, inv.x); maxX = Math.max(maxX, inv.x + inv.w); }
  if (maxX >= w - 20 && dir === 1) { dir = -1; stepDown = true; }
  if (minX <= 20 && dir === -1) { dir = 1; stepDown = true; }

  // Draw invaders
  for (const inv of fleet) {
    if (!inv.alive) continue;
    inv.x += dir * (0.6 + level * 0.12);
    if (stepDown) inv.y += 10;
    // simple animation flicker
    inv.t += 0.16;
    const color = Math.sin(inv.t) > 0 ? neonPurple : neonGreen;
    rectNeon(inv.x, inv.y, inv.w, inv.h, color, 0.1);
    // random fire
    if (Math.random() < (0.002 + level * 0.0006)) enemyFire(inv);
    // reached player line -> lose life
    if (inv.y + inv.h >= player.y) {
      livesDown();
      break;
    }
  }
  stepDown = false;

  // Bullet collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    for (const inv of fleet) {
      if (!inv.alive) continue;
      if (b.x > inv.x && b.x < inv.x + inv.w && b.y > inv.y && b.y < inv.y + inv.h) {
        inv.alive = false;
        bullets.splice(i, 1);
        setScore((s) => s + 10);
        break;
      }
    }
  }

  // Enemy bombs
  for (let i = bombs.length - 1; i >= 0; i--) {
    const m = bombs[i];
    m.y += m.vy;
    ctx.fillStyle = hexToRgba(neonPurple, 0.9);
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
    const box = { x: player.x - player.w / 2, y: player.y, w: player.w, h: player.h };
    if (m.y > h + 10) bombs.splice(i, 1);
    else if (aabb({ x: m.x - m.r, y: m.y - m.r, w: m.r * 2, h: m.r * 2 }, box)) {
      bombs.splice(i, 1);
      livesDown();
    }
  }

  // Next level if all dead
  if (fleet.every((f) => !f.alive)) {
    setLevel((lv) => lv + 1);
    fleet = createFleet(level + 1);
    dir = 1; stepDown = false; bullets.length = 0; bombs.length = 0;
  }

  // Game over screen
  if (gameOver) {
    ctx.fillStyle = hexToRgba('#000', 0.6);
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = neonGreen;
    ctx.font = '28px "Bungee", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', w / 2, h / 2 - 16);
    ctx.font = '14px "Roboto Mono", monospace';
    ctx.fillText('Press R to Restart', w / 2, h / 2 + 16);
  }

  rafRef.current = requestAnimationFrame(step);
}

function livesDown() {
  setLives((v) => {
    const nv = v - 1;
    if (nv <= 0) {
      gameOver = true;
      setRunning(false);
    }
    return nv;
  });
}

function onKeyDown(e) {
  const k = e.key.toLowerCase();
  if (k === 'r' && (!running || lives <= 0)) {
    // reset
    setScore(0); setLives(3); setLevel(1); setRunning(true);
    fleet = createFleet(1); dir = 1; stepDown = false; bullets.length = 0; bombs.length = 0;
  }
  if (k === 'p') {
    setRunning((prev) => !prev);
  }
  if (k === 'enter' && !running && lives > 0) {
    setRunning(true);
  }
}

window.addEventListener('keydown', onKeyDown);
rafRef.current = requestAnimationFrame(step);

return () => {
  cancelAnimationFrame(rafRef.current);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('keydown', keydown);
  window.removeEventListener('keyup', keyup);
  window.removeEventListener('keydown', onKeyDown);
};

return (
  <div className="si-wrapper">
    <div className="si-ui">
      <div>Score: {score}</div>
      <div>Lives: {lives}</div>
      <div>Level: {level}</div>
    </div>
    <div className="si-controls">
      <button className="si-btn" onClick={() => { if (!running && lives > 0) setRunning(true); if (lives <= 0) { setScore(0); setLives(3); setLevel(1); setRunning(true); } }}>Start</button>
      <button className="si-btn" onClick={() => setRunning((p)=>!p)}>{running ? 'Pause' : 'Resume'}</button>
    </div>
    <canvas ref={canvasRef} className="si-canvas" />
    <div className="si-help">Left/Right or A/D to move • Space to shoot • R to restart • P to pause</div>
  </div>
);
