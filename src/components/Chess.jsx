import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';

const PIECE_UNICODE = {
  white: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  black: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const SELECTED_STYLE = {
  boxShadow: 'inset 0 0 20px rgba(255, 215, 0, 0.85)',
  border: '2px solid rgba(255, 215, 0, 0.7)',
};

const LEGAL_STYLE = {
  boxShadow: 'inset 0 0 16px rgba(0, 255, 140, 0.8)',
  border: '2px solid rgba(0, 255, 140, 0.6)',
};

const CAPTURE_STYLE = {
  boxShadow: 'inset 0 0 20px rgba(155, 93, 229, 0.8)',
  border: '2px solid rgba(155, 93, 229, 0.65)',
};

const evaluateBoard = (game) => {
  let total = 0;
  const board = game.board();
  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      let value = PIECE_VALUES[piece.type];
      // Add positional bonuses
      if (piece.type === 'p') value += piece.color === 'w' ? (7 - piece.square.charCodeAt(1) + '1'.charCodeAt(0)) * 10 : (piece.square.charCodeAt(1) - '1'.charCodeAt(0)) * 10;
      if (piece.type === 'k') value += piece.color === 'w' ? (piece.square.charCodeAt(0) - 'd'.charCodeAt(0)) * 5 : (piece.square.charCodeAt(0) - 'd'.charCodeAt(0)) * -5;
      total += piece.color === 'w' ? value : -value;
    }
  }
  return total;
};

const isQuiet = (game) => {
  const moves = game.moves({ verbose: true });
  return !moves.some(move => move.captured || game.inCheck());
};

const minimax = (game, depth, alpha, beta, maximizingPlayer, isQuiescence = false) => {
  if (depth === 0) {
    if (isQuiescence && !isQuiet(game)) {
      return minimax(game, 1, alpha, beta, maximizingPlayer, true);
    }
    return evaluateBoard(game);
  }

  if (game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, false, isQuiescence);
      game.undo();
      if (evaluation > maxEval) {
        maxEval = evaluation;
      }
      if (evaluation > alpha) {
        alpha = evaluation;
      }
      if (beta <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const move of moves) {
    game.move(move);
    const evaluation = minimax(game, depth - 1, alpha, beta, true, isQuiescence);
    game.undo();
    if (evaluation < minEval) {
      minEval = evaluation;
    }
    if (evaluation < beta) {
      beta = evaluation;
    }
    if (beta <= alpha) break;
  }
  return minEval;
};

const findBestMoveForBlack = (game, depth) => {
  if (game.isGameOver()) return null;
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestValue = Infinity;

  for (const move of moves) {
    game.move(move);
    const boardValue = minimax(game, depth - 1, -Infinity, Infinity, true);
    game.undo();
    if (boardValue < bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  return bestMove;
};

const buildStatusMessage = (game) => {
  if (game.isGameOver()) {
    if (game.inCheckmate()) {
      return game.turn() === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate';
    }
    if (game.inStalemate()) return 'Draw by stalemate';
    if (game.insufficientMaterial()) return 'Draw by insufficient material';
    if (game.inThreefoldRepetition()) return 'Draw by repetition';
    if (game.inDraw()) return 'Draw';
  }

  const turn = game.turn() === 'w' ? 'White' : 'Black';
  if (game.inCheck()) {
    return `${turn} to move — check!`;
  }
  return `${turn} to move`;
};

const computeCapturedPieces = (history) => {
  const captured = { white: [], black: [] };
  history.forEach((move) => {
    if (!move.captured) return;
    if (move.color === 'w') {
      captured.white.push(PIECE_UNICODE.black[move.captured]);
    } else {
      captured.black.push(PIECE_UNICODE.white[move.captured]);
    }
  });
  return captured;
};

const findKingSquare = (game, color) => {
  const board = game.board();
  for (let rank = 0; rank < board.length; rank += 1) {
    for (let file = 0; file < board[rank].length; file += 1) {
      const piece = board[rank][file];
      if (piece && piece.type === 'k' && piece.color === color) {
        const fileChar = String.fromCharCode('a'.charCodeAt(0) + file);
        const rankChar = (8 - rank).toString();
        return `${fileChar}${rankChar}`;
      }
    }
  }
  return null;
};

function ChessGame() {
  const gameRef = useRef(new Chess());
  const aiMoveTimeout = useRef(null);
  const undoneMovesRef = useRef([]);

  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveHistory, setMoveHistory] = useState(gameRef.current.history({ verbose: true }));
  const [capturedPieces, setCapturedPieces] = useState(computeCapturedPieces([]));
  const [status, setStatus] = useState('White to move');
  const [vsComputer, setVsComputer] = useState(false);
  const [highlightSquares, setHighlightSquares] = useState({});
  const [aiThinking, setAiThinking] = useState(false);
  const [boardWidth, setBoardWidth] = useState(() => (
    typeof window === 'undefined' ? 360 : Math.min(360, window.innerWidth - 48)
  ));
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastDropAttempt, setLastDropAttempt] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setBoardWidth(Math.min(360, window.innerWidth - 48));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => () => {
    if (aiMoveTimeout.current) {
      clearTimeout(aiMoveTimeout.current);
    }
  }, []);

  const updateState = useCallback((lastMove = null) => {
    const game = gameRef.current;
    setFen(game.fen());
    const historyVerbose = game.history({ verbose: true });
    setMoveHistory(historyVerbose);
    setCapturedPieces(computeCapturedPieces(historyVerbose));
    setStatus(buildStatusMessage(game));

    setSelectedSquare(null);
    setLegalMoves([]);

    const highlight = {};
    const recentMove = lastMove || historyVerbose[historyVerbose.length - 1];
    if (recentMove) {
      highlight[recentMove.from] = { background: 'rgba(0, 255, 140, 0.35)' };
      highlight[recentMove.to] = { background: 'rgba(255, 215, 0, 0.45)' };
    }
    if (game.inCheck()) {
      const kingSquare = findKingSquare(game, game.turn());
      if (kingSquare) {
        highlight[kingSquare] = { background: 'rgba(255, 64, 64, 0.55)' };
      }
    }
    setHighlightSquares(highlight);
  }, []);

  const maybeScheduleAiMove = useCallback(() => {
    if (!vsComputer) return;
    const game = gameRef.current;
    if (game.turn() !== 'b' || game.isGameOver()) {
      setAiThinking(false);
      return;
    }
    if (aiMoveTimeout.current) return;

    setAiThinking(true);
    aiMoveTimeout.current = setTimeout(() => {
      const bestMove = findBestMoveForBlack(game, 4) || game.moves({ verbose: true })[0];
      if (bestMove && !game.isGameOver()) {
        const applied = game.move(bestMove);
        undoneMovesRef.current = [];
        updateState(applied);
      }
      setAiThinking(false);
      aiMoveTimeout.current = null;
    }, 400);
  }, [updateState, vsComputer]);

  const performMove = useCallback((from, to, options = {}) => {
    const { bypassTurnCheck = false, triggerAi = true } = options;
    const game = gameRef.current;
    if (game.isGameOver()) return false;
    if (!bypassTurnCheck && vsComputer && game.turn() === 'b') {
      return { success: false, reason: 'waiting-for-ai' };
    }

    const move = game.move({ from, to, promotion: 'q' });
    if (!move) {
      return { success: false, reason: 'illegal' };
    }

    undoneMovesRef.current = [];
    updateState(move);
    if (triggerAi) {
      maybeScheduleAiMove();
    }
    return { success: true, move };
  }, [maybeScheduleAiMove, updateState, vsComputer]);

  const onPieceDrop = (sourceSquare, targetSquare) => {
    const result = performMove(sourceSquare, targetSquare, { bypassTurnCheck: false, triggerAi: true });
    const game = gameRef.current;
    if (!result || !result.success) {
      const reason = result?.reason ?? (game.isGameOver() ? 'game-over' : 'unknown');
      const attempt = {
        from: sourceSquare,
        to: targetSquare,
        success: false,
        reason,
        turn: game.turn(),
        fen: game.fen(),
        timestamp: Date.now(),
      };
      setLastDropAttempt(attempt);
      console.warn('[Chess] Drop rejected', attempt);
      return false;
    }

    const attempt = {
      from: sourceSquare,
      to: targetSquare,
      success: true,
      san: result.move?.san ?? null,
      turn: game.turn(),
      fen: game.fen(),
      timestamp: Date.now(),
    };
    setLastDropAttempt(attempt);
    console.debug('[Chess] Drop accepted', attempt);
    return true;
  };

  const handleSquareClick = useCallback((square) => {
    const game = gameRef.current;
    if (game.isGameOver()) return;
    if (aiThinking) return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const legalTarget = legalMoves.find((move) => move.to === square);
      if (legalTarget) {
        const result = performMove(selectedSquare, square, { bypassTurnCheck: false, triggerAi: true });
        if (result && result.success) {
          setLastDropAttempt({
            from: selectedSquare,
            to: square,
            success: true,
            san: result.move?.san ?? null,
            turn: game.turn(),
            fen: game.fen(),
            timestamp: Date.now(),
          });
        } else {
          const attempt = {
            from: selectedSquare,
            to: square,
            success: false,
            reason: result?.reason ?? 'illegal',
            turn: game.turn(),
            fen: game.fen(),
            timestamp: Date.now(),
          };
          setLastDropAttempt(attempt);
        }
        return;
      }
    }

    const piece = game.get(square);
    if (!piece) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const isPlayersTurn = piece.color === game.turn();
    const isAllowedColor = !vsComputer || piece.color === 'w';
    if (!isPlayersTurn || !isAllowedColor) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const moves = game.moves({ square, verbose: true });
    setSelectedSquare(square);
    setLegalMoves(moves);
  }, [aiThinking, legalMoves, performMove, selectedSquare, vsComputer]);

  const resetGame = useCallback(() => {
    const game = gameRef.current;
    game.reset();
    undoneMovesRef.current = [];
    if (aiMoveTimeout.current) {
      clearTimeout(aiMoveTimeout.current);
      aiMoveTimeout.current = null;
    }
    setAiThinking(false);
    updateState();
    setLastDropAttempt(null);
  }, [updateState]);

  const handleToggleOpponent = () => {
    const next = !vsComputer;
    setVsComputer(next);
    const game = gameRef.current;
    game.reset();
    undoneMovesRef.current = [];
    if (aiMoveTimeout.current) {
      clearTimeout(aiMoveTimeout.current);
      aiMoveTimeout.current = null;
    }
    setAiThinking(false);
    updateState();
    setLastDropAttempt(null);
  };

  const handleUndo = () => {
    const game = gameRef.current;
    const historyLength = game.history().length;
    if (historyLength === 0) return;

    if (aiMoveTimeout.current) {
      clearTimeout(aiMoveTimeout.current);
      aiMoveTimeout.current = null;
    }
    setAiThinking(false);

    if (vsComputer) {
      const steps = Math.min(2, historyLength);
      for (let i = 0; i < steps; i += 1) {
        const undone = game.undo();
        if (undone) undoneMovesRef.current.push(undone);
      }
    } else {
      const undone = game.undo();
      if (undone) undoneMovesRef.current.push(undone);
    }

    updateState();
    setLastDropAttempt(null);
  };

  const handleRedo = () => {
    const game = gameRef.current;
    if (undoneMovesRef.current.length === 0) return;

    if (aiMoveTimeout.current) {
      clearTimeout(aiMoveTimeout.current);
      aiMoveTimeout.current = null;
    }
    setAiThinking(false);

    const steps = vsComputer ? Math.min(2, undoneMovesRef.current.length) : 1;
    const movesToApply = undoneMovesRef.current.splice(-steps, steps).reverse();
    let appliedMove = null;
    movesToApply.forEach((move) => {
      const applied = game.move({ from: move.from, to: move.to, promotion: move.promotion });
      appliedMove = applied || move;
    });

    updateState(appliedMove || null);
    if (vsComputer) {
      maybeScheduleAiMove();
    }
    setLastDropAttempt(null);
  };

  const runSmokeTests = useCallback(() => {
    const runCase = (name, steps) => {
      const testGame = new Chess();
      const stepResults = steps.map((step) => {
        const move = testGame.move({ from: step.from, to: step.to, promotion: 'q' });
        return {
          ...step,
          actual: Boolean(move),
          passed: Boolean(move) === step.expect,
        };
      });
      return {
        name,
        steps: stepResults,
        passed: stepResults.every((step) => step.passed),
      };
    };

    const cases = [
      runCase('White pawn opening', [
        { from: 'e2', to: 'e4', expect: true },
        { from: 'e2', to: 'e3', expect: false },
      ]),
      runCase('Knight move validation', [
        { from: 'g1', to: 'f3', expect: true },
        { from: 'b8', to: 'b6', expect: false },
      ]),
      runCase('Turn sequencing', [
        { from: 'e2', to: 'e4', expect: true },
        { from: 'd7', to: 'd5', expect: true },
        { from: 'd8', to: 'h4', expect: false },
      ]),
    ];

    return {
      passed: cases.every((testCase) => testCase.passed),
      cases,
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (import.meta?.env?.DEV) {
      const results = runSmokeTests();
      console.groupCollapsed('[Chess] Engine smoke tests');
      results.cases.forEach((testCase) => {
        console.log(`${testCase.passed ? '✅' : '❌'} ${testCase.name}`);
        testCase.steps.forEach((step) => {
          console.log(`  ${step.from} → ${step.to} :: expect ${step.expect} :: actual ${step.actual}`);
        });
      });
      console.groupEnd();
    }

    const debugApi = {
      attemptMove: (from, to, options = {}) => performMove(from, to, { triggerAi: false, ...options }),
      getFen: () => gameRef.current.fen(),
      getTurn: () => gameRef.current.turn(),
      reset: () => {
        resetGame();
        return gameRef.current.fen();
      },
      runSmokeTests,
    };

    window.__zemoChess = debugApi;
    return () => {
      if (window.__zemoChess === debugApi) {
        delete window.__zemoChess;
      }
    };
  }, [performMove, resetGame, runSmokeTests]);

  const movePairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({
        moveNumber: i / 2 + 1,
        white: moveHistory[i]?.san ?? '',
        black: moveHistory[i + 1]?.san ?? '',
      });
    }
    return pairs;
  }, [moveHistory]);

  const combinedSquareStyles = useMemo(() => {
    const styles = { ...highlightSquares };
    if (selectedSquare) {
      styles[selectedSquare] = {
        ...(styles[selectedSquare] ?? {}),
        ...SELECTED_STYLE,
      };
    }
    legalMoves.forEach((move) => {
      styles[move.to] = {
        ...(styles[move.to] ?? {}),
        ...(move.captured ? CAPTURE_STYLE : LEGAL_STYLE),
      };
    });
    return styles;
  }, [highlightSquares, legalMoves, selectedSquare]);

  const customPieces = useMemo(() => {
    const entries = {};
    const pieceKeys = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
    pieceKeys.forEach((key) => {
      const isWhite = key[0] === 'w';
      const type = key[1].toLowerCase();
      const glyph = PIECE_UNICODE[isWhite ? 'white' : 'black'][type];
      entries[key] = ({ squareWidth }) => (
        <div
          className={`custom-chess-piece custom-chess-piece-${isWhite ? 'white' : 'black'}`}
          style={{ fontSize: `${Math.max(squareWidth * 0.7, 22)}px` }}
        >
          {glyph}
        </div>
      );
    });
    return entries;
  }, []);

  const isDraggablePiece = ({ piece }) => {
    if (!piece) return false;
    const game = gameRef.current;
    if (game.isGameOver()) return false;
    if (!vsComputer) return true;
    return piece.startsWith('w') && game.turn() === 'w';
  };

  const canUndo = gameRef.current.history().length > 0;
  const canRedo = undoneMovesRef.current.length > 0;

  return (
    <div className="chess-wrapper">
      <div className="glass-panel chess-board-panel">
        <div className="chessboard-wrapper" style={{ width: boardWidth, height: boardWidth }}>
          {/* Left rank labels 8-1 */}
          <div className="chess-ranks chess-ranks-left">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={`left-${i}`} className="chess-marker">{8 - i}</span>
            ))}
          </div>
          <div className="chess-grid">
            {Array.from({ length: 8 }).map((_, rankIndex) => (
              Array.from({ length: 8 }).map((__, fileIndex) => {
                const fileLetter = String.fromCharCode('a'.charCodeAt(0) + fileIndex);
                const rankNumber = 8 - rankIndex;
                const square = `${fileLetter}${rankNumber}`;
                const piece = gameRef.current.get(square);
                const isDark = (rankIndex + fileIndex) % 2 === 0;
                const style = combinedSquareStyles[square] || {};
                const glyph = piece ? PIECE_UNICODE[piece.color === 'w' ? 'white' : 'black'][piece.type] : null;

                let className = `chess-square ${isDark ? 'chess-square-dark' : 'chess-square-light'}`;
                if (selectedSquare === square) className += ' chess-square-selected';

                return (
                  <button
                    key={square}
                    type="button"
                    className={className}
                    style={style}
                    onClick={() => handleSquareClick(square)}
                  >
                    {glyph && (
                      <span className={`custom-chess-piece custom-chess-piece-${piece.color === 'w' ? 'white' : 'black'}`}>
                        {glyph}
                      </span>
                    )}
                  </button>
                );
              })
            ))}
          </div>
        </div>
        <div className="chess-controls">
          <button className="control-btn" onClick={resetGame}>New Game</button>
          <button className="control-btn" onClick={handleUndo} disabled={!canUndo}>Undo</button>
          <button className="control-btn" onClick={handleRedo} disabled={!canRedo}>Redo</button>
          <button className="control-btn" onClick={handleToggleOpponent}>
            Mode: {vsComputer ? 'Player vs Computer' : 'Player vs Player'}
          </button>
        </div>
      </div>

      <div className="glass-panel chess-info-panel">
        <p className="chess-status">{status}</p>
        {lastDropAttempt && (
          <div className={`chess-debug ${lastDropAttempt.success ? 'chess-debug-success' : 'chess-debug-error'}`}>
            <p>
              Last drop {lastDropAttempt.success ? 'accepted' : 'rejected'}: {lastDropAttempt.from}
              {' → '}
              {lastDropAttempt.to}
              {lastDropAttempt.success && lastDropAttempt.san ? ` (${lastDropAttempt.san})` : ''}
            </p>
            {!lastDropAttempt.success && lastDropAttempt.reason && (
              <p>Reason: {lastDropAttempt.reason}</p>
            )}
            <p className="chess-debug-subtle">Turn: {lastDropAttempt.turn === 'w' ? 'White' : 'Black'}</p>
          </div>
        )}
        {aiThinking && vsComputer && (
          <p className="chess-thinking">AI is thinking…</p>
        )}

        <div className="chess-captured">
          <div>
            <h4>Captured by White</h4>
            <div className="chess-captured-row">{capturedPieces.white.join(' ') || '—'}</div>
          </div>
          <div>
            <h4>Captured by Black</h4>
            <div className="chess-captured-row">{capturedPieces.black.join(' ') || '—'}</div>
          </div>
        </div>

        <div className="chess-history">
          <h4>Move History</h4>
          <div className="chess-history-head">
            <span>#</span>
            <span>White</span>
            <span>Black</span>
          </div>
          <div className="chess-history-list">
            {movePairs.length === 0 && (
              <p className="chess-history-empty">No moves yet.</p>
            )}
            {movePairs.map(({ moveNumber, white, black }) => (
              <div key={moveNumber} className="chess-history-row">
                <span>{moveNumber}.</span>
                <span>{white || '—'}</span>
                <span>{black || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChessGame;
