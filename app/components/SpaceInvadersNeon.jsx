'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function SpaceInvadersNeon() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  const fleetRef = useRef([]);
  const bulletsRef = useRef([]);
  const bombsRef = useRef([]);
  const particlesRef = useRef([]);
  const scorePopupsRef = useRef([]);
  const shieldsRef = useRef([]);
  const ufoRef = useRef(null);
  const dirRef = useRef(1);
  const stepDownRef = useRef(false);
  const playerRef = useRef({ x: 0, y: 0, w: 42, h: 14, vx: 0, speed: 4.2, cooldown: 0, hitFlash: 0 });
  const keysRef = useRef(new Set());
  const gameOverRef = useRef(false);
  const widthRef = useRef(900);
  const heightRef = useRef(600);
  const runningRef = useRef(false);
  const overlayRef = useRef(null);
  const prevFocusRef = useRef(null);
  const starsRef = useRef([]);
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const animFrameRef = useRef(0);

  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const scoreRef = useRef(0);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    const visible = !running || gameOverRef.current;
    if (visible) {
      prevFocusRef.current = document.activeElement;
      const el = overlayRef.current;
      if (el) { try { el.focus(); } catch (_) { } }
    } else {
      const pf = prevFocusRef.current;
      if (pf && typeof pf.focus === 'function') { try { pf.focus(); } catch (_) { } }
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

    // Initialize starfield
    for (let i = 0; i < 100; i++) {
      starsRef.current.push({
        x: Math.random() * widthRef.current,
        y: Math.random() * heightRef.current,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    const neonGreen = '#00ff8c';
    const neonPurple = '#9b5de5';
    const neonPink = '#ff006e';

    function createFleet(lv) {
      const w = widthRef.current;
      const rows = 4 + Math.min(3, lv - 1);
      const cols = 9;
      const gapX = 18;
      const gapY = 18;
      const startX = (w - (cols * 24 + (cols - 1) * gapX)) / 2;
      const startY = 80;
      const arr = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const type = r < 2 ? 0 : r < 4 ? 1 : 2; // 3 alien types
          arr.push({
            x: startX + c * (24 + gapX),
            y: startY + r * (18 + gapY),
            w: 24,
            h: 18,
            alive: true,
            t: Math.random() * 1000,
            type
          });
        }
      }
      return arr;
    }

    function createShields() {
      const w = widthRef.current;
      const h = heightRef.current;
      const shields = [];
      const shieldY = h - 150;
      const spacing = w / 5;

      for (let i = 1; i <= 4; i++) {
        const blocks = [];
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 6; col++) {
            if (row === 0 && (col === 0 || col === 5)) continue; // curved top
            if (row === 3 && col >= 2 && col <= 3) continue; // gap at bottom
            blocks.push({
              x: spacing * i - 36 + col * 12,
              y: shieldY + row * 8,
              w: 12,
              h: 8,
              alive: true
            });
          }
        }
        shields.push(...blocks);
      }
      return shields;
    }

    function spawnUFO() {
      if (ufoRef.current) return;
      const w = widthRef.current;
      ufoRef.current = {
        x: -50,
        y: 40,
        w: 40,
        h: 20,
        vx: 2,
        alive: true,
        points: 50 + Math.floor(Math.random() * 3) * 50 // 50, 100, or 150
      };
    }

    function hexToRgba(hex, a = 1) {
      const v = hex.replace('#', '');
      const r = parseInt(v.substring(0, 2), 16);
      const g = parseInt(v.substring(2, 4), 16);
      const b = parseInt(v.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    function addParticle(x, y, vx, vy, color, life = 1, size = 2) {
      particlesRef.current.push({ x, y, vx, vy, color, life, maxLife: life, size });
    }

    function createExplosion(x, y, color) {
      for (let i = 0; i < 25; i++) {
        const angle = (Math.PI * 2 * i) / 25;
        const speed = 2 + Math.random() * 3;
        addParticle(
          x, y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          0.6 + Math.random() * 0.4,
          1.5 + Math.random() * 1.5
        );
      }
    }

    function addScorePopup(x, y, points) {
      scorePopupsRef.current.push({
        x, y,
        text: `+${points}`,
        life: 1.2,
        maxLife: 1.2
      });
    }

    function drawPixelatedAlien(x, y, w, h, type, frame) {
      const pixelSize = 3;
      const patterns = [
        // Type 0 - Classic invader
        [
          [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 1, 1, 1, 1, 1, 1, 0, 1]
        ],
        // Type 1 - Squid
        [
          [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
          [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
          [0, 1, 0, 0, 1, 1, 0, 0, 1, 0]
        ],
        // Type 2 - Crab
        [
          [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
        ]
      ];

      const colors = [neonPink, neonPurple, neonGreen];
      const pattern = patterns[type] || patterns[0];
      const color = colors[type] || neonGreen;

      ctx.fillStyle = color;
      for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
          if (pattern[row][col]) {
            const px = x + col * pixelSize;
            const py = y + row * pixelSize;
            ctx.fillRect(px, py, pixelSize, pixelSize);
          }
        }
      }
    }

    function drawPlayer(px, py, w, h) {
      const pixelSize = 2;

      // Player ship pattern
      ctx.fillStyle = neonGreen;

      // Main body
      ctx.fillRect(px - 8, py + 6, 16, 4);
      // Cockpit
      ctx.fillRect(px - 4, py + 2, 8, 4);
      // Wings
      ctx.fillRect(px - 16, py + 8, 6, 4);
      ctx.fillRect(px + 10, py + 8, 6, 4);
      // Weapon
      ctx.fillRect(px - 2, py, 4, 2);

      // Glow
      ctx.shadowColor = neonGreen;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = hexToRgba(neonGreen, 0.8);
      ctx.lineWidth = 1;
      ctx.strokeRect(px - 20, py, 40, 12);
      ctx.shadowBlur = 0;

      // Engine particles
      if (Math.random() < 0.3) {
        addParticle(px - 12, py + 12, -0.5 - Math.random(), 1 + Math.random(), neonGreen, 0.3, 1);
        addParticle(px + 12, py + 12, 0.5 + Math.random(), 1 + Math.random(), neonGreen, 0.3, 1);
      }
    }

    function drawUFO(ufo) {
      ctx.fillStyle = neonPink;

      // UFO body shape
      ctx.fillRect(ufo.x + 5, ufo.y + 8, 30, 8);
      ctx.fillRect(ufo.x + 10, ufo.y + 4, 20, 4);
      ctx.fillRect(ufo.x + 15, ufo.y, 10, 4);

      // Glow
      ctx.shadowColor = neonPink;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = neonPink;
      ctx.strokeRect(ufo.x, ufo.y, ufo.w, ufo.h);
      ctx.shadowBlur = 0;

      // Blinking lights
      if (Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ufo.x + 10, ufo.y + 10, 3, 3);
        ctx.fillRect(ufo.x + 27, ufo.y + 10, 3, 3);
      }
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

    function screenShake(intensity) {
      shakeRef.current.intensity = intensity;
    }

    function step() {
      const w = widthRef.current;
      const h = heightRef.current;

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

      // Animated stars
      starsRef.current.forEach(star => {
        star.y += star.speed;
        if (star.y > h) star.y = 0;
        star.twinkle += 0.05;

        const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Animated grid
      ctx.strokeStyle = hexToRgba(neonPurple, 0.08 + Math.sin(Date.now() / 1000) * 0.02);
      ctx.lineWidth = 1;
      for (let gy = 60; gy < h; gy += 20) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      const p = playerRef.current;

      if (running && !gameOverRef.current) {
        // Update animation frame
        animFrameRef.current += 1;

        // Input
        const keys = keysRef.current;
        p.vx = 0;
        if (keys.has('arrowleft') || keys.has('a')) p.vx = -p.speed;
        if (keys.has('arrowright') || keys.has('d')) p.vx = p.speed;
        if (keys.has(' ') || keys.has('space')) fire();
        p.x = Math.max(24, Math.min(w - 24, p.x + p.vx));
        if (p.cooldown > 0) p.cooldown--;
        if (p.hitFlash > 0) p.hitFlash--;

        // UFO
        if (!ufoRef.current && Math.random() < 0.001) spawnUFO();
        if (ufoRef.current) {
          ufoRef.current.x += ufoRef.current.vx;
          if (ufoRef.current.x > w + 50) ufoRef.current = null;
          else drawUFO(ufoRef.current);
        }

        // Shields
        shieldsRef.current.forEach(block => {
          if (block.alive) {
            ctx.fillStyle = hexToRgba(neonGreen, 0.3);
            ctx.fillRect(block.x, block.y, block.w, block.h);
            ctx.strokeStyle = hexToRgba(neonGreen, 0.6);
            ctx.strokeRect(block.x, block.y, block.w, block.h);
          }
        });

        // Player
        if (p.hitFlash > 0 && p.hitFlash % 4 < 2) {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(p.x - p.w / 2, p.y, p.w, p.h);
        } else {
          drawPlayer(p.x, p.y, p.w, p.h);
        }

        // Bullets
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];
          b.y += b.vy;

          // Bullet trail
          addParticle(b.x, b.y, 0, 0.5, neonGreen, 0.2, 1.5);

          ctx.fillStyle = neonGreen;
          ctx.shadowColor = neonGreen;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          if (b.y < -8) bulletsRef.current.splice(i, 1);
        }

        // Fleet movement
        let minX = Infinity, maxX = -Infinity;
        for (const inv of fleetRef.current) if (inv.alive) {
          minX = Math.min(minX, inv.x);
          maxX = Math.max(maxX, inv.x + inv.w);
        }
        if (maxX >= w - 20 && dirRef.current === 1) { dirRef.current = -1; stepDownRef.current = true; }
        if (minX <= 20 && dirRef.current === -1) { dirRef.current = 1; stepDownRef.current = true; }

        // Invaders
        const frame = Math.floor(animFrameRef.current / 20) % 2;
        for (const inv of fleetRef.current) {
          if (!inv.alive) continue;
          inv.x += dirRef.current * (0.6 + level * 0.12);
          if (stepDownRef.current) inv.y += 10;
          inv.t += 0.16;

          drawPixelatedAlien(inv.x, inv.y, inv.w, inv.h, inv.type, frame);

          if (Math.random() < (0.002 + level * 0.0006)) enemyFire(inv);
          if (inv.y + inv.h >= p.y) { loseLife(); break; }
        }
        stepDownRef.current = false;

        // Bullet collisions
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];
          let hit = false;

          // Hit aliens
          for (const inv of fleetRef.current) {
            if (!inv.alive) continue;
            if (b.x > inv.x && b.x < inv.x + inv.w && b.y > inv.y && b.y < inv.y + inv.h) {
              inv.alive = false;
              bulletsRef.current.splice(i, 1);
              const colors = [neonPink, neonPurple, neonGreen];
              createExplosion(inv.x + inv.w / 2, inv.y + inv.h / 2, colors[inv.type]);
              addScorePopup(inv.x + inv.w / 2, inv.y, 10);
              setScore(s => s + 10);
              screenShake(3);
              hit = true;
              break;
            }
          }

          if (hit) continue;

          // Hit UFO
          if (ufoRef.current && b.x > ufoRef.current.x && b.x < ufoRef.current.x + ufoRef.current.w &&
            b.y > ufoRef.current.y && b.y < ufoRef.current.y + ufoRef.current.h) {
            const points = ufoRef.current.points;
            createExplosion(ufoRef.current.x + 20, ufoRef.current.y + 10, neonPink);
            addScorePopup(ufoRef.current.x + 20, ufoRef.current.y, points);
            setScore(s => s + points);
            screenShake(5);
            ufoRef.current = null;
            bulletsRef.current.splice(i, 1);
            continue;
          }

          // Hit shields
          for (const block of shieldsRef.current) {
            if (!block.alive) continue;
            if (b.x > block.x && b.x < block.x + block.w && b.y > block.y && b.y < block.y + block.h) {
              block.alive = false;
              bulletsRef.current.splice(i, 1);
              break;
            }
          }
        }

        // Enemy bombs
        for (let i = bombsRef.current.length - 1; i >= 0; i--) {
          const m = bombsRef.current[i];
          m.y += m.vy;

          // Bomb trail
          addParticle(m.x, m.y, 0, -0.5, neonPurple, 0.2, 1.5);

          ctx.fillStyle = neonPurple;
          ctx.shadowColor = neonPurple;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          const box = { x: p.x - p.w / 2, y: p.y, w: p.w, h: p.h };
          if (m.y > h + 10) {
            bombsRef.current.splice(i, 1);
          } else if (aabb({ x: m.x - m.r, y: m.y - m.r, w: m.r * 2, h: m.r * 2 }, box)) {
            bombsRef.current.splice(i, 1);
            loseLife();
          } else {
            // Hit shields
            for (const block of shieldsRef.current) {
              if (!block.alive) continue;
              if (m.x > block.x && m.x < block.x + block.w && m.y > block.y && m.y < block.y + block.h) {
                block.alive = false;
                bombsRef.current.splice(i, 1);
                break;
              }
            }
          }
        }

        // Next level
        if (fleetRef.current.every(f => !f.alive)) {
          setLevel(lv => lv + 1);
          fleetRef.current = createFleet(level + 1);
          shieldsRef.current = createShields();
          dirRef.current = 1;
          stepDownRef.current = false;
          bulletsRef.current.length = 0;
          bombsRef.current.length = 0;
          screenShake(8);
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
      } else {
        // Paused state
        drawPlayer(p.x, p.y, p.w, p.h);
        const frame = 0;
        for (const inv of fleetRef.current) if (inv.alive) drawPixelatedAlien(inv.x, inv.y, inv.w, inv.h, inv.type, frame);
      }

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
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(popup.text, popup.x, popup.y);
      });
      ctx.globalAlpha = 1;

      ctx.restore();
      rafRef.current = requestAnimationFrame(step);
    }

    function loseLife() {
      const p = playerRef.current;
      p.hitFlash = 30;
      createExplosion(p.x, p.y + 6, '#ff0000');
      screenShake(10);

      setLives(v => {
        const nv = v - 1;
        if (nv <= 0) {
          gameOverRef.current = true;
          setRunning(false);
        }
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
        setScore(0);
        setLives(3);
        setLevel(1);
        setRunning(true);
        gameOverRef.current = false;
        fleetRef.current = createFleet(1);
        shieldsRef.current = createShields();
        dirRef.current = 1;
        stepDownRef.current = false;
        bulletsRef.current.length = 0;
        bombsRef.current.length = 0;
        particlesRef.current.length = 0;
        scorePopupsRef.current.length = 0;
        ufoRef.current = null;
      }
      if (k === 'p') setRunning(prev => !prev);
      if (k === 'enter' && !running && lives > 0 && !gameOverRef.current) setRunning(true);
      keysRef.current.add(k);
    }

    function onKeyUp(e) { keysRef.current.delete(e.key.toLowerCase()); }

    // Touch controls for mobile - drag to move ship, tap to fire
    let lastTouchX = null;
    function onTouchStart(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const scaleX = widthRef.current / rect.width;
      lastTouchX = tx * scaleX;
      playerRef.current.x = Math.max(24, Math.min(widthRef.current - 24, lastTouchX));
      if (!runningRef.current && !gameOverRef.current) {
        setRunning(true);
      }
    }
    function onTouchMove(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const scaleX = widthRef.current / rect.width;
      lastTouchX = tx * scaleX;
      playerRef.current.x = Math.max(24, Math.min(widthRef.current - 24, lastTouchX));
    }
    function onTouchEnd(e) {
      // Tap = fire (short touch with minimal movement)
      if (runningRef.current) fire();
    }
    canvas.style.touchAction = 'none';
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    fleetRef.current = createFleet(level);
    shieldsRef.current = createShields();
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [level, lives, running]);

  const handleStart = () => {
    if (lives <= 0) {
      setScore(0);
      setLives(3);
      setLevel(1);
      gameOverRef.current = false;
    }
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
        <button className="si-btn" aria-label={running ? 'Pause Space Invaders' : 'Resume Space Invaders'} onClick={() => setRunning(p => !p)}>{running ? 'Pause' : 'Resume'}</button>
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
      <div className="controls-chip">Arrows/A-D/Touch move • Space/Tap shoot • P pause • R restart</div>
    </div>
  );
}
