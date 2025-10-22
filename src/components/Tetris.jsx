import React, { useEffect, useMemo, useReducer, useRef } from 'react';

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 24; // matches canvas 240x480
const LINE_SCORES = [0, 100, 300, 500, 800];

const TETROMINOES = [
  { name: 'I', color: '#07f5ff', shape: [[1, 1, 1, 1]] },
  { name: 'J', color: '#2680ff', shape: [[1, 0, 0], [1, 1, 1]] },
  { name: 'L', color: '#ff9100', shape: [[0, 0, 1], [1, 1, 1]] },
  { name: 'O', color: '#ffe600', shape: [[1, 1], [1, 1]] },
  { name: 'S', color: '#00e676', shape: [[0, 1, 1], [1, 1, 0]] },
  { name: 'T', color: '#b933ff', shape: [[0, 1, 0], [1, 1, 1]] },
  { name: 'Z', color: '#ff3b57', shape: [[1, 1, 0], [0, 1, 1]] },
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
  return Math.max(1000 - (level - 1) * 80, 120);
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
  const scoreAdd = LINE_SCORES[linesCleared] + 10;
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
      const kicks = [0, -1, 1, -2, 2];
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

  // Key controls
  useEffect(() => {
    const handleKey = (event) => {
      const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      const preventKeys = new Set([...arrowKeys, ' ']);

      if (event.repeat) {
        if (preventKeys.has(event.key)) event.preventDefault();
        return;
      }

      if (event.key === 'Enter' && (state.gameOver || !state.running)) {
        event.preventDefault();
        dispatch({ type: 'START' });
        return;
      }

      if (!state.piece) {
        if (preventKeys.has(event.key)) event.preventDefault();
        return;
      }
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          dispatch({ type: 'MOVE', direction: 'left' });
          break;
        case 'ArrowRight':
          event.preventDefault();
          dispatch({ type: 'MOVE', direction: 'right' });
          break;
        case 'ArrowDown':
          event.preventDefault();
          dispatch({ type: 'MOVE', direction: 'down' });
          break;
        case 'ArrowUp':
          event.preventDefault();
          dispatch({ type: 'ROTATE' });
          break;
        case ' ': // Space hard drop
          event.preventDefault();
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
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

    const drawCell = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    };

    // Draw settled board
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = state.board[r][c];
        if (cell) {
          drawCell(c, r, cell);
        } else {
          ctx.strokeStyle = 'rgba(0, 255, 140, 0.08)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }

    // Draw active piece
    const piece = state.piece;
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
  }, [state.board, state.piece]);

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
        if (shape[r][c]) grid[offsetRow + r][offsetCol + c] = true;
      }
    }
    return grid;
  }, [state.nextPiece]);

  return (
    <div className="tetris-wrapper">
      <div className="flex justify-center items-center gap-4 mb-4">
        <button className="control-btn" onClick={() => dispatch({ type: 'START' })}>
          {state.running ? 'Restart' : state.gameOver ? 'Restart' : 'Start'}
        </button>
        <button className="control-btn" onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })} disabled={state.gameOver || !state.piece}>
          {state.running ? 'Pause' : 'Resume'}
        </button>
      </div>
      <div className="tetris-layout">
        <canvas ref={canvasRef} width={COLS * BLOCK_SIZE} height={ROWS * BLOCK_SIZE} className="tetris-canvas" />
        <div className="tetris-info">
          <div className="tetris-panel">
            <h4 className="panel-title">Stats</h4>
            <p>Score: {state.score}</p>
            <p>Lines: {state.lines}</p>
            <p>Level: {state.level}</p>
          </div>
          <div className="tetris-panel">
            <h4 className="panel-title">Next</h4>
            <div className="next-piece-grid">
              {nextPreview.map((row, rIdx) => (
                <div key={rIdx} className="next-row">
                  {row.map((filled, cIdx) => (
                    <div key={cIdx} className={`next-cell${filled ? ' filled' : ''}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="tetris-help">
            <p>Controls:</p>
            <p>Arrow Keys — move / rotate / soft drop</p>
            <p>Space — hard drop</p>
            <p>P — pause</p>
            <p>Enter — start / restart</p>
          </div>
          {state.gameOver && (
            <p className="text-green mt-4">Game Over. Press Enter or Restart.</p>
          )}
          {!state.running && !state.gameOver && !state.piece && (
            <p className="text-green mt-4">Press Start or Enter to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tetris;
