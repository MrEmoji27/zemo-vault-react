import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SIZE = 4;
const START_TILES = 2;

function createEmptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function getEmptyTiles(board) {
  const empties = [];
  board.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value === 0) empties.push([r, c]);
    });
  });
  return empties;
}

function placeRandomTile(board, nextIdRef) {
  const empties = getEmptyTiles(board);
  if (!empties.length) return board;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const next = board.map((row) => row.slice());
  next[r][c] = { id: nextIdRef.current++, value };
  return next;
}

function cloneBoard(board) {
  return board.map((row) => row.slice());
}

function slideRowLeft(row) {
  const filtered = row.filter((cell) => cell !== 0);
  const newRow = [];
  const mergedCols = [];
  let score = 0;

  for (let i = 0; i < filtered.length; i++) {
    const cur = filtered[i];
    const nxt = filtered[i + 1];
    if (cur && nxt && cur.value === nxt.value) {
      const value = cur.value * 2;
      // keep the first tile's id so movement animates into the new spot
      newRow.push({ id: cur.id, value });
      mergedCols.push(newRow.length - 1);
      score += value;
      i++;
    } else {
      newRow.push(cur);
    }
  }

  while (newRow.length < SIZE) newRow.push(0);

  return { row: newRow, score, mergedCols };
}

function arraysEqual(a, b) {
  for (let i = 0; i < a.length; i++) {
    const ca = a[i], cb = b[i];
    if (ca === 0 && cb === 0) continue;
    if (!ca || !cb) return false;
    if (ca.value !== cb.value || ca.id !== cb.id) return false;
  }
  return true;
}

function transpose(board) {
  const next = createEmptyBoard();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      next[c][r] = board[r][c];
    }
  }
  return next;
}

function moveLeft(board) {
  const next = [];
  const mergedPositions = [];
  let moved = false;
  let totalScore = 0;

  for (let r = 0; r < SIZE; r++) {
    const { row: newRow, score, mergedCols } = slideRowLeft(board[r]);
    if (!moved && !arraysEqual(newRow, board[r])) moved = true;
    mergedCols.forEach((c) => mergedPositions.push({ r, c }));
    next.push(newRow);
    totalScore += score;
  }

  return { board: next, score: totalScore, moved, mergedPositions };
}

function moveRight(board) {
  const next = [];
  const mergedPositions = [];
  let moved = false;
  let totalScore = 0;

  for (let r = 0; r < SIZE; r++) {
    const reversed = board[r].slice().reverse();
    const { row: newRow, score, mergedCols } = slideRowLeft(reversed);
    const restored = newRow.slice().reverse();
    if (!moved && !arraysEqual(restored, board[r])) moved = true;
    mergedCols.forEach((c) => mergedPositions.push({ r, c: SIZE - 1 - c }));
    next.push(restored);
    totalScore += score;
  }

  return { board: next, score: totalScore, moved, mergedPositions };
}

function moveUp(board) {
  const transposed = transpose(board);
  const result = moveLeft(transposed);
  return {
    board: transpose(result.board),
    score: result.score,
    moved: result.moved,
    mergedPositions: result.mergedPositions.map(({ r, c }) => ({ r: c, c: r })),
  };
}

function moveDown(board) {
  const transposed = transpose(board);
  const result = moveRight(transposed);
  return {
    board: transpose(result.board),
    score: result.score,
    moved: result.moved,
    mergedPositions: result.mergedPositions.map(({ r, c }) => ({ r: c, c: r })),
  };
}

function move(board, direction) {
  switch (direction) {
    case 'left':
      return moveLeft(board);
    case 'right':
      return moveRight(board);
    case 'up':
      return moveUp(board);
    case 'down':
      return moveDown(board);
    default:
      return { board, score: 0, moved: false, mergedPositions: [] };
  }
}

function boardsEqual(a, b) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const ca = a[r][c], cb = b[r][c];
      if (ca === 0 && cb === 0) continue;
      if (!ca || !cb) return false;
      if (ca.value !== cb.value || ca.id !== cb.id) return false;
    }
  }
  return true;
}

function hasMoves(board) {
  if (getEmptyTiles(board).length) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      const v = cell.value;
      if (r + 1 < SIZE && board[r + 1][c] && board[r + 1][c].value === v) return true;
      if (c + 1 < SIZE && board[r][c + 1] && board[r][c + 1].value === v) return true;
    }
  }
  return false;
}

const touchSensitivity = 30;

function Game2048() {
  const nextIdRef = useRef(1);
  const [board, setBoard] = useState(() => {
    let next = createEmptyBoard();
    const initId = { current: 1 };
    for (let i = 0; i < START_TILES; i++) {
      next = placeRandomTile(next, initId);
    }
    nextIdRef.current = initId.current; // continue from used ids
    return next;
  });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    const stored = localStorage.getItem('zemo-2048-best');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [isLost, setIsLost] = useState(false);
  const [mergedCells, setMergedCells] = useState([]);
  const [spawnId, setSpawnId] = useState(null);

  const touchStart = useRef(null);
  const mergeTimeout = useRef(null);

  const updateBest = useCallback((nextScore) => {
    if (nextScore > best) {
      setBest(nextScore);
      localStorage.setItem('zemo-2048-best', String(nextScore));
    }
  }, [best]);

  const resetGame = useCallback(() => {
    let next = createEmptyBoard();
    nextIdRef.current = 1;
    for (let i = 0; i < START_TILES; i++) next = placeRandomTile(next, nextIdRef);
    setBoard(next);
    setScore(0);
    setIsLost(false);
    setMergedCells([]);
  }, []);

  const handleMove = useCallback((direction) => {
    if (isLost) return;
    const { board: movedBoard, score: gained, moved, mergedPositions } = move(board, direction);
    if (!moved || boardsEqual(board, movedBoard)) return;

    if (mergeTimeout.current) clearTimeout(mergeTimeout.current);
    const mergedKeys = mergedPositions.map(({ r, c }) => `${r}-${c}`);
    setMergedCells(mergedKeys);

    // determine spawn id by diffing ids before and after spawn
    const beforeIds = new Set();
    movedBoard.forEach(row => row.forEach(cell => { if (cell) beforeIds.add(cell.id); }));
    const withTile = placeRandomTile(movedBoard, nextIdRef);
    setBoard(withTile);
    let newId = null;
    withTile.forEach(row => row.forEach(cell => { if (cell && !beforeIds.has(cell.id)) newId = cell.id; }));
    if (newId != null) {
      setSpawnId(newId);
      setTimeout(() => setSpawnId(null), 220);
    }
    const nextScore = score + gained;
    setScore(nextScore);
    updateBest(nextScore);
    if (!hasMoves(withTile)) {
      setIsLost(true);
    }

    mergeTimeout.current = setTimeout(() => {
      setMergedCells([]);
    }, 200);
  }, [board, isLost, score, updateBest]);

  useEffect(() => () => {
    if (mergeTimeout.current) clearTimeout(mergeTimeout.current);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handleMove('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleMove('right');
          break;
        case 'ArrowUp':
          event.preventDefault();
          handleMove('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleMove('down');
          break;
        case 'a':
        case 'A':
          event.preventDefault();
          handleMove('left');
          break;
        case 'd':
        case 'D':
          event.preventDefault();
          handleMove('right');
          break;
        case 'w':
        case 'W':
          event.preventDefault();
          handleMove('up');
          break;
        case 's':
        case 'S':
          event.preventDefault();
          handleMove('down');
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleMove]);

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) < touchSensitivity && Math.abs(dy) < touchSensitivity) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      handleMove(dx > 0 ? 'right' : 'left');
    } else {
      handleMove(dy > 0 ? 'down' : 'up');
    }
  };

  const tiles = useMemo(() => {
    const items = [];
    board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          items.push({ key: cell.id, id: cell.id, r, c, value: cell.value });
        }
      });
    });
    return items;
  }, [board]);

  return (
    <div className="game-2048-wrapper">
      <div className="hud">
        <div className="hud-badges">
          <div className="hud-badge hud-green"><span className="hud-label">Score</span><span className="hud-value">{score}</span></div>
          <div className="hud-badge hud-green"><span className="hud-label">Best</span><span className="hud-value">{best}</span></div>
        </div>
      </div>
      <div className="si-controls">
        <button className="si-btn" onClick={resetGame} aria-label="New Game">New Game</button>
      </div>
      <div className="game-stage">
        <div
          className="game-2048-grid"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="game-2048-grid-bg">
            {Array.from({ length: SIZE * SIZE }, (_, idx) => (
              <div key={idx} className="game-2048-cell" />
            ))}
          </div>
          <div className="game-2048-tiles">
            {tiles.map(({ key, id, r, c, value }) => {
              const isMerged = mergedCells.includes(`${r}-${c}`);
              return (
                <div
                  key={key}
                  className={`tile tile-${value}${isMerged ? ' tile-merged' : ''}${spawnId === id ? ' tile-spawn' : ''}`}
                  style={{
                    left: `calc(${c} * 25%)`,
                    top: `calc(${r} * 25%)`
                  }}
                >
                  <div className="tile-inner">{value}</div>
                </div>
              );
            })}
          </div>
        </div>
        {isLost && (
          <div className="game-overlay">
            <div className="overlay-panel">
              <h3 className="overlay-title">Game Over</h3>
              <p className="overlay-sub">Press N for New Game or tap New Game</p>
            </div>
          </div>
        )}
      </div>
      <div className="controls-chip">Arrows/WASD to move • Swipe on mobile • N New Game</div>
    </div>
  );
}

export default Game2048;
