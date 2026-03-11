'use client';

import React, { useEffect, useMemo, useReducer, useRef } from 'react';

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 28; // Fits well within typical heights (28*20 = 560px)
const LINE_SCORES = [0, 100, 300, 500, 800];

// Neon Palette
const TETROMINOES = [
  { name: 'I', color: '#00ffff', shape: [[1, 1, 1, 1]] },         // Cyan
  { name: 'J', color: '#0055ff', shape: [[1, 0, 0], [1, 1, 1]] }, // Blue
  { name: 'L', color: '#ffaa00', shape: [[0, 0, 1], [1, 1, 1]] }, // Orange
  { name: 'O', color: '#ffff00', shape: [[1, 1], [1, 1]] },       // Yellow
  { name: 'S', color: '#00ff00', shape: [[0, 1, 1], [1, 1, 0]] }, // Green
  { name: 'T', color: '#aa00ff', shape: [[0, 1, 0], [1, 1, 1]] }, // Purple
  { name: 'Z', color: '#ff0055', shape: [[1, 1, 0], [0, 1, 1]] }, // Red
];

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function cloneShape(shape) {
  return shape.map((row) => row.slice());
}

function randomPiece() {
  const def = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  return { name: def.name, color: def.color, shape: cloneShape(def.shape) };
}

function preparePiece(piece) {
  if (!piece) return null;
  const shape = cloneShape(piece.shape);
  return {
    name: piece.name,
    color: piece.color,
    shape,
    row: 0,
    col: Math.floor((COLS - shape[0].length) / 2),
  };
}

function isValidPosition(shape, row, col, board) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const newRow = row + r;
      const newCol = col + c;
      if (newCol < 0 || newCol >= COLS || newRow >= ROWS) return false;
      if (newRow < 0) continue;
      if (board[newRow][newCol]) return false;
    }
  }
  return true;
}

function placePiece(board, piece) {
  const newBoard = board.map((row) => row.slice());
  piece.shape.forEach((row, rIdx) => {
    row.forEach((value, cIdx) => {
      if (!value) return;
      const y = piece.row + rIdx;
      const x = piece.col + cIdx;
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        newBoard[y][x] = piece.color;
      }
    });
  });
  return newBoard;
}

function clearLines(board) {
  let linesCleared = 0;
  const filtered = [];
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every((cell) => cell)) {
      linesCleared++;
    } else {
      filtered.push(board[r]);
    }
  }
  while (filtered.length < ROWS) {
    filtered.unshift(Array(COLS).fill(null));
  }
  return { board: filtered, linesCleared };
}

function rotateShape(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
}

function calcSpeed(level) {
  return Math.max(1000 - (level - 1) * 80, 100);
}

const initialState = {
  board: createEmptyBoard(),
  piece: null,
  nextPiece: randomPiece(),
  running: false,
  gameOver: false,
  score: 0,
  lines: 0,
  level: 1,
};

function lockPiece(state) {
  const mergedBoard = placePiece(state.board, state.piece);
  const { board: clearedBoard, linesCleared } = clearLines(mergedBoard);
  const totalLines = state.lines + linesCleared;
  const level = Math.floor(totalLines / 10) + 1;
  const scoreAdd = LINE_SCORES[linesCleared] * level; // Original NES scoring uses level multiplier
  const nextPieceSeed = state.nextPiece || randomPiece();
  const newPiece = preparePiece(nextPieceSeed);
  const upcoming = randomPiece();
  const gameOver = !isValidPosition(newPiece.shape, newPiece.row, newPiece.col, clearedBoard);
  return {
    ...state,
    board: clearedBoard,
    piece: gameOver ? null : newPiece,
    nextPiece: upcoming,
    running: gameOver ? false : state.running,
    gameOver,
    score: state.score + scoreAdd,
    lines: totalLines,
    level,
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'START': {
      const freshBoard = createEmptyBoard();
      const firstSeed = state.nextPiece || randomPiece();
      const piece = preparePiece(firstSeed);
      const nextSeed = randomPiece();
      const gameOver = !isValidPosition(piece.shape, piece.row, piece.col, freshBoard);
      return {
        board: freshBoard,
        piece: gameOver ? null : piece,
        nextPiece: nextSeed,
        running: !gameOver,
        gameOver,
        score: 0,
        lines: 0,
        level: 1,
      };
    }
    case 'TOGGLE_PAUSE': {
      if (state.gameOver || !state.piece) return state;
      return { ...state, running: !state.running };
    }
    case 'TICK': {
      if (!state.running || state.gameOver || !state.piece) return state;
      const nextRow = state.piece.row + 1;
      if (isValidPosition(state.piece.shape, nextRow, state.piece.col, state.board)) {
        return { ...state, piece: { ...state.piece, row: nextRow } };
      }
      return lockPiece(state);
    }
    case 'MOVE': {
      if (!state.running || state.gameOver || !state.piece) return state;
      const dir = action.direction;
      if (dir === 'left' || dir === 'right') {
        const delta = dir === 'left' ? -1 : 1;
        const newCol = state.piece.col + delta;
        if (isValidPosition(state.piece.shape, state.piece.row, newCol, state.board)) {
          return { ...state, piece: { ...state.piece, col: newCol } };
        }
        return state;
      }
      if (dir === 'down') {
        const newRow = state.piece.row + 1;
        if (isValidPosition(state.piece.shape, newRow, state.piece.col, state.board)) {
          return { ...state, piece: { ...state.piece, row: newRow }, score: state.score + 1 };
        }
        return lockPiece(state);
      }
      return state;
    }
    case 'ROTATE': {
      if (!state.running || state.gameOver || !state.piece) return state;
      const rotated = rotateShape(state.piece.shape);
      const kicks = [0, -1, 1, -2, 2]; // Basic SRS kicks
      for (const offset of kicks) {
        const newCol = state.piece.col + offset;
        if (isValidPosition(rotated, state.piece.row, newCol, state.board)) {
          return { ...state, piece: { ...state.piece, shape: rotated, col: newCol } };
        }
      }
      return state;
    }
    case 'HARD_DROP': {
      if (!state.running || state.gameOver || !state.piece) return state;
      let dropDistance = 0;
      let row = state.piece.row;
      while (isValidPosition(state.piece.shape, row + 1, state.piece.col, state.board)) {
        row += 1;
        dropDistance += 1;
      }
      const lockedState = lockPiece({ ...state, piece: { ...state.piece, row } });
      return { ...lockedState, score: lockedState.score + dropDistance * 2 };
    }
    default:
      return state;
  }
}

function Tetris() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const canvasRef = useRef(null);
  const dropLoop = useRef(null);

  // Manage drop speed
  useEffect(() => {
    if (!state.running || state.gameOver || !state.piece) {
      if (dropLoop.current) {
        clearInterval(dropLoop.current);
        dropLoop.current = null;
      }
      return;
    }
    const interval = calcSpeed(state.level);
    dropLoop.current = setInterval(() => dispatch({ type: 'TICK' }), interval);
    return () => {
      if (dropLoop.current) {
        clearInterval(dropLoop.current);
        dropLoop.current = null;
      }
    };
  }, [state.running, state.gameOver, state.level, state.piece]);

  // Swipe gesture support for mobile
  const touchStartRef = useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  };
  const onTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;
    // Tap = hard drop
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && elapsed < 300) {
      dispatch({ type: 'HARD_DROP' });
      return;
    }
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      dispatch({ type: 'MOVE', direction: dx > 0 ? 'right' : 'left' });
    } else {
      if (dy > 0) dispatch({ type: 'MOVE', direction: 'down' });
      else dispatch({ type: 'ROTATE' });
    }
  };

  // Key controls
  useEffect(() => {
    const handleKey = (event) => {
      const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      const preventKeys = new Set([...arrowKeys, ' ', 'Enter']);

      // Prevent scrolling
      if (preventKeys.has(event.key)) {
        event.preventDefault();
      }

      if (event.repeat && event.key !== 'ArrowDown') return; // Allow holding down for speed

      if (event.key === 'Enter') {
        if (state.gameOver || !state.running) {
          dispatch({ type: 'START' });
        }
        return;
      }

      if (!state.piece || state.gameOver) return;

      switch (event.key) {
        case 'ArrowLeft':
          dispatch({ type: 'MOVE', direction: 'left' });
          break;
        case 'ArrowRight':
          dispatch({ type: 'MOVE', direction: 'right' });
          break;
        case 'ArrowDown':
          dispatch({ type: 'MOVE', direction: 'down' });
          break;
        case 'ArrowUp':
          dispatch({ type: 'ROTATE' });
          break;
        case ' ':
          dispatch({ type: 'HARD_DROP' });
          break;
        case 'p':
        case 'P':
          dispatch({ type: 'TOGGLE_PAUSE' });
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.gameOver, state.running, state.piece]);

  // Draw board to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = COLS * BLOCK_SIZE;
    const height = ROWS * BLOCK_SIZE;

    // Clear & Background
    ctx.clearRect(0, 0, width, height);

    // Subtle Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += BLOCK_SIZE) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += BLOCK_SIZE) {
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    const drawCell = (x, y, color, isGhost = false) => {
      if (isGhost) {
        ctx.fillStyle = 'transparent';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.fillStyle = color;
        ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
        ctx.globalAlpha = 1.0;
        return;
      }

      // Neon Block
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
      ctx.shadowBlur = 0;

      // Glass sheen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, (BLOCK_SIZE - 2) / 2);
    };

    // Draw settled board
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = state.board[r][c];
        if (cell) {
          drawCell(c, r, cell);
        }
      }
    }

    // Draw Ghost Piece
    const piece = state.piece;
    if (piece && !state.gameOver) {
      let ghostRow = piece.row;
      while (isValidPosition(piece.shape, ghostRow + 1, piece.col, state.board)) {
        ghostRow++;
      }
      piece.shape.forEach((row, rIdx) => {
        row.forEach((value, cIdx) => {
          if (!value) return;
          const x = piece.col + cIdx;
          const y = ghostRow + rIdx;
          if (y >= 0) drawCell(x, y, piece.color, true);
        });
      });
    }

    // Draw active piece
    if (piece) {
      piece.shape.forEach((row, rIdx) => {
        row.forEach((value, cIdx) => {
          if (!value) return;
          const x = piece.col + cIdx;
          const y = piece.row + rIdx;
          if (y >= 0) drawCell(x, y, piece.color);
        });
      });
    }
  }, [state.board, state.piece, state.gameOver]);

  const nextPreview = useMemo(() => {
    const seed = state.nextPiece;
    if (!seed) return [];
    const shape = seed.shape;
    const rows = shape.length;
    const cols = shape[0].length;
    const size = 4;
    const grid = Array.from({ length: size }, () => Array(size).fill(false));
    const offsetRow = Math.floor((size - rows) / 2);
    const offsetCol = Math.floor((size - cols) / 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (shape[r][c]) grid[offsetRow + r][offsetCol + c] = seed.color;
      }
    }
    return grid;
  }, [state.nextPiece]);

  return (
    <div className="tetris-wrapper">
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className="score-badge">SCORE: {state.score}</div>
        <div className="score-badge">LEVEL: {state.level}</div>
        <button className="control-btn" onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })} disabled={state.gameOver || !state.piece}>
          {state.running ? 'PAUSE' : 'RESUME'}
        </button>
      </div>

      <div className="tetris-layout">
        <canvas
          ref={canvasRef}
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
          className="tetris-canvas"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'none' }}
        />

        <div className="tetris-info">
          <div className="tetris-panel">
            <h4 className="panel-title">NEXT</h4>
            <div className="next-piece-grid">
              {nextPreview.map((row, rIdx) => (
                <div key={rIdx} className="next-row">
                  {row.map((color, cIdx) => (
                    <div
                      key={cIdx}
                      className="next-cell"
                      style={{
                        backgroundColor: color || 'transparent',
                        boxShadow: color ? `0 0 8px ${color}` : 'none'
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="tetris-panel tight">
            <div className="stat-row">LINES <span>{state.lines}</span></div>
          </div>

          <div className="tetris-help">
            <p>ARROWS / SWIPE to Move</p>
            <p>UP / SWIPE UP Rotate</p>
            <p>SPACE / TAP Hard Drop</p>
            <p>P to Pause</p>
          </div>

          {state.gameOver && (
            <div className="game-over-display">
              <h2>GAME OVER</h2>
              <button className="restart-btn" onClick={() => dispatch({ type: 'START' })}>TRY AGAIN</button>
            </div>
          )}
          {!state.running && !state.gameOver && !state.piece && (
            <div className="game-over-display start-screen">
              <h2>TETRIS</h2>
              <button className="restart-btn" onClick={() => dispatch({ type: 'START' })}>START GAME</button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .tetris-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          font-family: 'Press Start 2P', cursive;
          color: #fff;
        }

        .tetris-layout {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .tetris-canvas {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.1);
        }

        .tetris-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
          width: 160px;
        }

        .tetris-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(5px);
          padding: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          text-align: center;
        }

        .panel-title {
          font-size: 0.8rem;
          color: #aaa;
          margin-bottom: 10px;
          letter-spacing: 1px;
        }

        .next-piece-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(0,0,0,0.3);
          padding: 10px;
          border-radius: 4px;
        }

        .next-row {
          display: flex;
        }

        .next-cell {
          width: 20px;
          height: 20px;
          margin: 1px;
          border-radius: 2px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
        }

        .stat-row span {
          color: #0ff;
        }

        .score-badge {
          background: #2b2b2b;
          border: 2px solid #333;
          padding: 8px 12px;
          font-size: 0.8rem;
          color: #0ff;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
        }

        .control-btn {
          background: transparent;
          border: 2px solid #555;
          color: #aaa;
          padding: 8px 12px;
          font-size: 0.7rem;
          cursor: pointer;
          font-family: inherit;
        }
        .control-btn:hover:not(:disabled) {
          border-color: #fff;
          color: #fff;
        }

        .restart-btn {
           background: #0ff;
           color: #000;
           border: none;
           padding: 10px 20px;
           font-family: inherit;
           cursor: pointer;
           margin-top: 10px;
           animation: pulse 1s infinite;
        }

        .tetris-help {
          font-size: 0.5rem;
          color: #666;
          line-height: 1.5;
        }

        .game-over-display {
           margin-top: 10px;
           text-align: center;
        }
        .game-over-display h2 {
           color: #f0f;
           font-size: 1rem;
           margin-bottom: 1rem;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0); }
        }

        @media (max-width: 600px) {
           .tetris-layout {
              flex-direction: column;
              align-items: center;
           }
           .tetris-info {
              flex-direction: row;
              flex-wrap: wrap;
              width: 100%;
              justify-content: center;
           }
        }
      `}</style>
    </div>
  );
}

export default Tetris;
