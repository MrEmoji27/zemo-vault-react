'use client';

import React, { useEffect, useRef, useState } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 8;
const AI_CHASE_SPEED = 0.12;
const MAX_SPEED = 10;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const Pong = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef(null);
  const startGameRef = useRef(() => { });
  const particlesRef = useRef([]);

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');

    // Particle system for effects
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1.0;
        this.color = color;
        this.size = Math.random() * 4 + 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life -= 0.02;
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
      }
    }

    const createState = () => ({
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: BALL_RADIUS,
        speedX: Math.random() < 0.5 ? -5 : 5,
        speedY: (Math.random() * 4) - 2 || 2,
        trail: [],
      },
      player: {
        x: 10,
        y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
      },
      ai: {
        x: CANVAS_WIDTH - PADDLE_WIDTH - 10,
        y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
      },
      rallyCount: 0,
      running: false,
    });

    const resetBall = (direction = null) => {
      const { ball } = stateRef.current;
      ball.x = CANVAS_WIDTH / 2;
      ball.y = CANVAS_HEIGHT / 2;
      const dir = direction ?? (Math.random() < 0.5 ? -1 : 1);
      ball.speedX = dir * (4 + Math.random() * 2);
      ball.speedY = (Math.random() * 4) - 2;
      if (Math.abs(ball.speedY) < 1.2) {
        ball.speedY = ball.speedY < 0 ? -1.5 : 1.5;
      }
      ball.trail = [];
      stateRef.current.rallyCount = 0; // Reset rally on score
    };

    const createParticles = (x, y, color, count = 15) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(new Particle(x, y, color));
      }
    };

    const drawRect = (x, y, w, h, color, glow = true) => {
      context.fillStyle = color;
      if (glow) {
        context.shadowBlur = 20;
        context.shadowColor = color;
      }
      context.fillRect(x, y, w, h);
      context.shadowBlur = 0;
    };

    const drawCircle = (x, y, r, color, glow = true) => {
      context.fillStyle = color;
      if (glow) {
        context.shadowBlur = 15;
        context.shadowColor = color;
      }
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
      context.shadowBlur = 0;
    };

    const render = () => {
      const { ball, player, ai } = stateRef.current;

      // Background with glassmorphism (semi-transparent)
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const gradient = context.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(10, 0, 20, 0.5)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Center line
      context.strokeStyle = 'rgba(0, 255, 140, 0.3)';
      context.setLineDash([10, 10]);
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(CANVAS_WIDTH / 2, 0);
      context.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      context.stroke();
      context.setLineDash([]);

      // Draw ball trail
      ball.trail.forEach((pos, i) => {
        const alpha = (i / ball.trail.length) * 0.5;
        context.globalAlpha = alpha;
        drawCircle(pos.x, pos.y, ball.radius * 0.7, '#00ff8c', false);
      });
      context.globalAlpha = 1;

      // Draw paddles with neon effect
      drawRect(player.x, player.y, player.width, player.height, '#00ff8c');
      drawRect(ai.x, ai.y, ai.width, ai.height, '#ff00ff');

      // Draw ball
      drawCircle(ball.x, ball.y, ball.radius, '#00ffff');

      // Draw particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.update();
        p.draw(context);
      });
    };

    const update = () => {
      const state = stateRef.current;
      if (!state.running) return;

      const { ball, player, ai } = state;

      // Update ball trail
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 8) {
        ball.trail.shift();
      }

      ball.x += ball.speedX;
      ball.y += ball.speedY;

      // Wall collision with particles
      if (ball.y + ball.radius > CANVAS_HEIGHT || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
        createParticles(ball.x, ball.y, '#00ffff', 8);
      }

      // Scoring
      if (ball.x - ball.radius < 0) {
        setAiScore(prev => {
          const newScore = prev + 1;
          if (newScore >= 10) {
            setWinner('AI');
            setGameOver(true);
            state.running = false;
            setRunning(false);
          }
          return newScore;
        });
        createParticles(ball.x, ball.y, '#ff00ff', 20);
        resetBall(1);
        render();
        return;
      }

      if (ball.x + ball.radius > CANVAS_WIDTH) {
        setPlayerScore(prev => {
          const newScore = prev + 1;
          if (newScore >= 10) {
            setWinner('Player');
            setGameOver(true);
            state.running = false;
            setRunning(false);
          }
          return newScore;
        });
        createParticles(ball.x, ball.y, '#00ff8c', 20);
        resetBall(-1);
        render();
        return;
      }

      const checkCollision = (paddle) => {
        return (
          ball.x - ball.radius < paddle.x + paddle.width &&
          ball.x + ball.radius > paddle.x &&
          ball.y + ball.radius > paddle.y &&
          ball.y - ball.radius < paddle.y + paddle.height
        );
      };

      // Paddle collisions with progressive acceleration
      if (checkCollision(player)) {
        stateRef.current.rallyCount++;
        const acceleration = 1 + (stateRef.current.rallyCount * 0.02); // 2% increase per hit
        ball.speedX = Math.abs(ball.speedX) * acceleration;
        ball.speedX = Math.min(ball.speedX, MAX_SPEED);
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.speedY = deltaY * 0.25;
        createParticles(ball.x, ball.y, '#00ff8c', 10);
      }

      if (checkCollision(ai)) {
        stateRef.current.rallyCount++;
        const acceleration = 1 + (stateRef.current.rallyCount * 0.02); // 2% increase per hit
        ball.speedX = -Math.abs(ball.speedX) * acceleration;
        ball.speedX = Math.max(ball.speedX, -MAX_SPEED);
        const deltaY = ball.y - (ai.y + ai.height / 2);
        ball.speedY = deltaY * 0.25;
        createParticles(ball.x, ball.y, '#ff00ff', 10);
      }

      // AI movement
      ai.y += (ball.y - (ai.y + ai.height / 2)) * AI_CHASE_SPEED;
      ai.y = clamp(ai.y, 0, CANVAS_HEIGHT - ai.height);

      render();
    };

    const gameLoop = () => {
      update();
      if (stateRef.current.running) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    const startGame = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      const initialState = createState();
      initialState.running = true;
      stateRef.current = initialState;
      setPlayerScore(0);
      setAiScore(0);
      setRunning(true);
      setGameOver(false);
      setWinner('');
      particlesRef.current = [];
      render();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    const stopGame = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (stateRef.current) {
        stateRef.current.running = false;
      }
      setRunning(false);
    };

    const handlePointer = (clientY) => {
      if (!stateRef.current) return;
      const { player } = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleY = CANVAS_HEIGHT / rect.height;
      const relativeY = clientY - rect.top;
      const canvasY = relativeY * scaleY;
      player.y = clamp(canvasY - player.height / 2, 0, CANVAS_HEIGHT - player.height);
    };

    const handleMouseMove = (event) => {
      if (!stateRef.current || !stateRef.current.running) return;
      handlePointer(event.clientY);
    };

    const handleTouchMove = (event) => {
      if (!stateRef.current || !stateRef.current.running) return;
      event.preventDefault();
      if (event.touches && event.touches[0]) {
        handlePointer(event.touches[0].clientY);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    stateRef.current = createState();
    render();

    startGameRef.current = () => {
      if (!stateRef.current) return;
      stateRef.current.running = true;
      startGame();
    };

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      stopGame();
    };
  }, []);

  const handleStart = () => {
    if (startGameRef.current) {
      startGameRef.current();
    }
  };

  return (
    <div className="pong-wrapper">
      <div className="pong-scoreboard">
        <span className="pong-score player-score">Player: {playerScore}</span>
        <button className="control-btn pong-start-btn" onClick={handleStart}>
          {running ? 'Restart' : 'Start Game'}
        </button>
        <span className="pong-score ai-score">AI: {aiScore}</span>
      </div>
      <div className="pong-canvas-container">
        <canvas
          ref={canvasRef}
          className="pong-canvas"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        />
        {gameOver && (
          <div className="pong-game-over">
            <h2>{winner} Wins!</h2>
            <p>First to 10 points!</p>
          </div>
        )}
      </div>
      <p className="pong-help">🖱️ Use mouse or 👆 touch to move your paddle</p>

      <style jsx>{`
        .pong-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
        }

        .pong-scoreboard {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 600px;
          max-width: 100%;
          gap: 2rem;
        }

        .pong-score {
          font-family: 'Roboto Mono', monospace;
          font-size: 1.5rem;
          font-weight: bold;
          text-shadow: 0 0 10px currentColor;
        }

        .player-score {
          color: #00ff8c;
        }

        .ai-score {
          color: #ff00ff;
        }

        .pong-start-btn {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: bold;
          background: linear-gradient(135deg, #00ff8c, #00d4ff);
          color: #000;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 255, 140, 0.4);
        }

        .pong-start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 255, 140, 0.6);
        }

        .pong-canvas-container {
          position: relative;
        }

        .pong-canvas {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.03);
          box-shadow: 
            0 8px 32px 0 rgba(0, 0, 0, 0.3),
            inset 0 0 40px rgba(0, 255, 140, 0.05);
          max-width: 100%;
          height: auto;
        }

        .pong-game-over {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid #00ff8c;
          border-radius: 12px;
          padding: 2rem 3rem;
          text-align: center;
          box-shadow: 0 0 30px rgba(0, 255, 140, 0.5);
          animation: gameOverPulse 1.5s ease-in-out infinite;
        }

        .pong-game-over h2 {
          color: #00ff8c;
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 0 20px #00ff8c;
        }

        .pong-game-over p {
          color: #fff;
          margin: 0;
          font-size: 1.2rem;
        }

        @keyframes gameOverPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }

        .pong-help {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .pong-scoreboard {
            width: 100%;
            flex-direction: column;
            gap: 1rem;
          }

          .pong-score {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Pong;
