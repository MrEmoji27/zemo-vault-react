import { useEffect, useRef } from 'react';

class Pixel {
  constructor(canvas, ctx, x, y, color, speed, delay) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = (Math.random() * 0.8 + 0.1) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = Math.random() * (this.maxSizeInteger - this.minSize) + this.minSize;
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  draw() {
    const offset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + offset, this.y + offset, this.size, this.size);
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) { this.counter += this.counterStep; return; }
    if (this.size >= this.maxSize) this.isShimmer = true;
    if (this.isShimmer) { this.shimmer(); } else { this.size += this.sizeStep; }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) { this.isIdle = true; return; }
    this.size -= 0.1;
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true;
    else if (this.size <= this.minSize) this.isReverse = false;
    this.size += this.isReverse ? -this.speed : this.speed;
  }
}

export default function PixelCard({
  children,
  gap = 6,
  speed = 30,
  colors = '#00ff8c,#00cc70,#005c33',
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const pixelsRef = useRef([]);
  const animRef = useRef(null);
  const timePrevRef = useRef(performance.now());

  const initPixels = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = w;
    canvasRef.current.height = h;

    const colorsArr = colors.split(',');
    const pxs = [];
    const effectiveSpeed = Math.min(speed, 100) * 0.001;
    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        const color = colorsArr[Math.floor(Math.random() * colorsArr.length)];
        const dx = x - w / 2, dy = y - h / 2;
        const delay = Math.sqrt(dx * dx + dy * dy);
        pxs.push(new Pixel(canvasRef.current, ctx, x, y, color, effectiveSpeed, delay));
      }
    }
    pixelsRef.current = pxs;
  };

  const doAnimate = (fnName) => {
    animRef.current = requestAnimationFrame(() => doAnimate(fnName));
    const now = performance.now();
    if (now - timePrevRef.current < 1000 / 60) return;
    timePrevRef.current = now;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    let allIdle = true;
    for (const px of pixelsRef.current) {
      px[fnName]();
      if (!px.isIdle) allIdle = false;
    }
    if (allIdle && animRef.current) cancelAnimationFrame(animRef.current);
  };

  const startAnim = (name) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(() => doAnimate(name));
  };

  useEffect(() => {
    initPixels();
    const obs = new ResizeObserver(() => initPixels());
    if (containerRef.current) obs.observe(containerRef.current);
    return () => { obs.disconnect(); if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [gap, speed, colors]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => startAnim('appear')}
      onMouseLeave={() => startAnim('disappear')}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 140, 0.15)',
        isolation: 'isolate',
        cursor: 'pointer',
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', inset: 0 }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
        {children}
      </div>
    </div>
  );
}
