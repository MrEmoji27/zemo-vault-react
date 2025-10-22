import React, { useEffect, useRef, useState } from 'react';
import './Flappy.css';

export default function Flappy() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const aliveRef = useRef(true);
  const controlsRef = useRef({ start: () => {}, togglePause: () => {} });
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const overlayRef = useRef(null);
  const prevFocusRef = useRef(null);

  // keep refs in sync with state
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // a11y: focus overlay when visible and restore on close
  useEffect(() => {
    const visible = !running;
    if (visible) {
      prevFocusRef.current = document.activeElement;
      const el = overlayRef.current;
      if (el) {
        try { el.focus(); } catch(_){}
      }
    } else {
      const pf = prevFocusRef.current;
      if (pf && typeof pf.focus === 'function') {
        try { pf.focus(); } catch(_){}
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
    // try to focus canvas for keyboard input
    setTimeout(() => { try { canvas.focus(); } catch(_){} }, 0);

    // Game state
    let bird = { x: 0.22, y: 0.5, vy: 0, r: 0.018 };
    let pipes = [];
    let t = 0; // time
    let alive = true;
    aliveRef.current = true;
    let best = Number(localStorage.getItem('flappy_best') || 0);

    function reset() {
      bird = { x: 0.22, y: 0.5, vy: 0, r: 0.018 };
      pipes = [];
      t = 0;
      alive = true;
      aliveRef.current = true;
      setScore(0);
    }

    const G = 1.45; // gravity
    const JUMP = -0.5; // impulse

    function spawnPipe() {
      const gap = 0.22; // fraction of height
      const center = 0.3 + Math.random() * 0.4; // 0.3..0.7
      const x = 1.2; // spawn offscreen right
      const w = 0.08; // pipe width
      pipes.push({ x, w, gapTop: center - gap / 2, gapBot: center + gap / 2, passed: false });
    }

    function step(dt) {
      if (!alive) return;
      // physics in normalized units per second
      bird.vy += G * dt;
      bird.y += bird.vy * dt;

      // spawn pipes
      t += dt;
      if (t > 1.3) { t = 0; spawnPipe(); }

      // move pipes
      for (const p of pipes) p.x -= 0.35 * dt;
      while (pipes.length && pipes[0].x + pipes[0].w < -0.2) pipes.shift();

      // scoring
      for (const p of pipes) {
        if (!p.passed && bird.x > p.x + p.w) {
          p.passed = true;
          setScore((s) => {
            const ns = s + 1; if (ns > best) { best = ns; localStorage.setItem('flappy_best', String(best)); } return ns;
          });
        }
      }

      // collisions
      if (bird.y - bird.r < 0 || bird.y + bird.r > 1) alive = false;
      for (const p of pipes) {
        const inX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + p.w;
        const inY = bird.y - bird.r > p.gapTop && bird.y + bird.r < p.gapBot;
        if (inX && !inY) { alive = false; break; }
      }

      if (!alive) { aliveRef.current = false; setRunning(false); }
    }

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.scale(w, h); // normalized 0..1

      // background
      const g = ctx.createLinearGradient(0,0,0,1);
      g.addColorStop(0,'#0a0f1f'); g.addColorStop(1,'#05070d');
      ctx.fillStyle = g; ctx.fillRect(0,0,1,1);

      // neon grid floor
      ctx.strokeStyle = 'rgba(91, 187, 255, 0.08)';
      ctx.lineWidth = 0.002;
      for (let i=0;i<20;i++){ ctx.beginPath(); ctx.moveTo(0,i/20); ctx.lineTo(1,i/20); ctx.stroke(); }
      for (let i=0;i<20;i++){ ctx.beginPath(); ctx.moveTo(i/20,0); ctx.lineTo(i/20,1); ctx.stroke(); }

      // pipes
      for (const p of pipes) {
        ctx.fillStyle = 'rgba(59,180,255,0.22)';
        ctx.strokeStyle = 'rgba(59,180,255,0.45)';
        ctx.lineWidth = 0.006;
        // top
        ctx.beginPath(); ctx.rect(p.x, 0, p.w, p.gapTop); ctx.fill(); ctx.stroke();
        // bottom
        ctx.beginPath(); ctx.rect(p.x, p.gapBot, p.w, 1 - p.gapBot); ctx.fill(); ctx.stroke();
        // glow
        ctx.shadowColor = '#5cc3ff'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
      }

      // bird
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(Math.atan2(bird.vy, 0.8) * 0.25);
      // glow outer
      ctx.fillStyle = '#ff77e9';
      ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.arc(0,0,bird.r*1.6,0,Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
      // body
      ctx.fillStyle = '#ffd43b';
      ctx.beginPath(); ctx.arc(0,0,bird.r,0,Math.PI*2); ctx.fill();
      // eye
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(bird.r*0.35, -bird.r*0.15, bird.r*0.18, 0, Math.PI*2); ctx.fill();
      // beak
      ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.moveTo(bird.r*0.9,0); ctx.lineTo(bird.r*0.4,bird.r*0.22); ctx.lineTo(bird.r*0.4,-bird.r*0.22); ctx.closePath(); ctx.fill();
      ctx.restore();

      // HUD drawn via DOM overlay, only restore context here
      ctx.scale(1/w, 1/h);
      ctx.restore();
    }

    let last = 0;
    function loop(ts){
      rafRef.current = requestAnimationFrame(loop);
      const now = ts/1000; if (!last) last = now; const dt = Math.min(0.033, now-last); last = now;
      if (runningRef.current && !pausedRef.current) step(dt);
      draw();
    }
    rafRef.current = requestAnimationFrame(loop);

    function onPress(){
      if (!aliveRef.current) { // one-click restart AND flap
        reset();
      }
      bird.vy = JUMP;
      runningRef.current = true; setRunning(true);
      pausedRef.current = false; setPaused(false);
    }
    function onKey(e){
      if (e.code === 'Space') { e.preventDefault(); onPress(); }
      if (e.code === 'KeyR') { e.preventDefault(); reset(); runningRef.current = false; setRunning(false); }
      if (e.code === 'KeyP') { e.preventDefault(); if (aliveRef.current) { pausedRef.current = !pausedRef.current; setPaused(p => !p); } }
    }

    // wire external controls
    controlsRef.current.start = () => { if (!aliveRef.current) reset(); runningRef.current = true; setRunning(true); pausedRef.current = false; setPaused(false); };
    controlsRef.current.togglePause = () => { if (aliveRef.current) { pausedRef.current = !pausedRef.current; setPaused(p => !p); } };

    // use pointer events to support mouse and touch
    const onPointer = () => { try { canvas.focus(); } catch(_){}; onPress(); };
    // bind globally so overlays or layout don't block input
    window.addEventListener('pointerdown', onPointer, { passive: true });
    window.addEventListener('keydown', onKey);
    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="flappy-root">
      <div className="hud">
        <div className="hud-badges">
          <div className="hud-badge hud-green"><span className="hud-label">Score</span><span className="hud-value">{score}</span></div>
        </div>
      </div>
      <div className="si-controls">
        <button className="si-btn" aria-label="Start Flappy" onClick={() => controlsRef.current.start()}>Start</button>
        <button className="si-btn" aria-label={paused ? 'Resume Flappy' : 'Pause Flappy'} onClick={() => controlsRef.current.togglePause()}>{paused ? 'Resume' : 'Pause'}</button>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="flappy-canvas" tabIndex={0} />
        <button className="flappy-catcher" aria-label="Flap" onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onPress(); }} />
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
              <h3 id="fl-overlay-title" className="overlay-title">{!aliveRef.current ? 'Game Over' : (paused ? 'Paused' : 'Ready')}</h3>
              <p id="fl-overlay-desc" className="overlay-sub">Click/Space to flap · P pause · R restart</p>
            </div>
          </div>
        )}
      </div>
      <div className="controls-chip">Click/Space to flap • P pause • R restart</div>
    </div>
  );
}
