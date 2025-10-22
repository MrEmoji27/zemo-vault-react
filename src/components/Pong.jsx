import React, { useEffect, useRef, useState } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 7;
const AI_CHASE_SPEED = 0.1;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const Pong = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef(null);
  const startGameRef = useRef(() => {});

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');

    const createState = () => ({
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: BALL_RADIUS,
        speedX: Math.random() < 0.5 ? -5 : 5,
        speedY: (Math.random() * 4) - 2 || 2,
      },
      player: {
        x: 0,
        y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
      },
      ai: {
        x: CANVAS_WIDTH - PADDLE_WIDTH,
        y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
      },
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
    };

    const drawRect = (x, y, w, h, color) => {
      context.fillStyle = color;
      context.fillRect(x, y, w, h);
    };

    const drawCircle = (x, y, r, color) => {
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
    };

    const render = () => {
      const { ball, player, ai } = stateRef.current;
      drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 'rgba(0,0,0,0.85)');

      context.strokeStyle = 'rgba(0, 255, 140, 0.4)';
      context.setLineDash([10, 10]);
      context.beginPath();
      context.moveTo(CANVAS_WIDTH / 2, 0);
      context.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      context.stroke();
      context.setLineDash([]);

      drawRect(player.x, player.y, player.width, player.height, '#00ff8c');
      drawRect(ai.x, ai.y, ai.width, ai.height, '#00ff8c');
      drawCircle(ball.x, ball.y, ball.radius, '#00ff8c');
    };

    const update = () => {
      const state = stateRef.current;
      if (!state.running) return;

      const { ball, player, ai } = state;

      ball.x += ball.speedX;
      ball.y += ball.speedY;

      if (ball.y + ball.radius > CANVAS_HEIGHT || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
      }

      if (ball.x - ball.radius < 0) {
        setAiScore(prev => prev + 1);
        resetBall(1);
        render();
        return;
      }

      if (ball.x + ball.radius > CANVAS_WIDTH) {
        setPlayerScore(prev => prev + 1);
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

      if (checkCollision(player)) {
        ball.speedX = Math.abs(ball.speedX);
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.speedY = deltaY * 0.25;
      }

      if (checkCollision(ai)) {
        ball.speedX = -Math.abs(ball.speedX);
        const deltaY = ball.y - (ai.y + ai.height / 2);
        ball.speedY = deltaY * 0.25;
      }

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
      render();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    const stopGame = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      stateRef.current.running = false;
      setRunning(false);
    };

    const handlePointer = (clientY) => {
      const { player } = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      player.y = clamp(clientY - rect.top - player.height / 2, 0, CANVAS_HEIGHT - player.height);
    };

    const handleMouseMove = (event) => {
      if (!stateRef.current.running) return;
      handlePointer(event.clientY);
    };

    const handleTouchMove = (event) => {
      if (!stateRef.current.running) return;
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
        <span className="pong-score">Player: {playerScore}</span>
        <button className="control-btn" onClick={handleStart}>
          {running ? 'Restart' : 'Start Game'}
        </button>
        <span className="pong-score">AI: {aiScore}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="pong-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
      <p className="pong-help">Use mouse or touch to move</p>
    </div>
  );
};

export default Pong;
