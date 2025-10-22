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
  const [pendingDirection, setPendingDirection] = useState(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    const stored = localStorage.getItem('zemo-snake-best');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const loopRef = useRef(null);
  const boardRef = useRef(null);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(randomCell([{ x: 10, y: 10 }]));
    setDirection(DIRECTIONS.ArrowRight);
    setPendingDirection(null);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsRunning(true);
    setIsGameOver(false);
  }, []);

  const handleDirectionChange = useCallback((key) => {
    if (!DIRECTIONS[key]) return;
    const nextDir = DIRECTIONS[key];
    if (nextDir.axis === direction.axis) return; // prevent reversing axis
    setPendingDirection(nextDir);
  }, [direction]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isRunning && event.key === ' ') {
        resetGame();
        return;
      }
      if (!isRunning) return;
      handleDirectionChange(event.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDirectionChange, isRunning, resetGame]);

  const moveSnake = useCallback(() => {
    setSnake((prev) => {
      const current = prev;
      const head = current[0];
      const dir = pendingDirection || direction;
      const newHead = { x: head.x + dir.x, y: head.y + dir.y };

      // Collision checks
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

      setDirection(dir);
      setPendingDirection(null);
      return nextSnake;
    });
  }, [best, direction, food, pendingDirection, score]);

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
        <div className="text-green">Score: {score}</div>
        <div className="text-green">Best: {best}</div>
        <button className="control-btn" onClick={resetGame}>
          {isRunning ? 'Restart' : 'Start'}
        </button>
      </div>
      <div className="snake-board" ref={boardRef}>
        {boardCells.map(({ x, y, key }) => {
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isBody = snake.slice(1).some((segment) => segment.x === x && segment.y === y);
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
        <div className="text-center text-green mt-4">
          Game Over. Press space or Start to play again.
        </div>
      )}
      <p className="text-center text-green mt-4">Use arrow keys to control the snake</p>
    </div>
  );
}

export default Snake;
