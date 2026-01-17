'use client';

import React, { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function CoinFlip() {
  const coinRef = useRef(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const rotationRef = useRef(0);

  // Continuous rotation
  useEffect(() => {
    const coin = coinRef.current;
    if (!coin) return;

    let animationId;
    let rotation = 0;

    const animate = () => {
      rotation += 0.5;
      if (!isFlipping) {
        coin.style.transform = `rotateY(${rotation}deg)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isFlipping]);

  // Periodic glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150);
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(glitchInterval);
  }, []);

  const flip = () => {
    if (isFlipping) return;

    const coin = coinRef.current;
    if (!coin) return;

    setIsFlipping(true);

    const isHeads = Math.random() < 0.5;
    const currentRot = rotationRef.current;
    const baseAdd = 1800 + (Math.random() * 360);
    let nextRot = currentRot + baseAdd;

    const remainder = nextRot % 360;
    const distToHeads = (360 - remainder) % 360;
    const distToTails = (180 - remainder + 360) % 360;

    if (isHeads) {
      nextRot += distToHeads;
    } else {
      nextRot += distToTails;
    }

    if (nextRot - currentRot < 1080) nextRot += 720;

    rotationRef.current = nextRot;

    coin.style.transition = 'transform 3.5s cubic-bezier(0.12, 0.7, 0.25, 1)';
    coin.style.transform = `rotateY(${nextRot}deg)`;

    setTimeout(() => {
      setIsFlipping(false);
      coin.style.transition = 'none';
      toast.success(isHeads ? 'Heads - Z!' : 'Tails!', {
        icon: isHeads ? '⚡' : '🥀',
        style: {
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#00ff8c',
          border: '1px solid #00ff8c',
          boxShadow: '0 0 20px rgba(0, 255, 140, 0.4)'
        }
      });
    }, 3500);
  };

  return (
    <div className={`coin-container ${isGlitching ? 'glitch' : ''}`} onClick={flip}>
      <div className="coin-3d" ref={coinRef}>
        <div className="face front">
          <div className="face-content">
            <div className="ascii-z">Z</div>
          </div>
        </div>
        <div className="face back">
          <div className="face-content">
            <div className="flower">🥀</div>
          </div>
        </div>

        {/* Edge layers for thickness */}
        <div className="layer l-1" />
        <div className="layer l-2" />
        <div className="layer l-3" />
        <div className="layer l-4" />
        <div className="layer l-5" />
        <div className="layer l-6" />
      </div>

      <style jsx>{`
        .coin-container {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          width: 80px;
          height: 80px;
          perspective: 1200px;
          cursor: pointer;
          z-index: 100;
          transition: transform 0.3s ease;
          filter: drop-shadow(0 0 15px rgba(0, 255, 140, 0.6));
        }

        .coin-container:hover {
          transform: scale(1.15) translateY(-8px);
          filter: drop-shadow(0 0 25px rgba(0, 255, 140, 0.8));
        }

        .coin-container.glitch {
          animation: glitch 0.15s;
        }

        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); filter: drop-shadow(0 0 15px rgba(255, 0, 255, 0.6)); }
          40% { transform: translate(2px, -2px); filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.6)); }
          60% { transform: translate(-2px, -2px); filter: drop-shadow(0 0 15px rgba(255, 255, 0, 0.6)); }
          80% { transform: translate(2px, 2px); filter: drop-shadow(0 0 15px rgba(0, 255, 140, 0.6)); }
          100% { transform: translate(0); }
        }
        
        @media (max-width: 768px) {
          .coin-container {
            bottom: 8rem;
            left: auto;
            right: 1rem;
            width: 60px;
            height: 60px;
          }
        }

        .coin-3d {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .face {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #00ff8c;
          box-shadow: 
            0 0 20px rgba(0, 255, 140, 0.6),
            inset 0 0 30px rgba(0, 255, 140, 0.3),
            inset 0 0 15px rgba(255, 255, 255, 0.2);
          overflow: hidden;
          image-rendering: pixelated;
          background: 
            repeating-linear-gradient(
              0deg,
              rgba(0, 255, 140, 0.03) 0px,
              rgba(0, 255, 140, 0.03) 1px,
              transparent 1px,
              transparent 2px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0, 255, 140, 0.03) 0px,
              rgba(0, 255, 140, 0.03) 1px,
              transparent 1px,
              transparent 2px
            ),
            radial-gradient(
              circle at 30% 30%,
              rgba(0, 255, 140, 0.4),
              rgba(0, 255, 140, 0.2),
              rgba(0, 100, 60, 0.6)
            );
        }

        .front {
          transform: translateZ(4px);
          z-index: 10;
        }

        .back {
          transform: rotateY(180deg) translateZ(4px);
          z-index: 10;
        }

        /* Holographic scan line effect */
        .face::before {
          content: '';
          position: absolute;
          top: -100%;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 255, 140, 0.4) 50%,
            transparent 100%
          );
          animation: holo-scan 3s infinite linear;
          pointer-events: none;
        }

        @keyframes holo-scan {
          0% { top: -100%; }
          100% { top: 200%; }
        }

        /* Shimmer overlay */
        .face::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 70%
          );
          animation: shimmer 4s infinite;
          pointer-events: none;
        }

        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%) translateY(-100%); }
          50% { transform: translateX(100%) translateY(100%); }
        }

        .face-content {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          position: relative;
        }

        .ascii-z {
          font-family: 'Courier New', monospace;
          font-size: 3rem;
          font-weight: bold;
          color: #00ff8c;
          text-shadow:
            0 0 10px rgba(0, 255, 140, 1),
            0 0 20px rgba(0, 255, 140, 0.8),
            0 0 30px rgba(0, 255, 140, 0.6),
            2px 2px 0 rgba(0, 100, 60, 0.8);
          image-rendering: pixelated;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
          animation: z-flicker 0.1s infinite alternate;
        }

        @keyframes z-flicker {
          0% { opacity: 0.95; }
          100% { opacity: 1; }
        }

        .flower {
          font-size: 2.5rem;
          filter: 
            drop-shadow(0 0 10px rgba(0, 255, 140, 0.8))
            drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
          animation: flower-glow 2s infinite alternate;
        }

        @keyframes flower-glow {
          0% { filter: drop-shadow(0 0 10px rgba(0, 255, 140, 0.6)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6)); }
          100% { filter: drop-shadow(0 0 20px rgba(0, 255, 140, 1)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6)); }
        }

        /* Thickness layers with holographic edges */
        .layer {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          z-index: 1;
          border: 1px solid rgba(0, 255, 140, 0.3);
        }

        .l-1 { 
          transform: translateZ(3px); 
          background: linear-gradient(90deg, 
            rgba(0, 255, 140, 0.4), 
            rgba(0, 200, 100, 0.4)
          );
        }
        .l-2 { 
          transform: translateZ(2px); 
          background: linear-gradient(90deg, 
            rgba(0, 200, 100, 0.4), 
            rgba(0, 150, 80, 0.4)
          );
        }
        .l-3 { 
          transform: translateZ(1px); 
          background: linear-gradient(90deg, 
            rgba(0, 150, 80, 0.4), 
            rgba(0, 100, 60, 0.4)
          );
        }
        .l-4 { 
          transform: translateZ(-1px); 
          background: linear-gradient(90deg, 
            rgba(0, 100, 60, 0.4), 
            rgba(0, 150, 80, 0.4)
          );
        }
        .l-5 { 
          transform: translateZ(-2px); 
          background: linear-gradient(90deg, 
            rgba(0, 150, 80, 0.4), 
            rgba(0, 200, 100, 0.4)
          );
        }
        .l-6 { 
          transform: translateZ(-3px); 
          background: linear-gradient(90deg, 
            rgba(0, 200, 100, 0.4), 
            rgba(0, 255, 140, 0.4)
          );
        }
      `}</style>
    </div>
  );
}
