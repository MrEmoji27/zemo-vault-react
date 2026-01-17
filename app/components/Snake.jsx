'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const BOARD_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MAX_SPEED = 60;

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1, axis: 'y' },
  ArrowDown: { x: 0, y: 1, axis: 'y' },
  ArrowLeft: { x: -1, y: 0, axis: 'x' },
  ArrowRight: { x: 1, y: 0, axis: 'x' },
};

function randomCell(exclude) {
  const excludeKeys = new Set(exclude.map(({ x, y }) => `${x}-${y}`));
  while (true) {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    const key = `${x}-${y}`;
    if (!excludeKeys.has(key)) return { x, y };
  }
}

function Snake() {
  const [snake, setSnake] = useState(() => [{ x: 10, y: 10 }]);
  const [food, setFood] = useState(() => randomCell([{ x: 10, y: 10 }]));
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    const stored = localStorage.getItem('zemo-snake-best');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  /* Input buffering to prevent quick-turn suicide */
  const moveQueue = useRef([]);
  const loopRef = useRef(null);
  const boardRef = useRef(null);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(randomCell([{ x: 10, y: 10 }]));
    setDirection(DIRECTIONS.ArrowRight);
    moveQueue.current = [];
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsRunning(true);
    setIsGameOver(false);
  }, []);

  const handleDirectionChange = useCallback((key) => {
    if (!DIRECTIONS[key]) return;
    moveQueue.current.push(DIRECTIONS[key]);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      // Prevent scrolling with arrows/space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }

      if (event.key === 'p' || event.key === 'P') {
        if (isGameOver) return;
        setIsRunning(prev => !prev);
        return;
      }

      if (!isRunning) {
        if (event.key === ' ') {
          resetGame();
        }
        return;
      }

      handleDirectionChange(event.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDirectionChange, isRunning, resetGame, isGameOver]);

  const moveSnake = useCallback(() => {
    setSnake((prev) => {
      const current = prev;
      const head = current[0];

      // Process next valid move from queue
      let nextDir = direction;
      while (moveQueue.current.length > 0) {
        const candidate = moveQueue.current.shift();
        if (candidate.axis !== direction.axis) {
          nextDir = candidate;
          setDirection(nextDir); // Update state for next frame
          break;
        }
      }

      const newHead = { x: head.x + nextDir.x, y: head.y + nextDir.y };

      // Collision checks (Walls + Self)
      if (
        newHead.x < 0 || newHead.x >= BOARD_SIZE ||
        newHead.y < 0 || newHead.y >= BOARD_SIZE ||
        current.some(({ x, y }) => x === newHead.x && y === newHead.y)
      ) {
        setIsRunning(false);
        setIsGameOver(true);
        if (score > best) {
          setBest(score);
          localStorage.setItem('zemo-snake-best', String(score));
        }
        return current;
      }

      const hasEaten = newHead.x === food.x && newHead.y === food.y;
      const nextSnake = [newHead, ...current];
      if (!hasEaten) nextSnake.pop();

      if (hasEaten) {
        setScore((s) => s + 10);
        setFood(randomCell(nextSnake));
        setSpeed((prevSpeed) => Math.max(MAX_SPEED, prevSpeed - SPEED_INCREMENT));
      }

      return nextSnake;
    });
  }, [best, direction, food, score]);

  useEffect(() => {
    if (!isRunning) {
      if (loopRef.current) clearInterval(loopRef.current);
      return;
    }
    loopRef.current = setInterval(moveSnake, speed);
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [isRunning, speed, moveSnake]);

  useEffect(() => () => {
    if (loopRef.current) clearInterval(loopRef.current);
  }, []);

  const boardCells = useMemo(() => {
    const cells = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        cells.push({ x, y, key: `${x}-${y}` });
      }
    }
    return cells;
  }, []);

  return (
    <div className="snake-wrapper">
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className="retro-text">SCORE: {score}</div>
        <div className="retro-text">BEST: {best}</div>
        <button className="control-btn" onClick={resetGame}>
          {isRunning ? 'RESTART' : 'START'}
        </button>
      </div>

      <div className="game-container-outer">
        <div className="snake-board" ref={boardRef}>
          <div className="scanlines"></div>
          {boardCells.map(({ x, y, key }) => {
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const bodyIndex = snake.slice(1).findIndex((segment) => segment.x === x && segment.y === y);
            const isBody = bodyIndex !== -1;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={key}
                className={`snake-cell${isBody ? ' snake-body' : ''}${isHead ? ' snake-head' : ''}${isFood ? ' snake-food' : ''}`}
              />
            );
          })}
        </div>
        {isGameOver && (
          <div className="game-over-overlay">
            <h2 className="retro-header blink">GAME OVER</h2>
            <p className="retro-text">PRESS SPACE</p>
          </div>
        )}
      </div>

      <p className="retro-text small mt-4">ARROWS TO MOVE • P TO PAUSE</p>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .snake-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          font-family: 'Press Start 2P', monospace;
        }

        .game-container-outer {
          position: relative;
          padding: 6px;
          background: rgba(43, 43, 43, 0.4); /* Semi-transparent casing */
          border-radius: 4px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 
            0 10px 32px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.1);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .snake-board {
          display: grid;
          position: relative;
          grid-template-columns: repeat(${BOARD_SIZE}, 1fr);
          grid-template-rows: repeat(${BOARD_SIZE}, 1fr);
          width: min(500px, 90vw);
          aspect-ratio: 1;
          background-color: rgba(13, 18, 13, 0.85); /* Semi-transparent CRT dark */
          border: 4px solid rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(4px); /* Inner CRT blur */
          box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
          overflow: hidden;
        }

        .scanlines {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0,0,0,0.1) 50%,
            rgba(0,0,0,0.1)
          );
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 10;
          opacity: 0.6;
        }

        .snake-cell {
          width: 100%;
          height: 100%;
          border: 1px solid rgba(40, 60, 40, 0.1); /* Very faint grid */
          box-sizing: border-box;
        }

        .snake-head {
          background-color: #4aff4a;
          box-shadow: 0 0 5px #4aff4a;
          z-index: 2;
        }

        .snake-body {
          background-color: #00aa00;
          border: 1px solid #004400; /* Distinct segments */
        }

        .snake-food {
          background-color: #ff3333;
          box-shadow: 0 0 5px #ff3333;
          animation: blink 0.5s steps(2, start) infinite;
        }

        .game-over-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 20;
          background: rgba(0, 0, 0, 0.85);
          padding: 20px;
          border: 4px solid #4aff4a;
          box-shadow: 8px 8px 0 rgba(0,0,0,0.5);
        }

        .retro-text {
          color: #4aff4a;
          text-shadow: 2px 2px 0 #004400;
          font-size: 1rem;
          margin: 0;
          letter-spacing: 1px;
        }

        .retro-header {
          color: #ff3333;
          text-shadow: 3px 3px 0 #440000;
          font-size: 2rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .small {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .control-btn {
          padding: 0.8rem 1.2rem;
          background: #111;
          border: 3px solid #4aff4a;
          color: #4aff4a;
          font-family: 'Press Start 2P', monospace;
          font-size: 0.8rem;
          cursor: pointer;
          box-shadow: 4px 4px 0 #004400;
          transition: transform 0.1s;
        }

        .control-btn:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #004400;
        }

        .blink {
          animation: blink 0.8s steps(2, start) infinite;
        }

        @keyframes blink {
          to { visibility: hidden; }
        }

        @media (max-width: 600px) {
          .snake-board {
            border-width: 2px;
          }
          .retro-header {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Snake;
