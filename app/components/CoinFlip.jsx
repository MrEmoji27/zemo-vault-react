'use client';

import { useRef, useState, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COIN_RADIUS = 1;
const COIN_THICKNESS = 0.25;
const SEGMENTS = 64;

/* ── Create a canvas texture for a coin face ── */
function makeFaceTexture(isBack = false) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;

  // Fix orientation: rotate canvas 90° so text appears upright after cylinder UV mapping
  ctx.save();
  ctx.translate(cx, cx);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-cx, -cx);

  // Green arcade token background
  const grad = ctx.createRadialGradient(cx * 0.85, cx * 0.7, 0, cx, cx, cx);
  grad.addColorStop(0, '#2a6b3a');
  grad.addColorStop(0.4, '#1a4a28');
  grad.addColorStop(0.7, '#0e3018');
  grad.addColorStop(1, '#061a0c');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cx, cx, 0, Math.PI * 2);
  ctx.fill();

  // Raised rim
  ctx.strokeStyle = '#4aff4a';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cx, cx - 8, 0, Math.PI * 2);
  ctx.stroke();

  // Inner groove
  ctx.strokeStyle = '#0a2a10';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cx, cx * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#4aff4a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cx, cx * 0.76, 0, Math.PI * 2);
  ctx.stroke();

  // Pixel grid overlay for retro feel
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cx, cx - 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  for (let x = 0; x < size; x += 8) {
    ctx.fillRect(x, 0, 1, size);
  }
  for (let y = 0; y < size; y += 8) {
    ctx.fillRect(0, y, size, 1);
  }
  ctx.restore();

  // Symbol
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (isBack) {
    ctx.font = `${size * 0.26}px serif`;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#1a3a1a';
    ctx.fillText('🥀', cx, cx);
    ctx.shadowColor = 'transparent';
  } else {
    ctx.font = `bold ${size * 0.38}px "Press Start 2P", "Courier New", monospace`;
    // Emboss shadow
    ctx.fillStyle = '#003300';
    ctx.fillText('Z', cx + 4, cx + 6);
    // Main letter
    ctx.fillStyle = '#4aff4a';
    ctx.shadowColor = '#4aff4a';
    ctx.shadowBlur = 12;
    ctx.fillText('Z', cx, cx + 2);
    ctx.shadowBlur = 0;
  }

  ctx.restore(); // undo the 90° rotation

  // Notch marks on the rim
  ctx.fillStyle = '#0a2a10';
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const nx = cx + Math.cos(angle) * (cx - 3);
    const ny = cx + Math.sin(angle) * (cx - 3);
    ctx.beginPath();
    ctx.arc(nx, ny, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ── The 3D Coin mesh ── */
const Coin = forwardRef(function Coin(_props, ref) {
  const meshRef = useRef();
  const spinAngle = useRef(0);
  const flipState = useRef({ active: false, elapsed: 0, from: 0, to: 0, duration: 3, isHeads: true });

  const [frontTex, backTex] = useMemo(() => [makeFaceTexture(false), makeFaceTexture(true)], []);

  // Green metallic edge
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a4a28',
    metalness: 0.85,
    roughness: 0.2,
    emissive: '#002a00',
    emissiveIntensity: 0.15,
  }), []);

  // Front face
  const frontMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: frontTex,
    metalness: 0.6,
    roughness: 0.35,
  }), [frontTex]);

  // Back face
  const backMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: backTex,
    metalness: 0.6,
    roughness: 0.35,
  }), [backTex]);

  // [edge, top cap, bottom cap]
  const materials = useMemo(() => [edgeMat, frontMat, backMat], [edgeMat, frontMat, backMat]);

  useImperativeHandle(ref, () => ({
    flip() {
      const fs = flipState.current;
      if (fs.active) return;

      const isHeads = Math.random() < 0.5;
      const cur = spinAngle.current;
      const spins = 8 + Math.random() * 4;
      let target = cur + spins * Math.PI * 2;

      const rem = ((target % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (isHeads) {
        target += ((Math.PI * 2) - rem) % (Math.PI * 2);
      } else {
        target += (Math.PI - rem + Math.PI * 2) % (Math.PI * 2);
      }

      fs.active = true;
      fs.elapsed = 0;
      fs.from = cur;
      fs.to = target;
      fs.duration = 3;
      fs.isHeads = isHeads;
    },
  }));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const fs = flipState.current;

    if (fs.active) {
      fs.elapsed += delta;
      const t = Math.min(fs.elapsed / fs.duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      spinAngle.current = fs.from + (fs.to - fs.from) * eased;

      if (t >= 1) {
        fs.active = false;
        // Dispatch DOM event to bridge R3F reconciler → outer React tree
        window.dispatchEvent(new CustomEvent('coin-flip-done', { detail: { isHeads: fs.isHeads } }));
      }
    } else {
      spinAngle.current += delta * 0.6;
    }

    meshRef.current.rotation.set(Math.PI / 2, spinAngle.current, 0, 'YXZ');
  });

  return (
    <mesh ref={meshRef} material={materials}>
      <cylinderGeometry args={[COIN_RADIUS, COIN_RADIUS, COIN_THICKNESS, SEGMENTS, 1, false]} />
    </mesh>
  );
});

/* ── Main widget ── */
export default function CoinFlip() {
  const coinRef = useRef(null);
  const [result, setResult] = useState(null); // 'HEADS' | 'TAILS' | null
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleClick = () => {
    coinRef.current?.flip();
  };

  // Listen for flip-done events from R3F reconciler via DOM events
  useEffect(() => {
    const handler = (e) => {
      const { isHeads } = e.detail;
      if (timerRef.current) clearTimeout(timerRef.current);
      setResult(isHeads ? 'HEADS' : 'TAILS');
      setVisible(true);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setResult(null), 400);
      }, 2500);
    };
    window.addEventListener('coin-flip-done', handler);
    return () => window.removeEventListener('coin-flip-done', handler);
  }, []);

  const isHeads = result === 'HEADS';
  const color = isHeads ? '#4aff4a' : '#ff4a4a';

  return (
    <>
      <div className="coin-widget" onClick={handleClick}>
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.3} />
          <directionalLight position={[3, 3, 5]} intensity={2} color="#ffffff" />
          <directionalLight position={[-3, 1, 3]} intensity={0.6} color="#ccffcc" />
          <pointLight position={[0, 0, -3]} intensity={1.2} color="#4aff4a" distance={8} />
          <pointLight position={[0, -3, 2]} intensity={0.4} color="#2aff2a" distance={6} />
          <Coin ref={coinRef} />
        </Canvas>
      </div>

      {/* ── Simple result popup (portalled to body) ── */}
      {mounted && result && createPortal(
        <div
          className="flip-popup"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.9)',
            '--glow': color,
          }}
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setVisible(false);
            setTimeout(() => setResult(null), 400);
          }}
        >
          <span className="flip-popup-text" style={{ color }}>
            {result}
          </span>
        </div>,
        document.body
      )}

      <style jsx>{`
        .coin-widget {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          width: 80px;
          height: 80px;
          cursor: pointer;
          z-index: 100;
          background: none;
          border: none;
          outline: none;
          pointer-events: auto;
        }
        @media (max-width: 768px) {
          .coin-widget {
            bottom: 8rem;
            left: auto;
            right: 1rem;
            width: 64px;
            height: 64px;
          }
        }
      `}</style>

      <style jsx global>{`
        .flip-popup {
          position: fixed;
          bottom: calc(2rem + 88px);
          left: 2rem;
          z-index: 9999;
          padding: 8px 18px;
          background: rgba(0, 0, 0, 0.85);
          border: 2px solid var(--glow);
          border-radius: 6px;
          box-shadow: 0 0 12px var(--glow), 0 0 24px color-mix(in srgb, var(--glow) 25%, transparent);
          cursor: pointer;
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: auto;
        }
        .flip-popup-text {
          font-family: 'Press Start 2P', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-shadow: 0 0 8px currentColor;
          white-space: nowrap;
        }
        @media (max-width: 768px) {
          .flip-popup {
            bottom: calc(8rem + 72px);
            left: auto;
            right: 1rem;
          }
        }
      `}</style>
    </>
  );
}
