import React, { useState, useEffect, useRef, useMemo } from 'react';

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every((cell) => cell);
}

function minimax(board, isMaximizing) {
  const winner = calculateWinner(board);
  if (winner === 'X') return 1;
  if (winner === 'O') return -1;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = 'X';
        const score = minimax(board, false);
        board[i] = null;
        bestScore = Math.max(bestScore, score);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const score = minimax(board, true);
        board[i] = null;
        bestScore = Math.min(bestScore, score);
      }
    }
    return bestScore;
  }
}

function findBestMove(board) {
  let bestScore = Infinity;
  let move = null;
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, true);
      board[i] = null;
      if (score < bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [vsComputer, setVsComputer] = useState(true);
  const aiTimeout = useRef(null);

  const winner = calculateWinner(board);

  function handleClick(index) {
    if (winner || board[index]) return;
    if (vsComputer && !xIsNext) return;
    setBoard((prev) => {
      if (prev[index]) return prev;
      const next = prev.slice();
      next[index] = xIsNext ? 'X' : 'O';
      return next;
    });
    setXIsNext((prev) => !prev);
  }

  function restart() {
    if (aiTimeout.current) {
      clearTimeout(aiTimeout.current);
      aiTimeout.current = null;
    }
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  }

  useEffect(() => {
    if (!vsComputer || winner || xIsNext || isBoardFull(board)) return;

    if (aiTimeout.current) clearTimeout(aiTimeout.current);

    const currentBoard = board.slice();
    const move = findBestMove(currentBoard);
    if (move === null) return;

    aiTimeout.current = setTimeout(() => {
      setBoard((prev) => {
        if (calculateWinner(prev) || isBoardFull(prev) || prev[move]) return prev;
        const next = prev.slice();
        next[move] = 'O';
        return next;
      });
      setXIsNext(true);
    }, 300);

    return () => {
      if (aiTimeout.current) {
        clearTimeout(aiTimeout.current);
        aiTimeout.current = null;
      }
    };
  }, [vsComputer, xIsNext, winner, board]);

  const status = useMemo(() => {
    if (winner) return `${winner} wins`;
    if (isBoardFull(board)) return 'Draw';
    if (vsComputer) return xIsNext ? 'Your move (X)' : 'Computer is thinking…';
    return `Turn: ${xIsNext ? 'X' : 'O'}`;
  }, [winner, board, vsComputer, xIsNext]);

  return (
    <div className="game-container active" id="tic-tac-toe-container">
      <h3 className="game-title">Tic-Tac-Toe</h3>
      <div className="flex justify-center items-center gap-4 mb-4">
        <button className="control-btn" onClick={() => { setVsComputer((p) => !p); restart(); }}>
          Mode: {vsComputer ? 'Player vs Computer' : 'Player vs Player'}
        </button>
        <button className="control-btn" onClick={restart}>Restart</button>
      </div>
      <div className="ttt-board" id="tic-tac-toe-board">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i}
            className={`ttt-cell ${board[i] === 'O' ? 'ai-mark' : board[i] === 'X' ? 'player-mark' : ''}`}
            onClick={() => handleClick(i)}
          >
            {board[i]}
          </button>
        ))}
      </div>
      <p className="text-center text-green mt-4" id="tic-tac-toe-status">
        {status}
      </p>
    </div>
  );
}
