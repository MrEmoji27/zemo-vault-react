'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import "./LudoGame.css";

const PLAYERS = ["green", "yellow", "red", "blue"];
const PLAYER_COLORS = {
  green: "#00ff8c",
  yellow: "#ffd43b",
  red: "#ff3b3b",
  blue: "#3bb4ff",
};
const PLAYER_LABELS = {
  green: "GREEN (You)",
  yellow: "YELLOW",
  red: "RED",
  blue: "BLUE",
};

const MAIN_LEN = 52;
const HOME_STEPS = 6;
const START_INDEX = { green: 0, yellow: 13, red: 26, blue: 39 };
const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Correct 52-cell clockwise path on a 15x15 board [row, col]
const PATH_COORDS = [
  // Green side (0-12): down col 6, left row 6, corners
  [1,6], [2,6], [3,6], [4,6], [5,6],
  [6,5], [6,4], [6,3], [6,2], [6,1], [6,0],
  [7,0], [8,0],
  // Blue side (13-25): right row 8, down col 6, corners
  [8,1], [8,2], [8,3], [8,4], [8,5],
  [9,6], [10,6], [11,6], [12,6], [13,6], [14,6],
  [14,7], [14,8],
  // Red side (26-38): up col 8, right row 8, corners
  [13,8], [12,8], [11,8], [10,8], [9,8],
  [8,9], [8,10], [8,11], [8,12], [8,13], [8,14],
  [7,14], [6,14],
  // Yellow side (39-51): left row 6, up col 8, corners
  [6,13], [6,12], [6,11], [6,10], [6,9],
  [5,8], [4,8], [3,8], [2,8], [1,8], [0,8],
  [0,7], [0,6],
];

// Home lanes: 6 cells leading to center [7,7]
const HOME_PATHS = {
  green:  [[1,7], [2,7], [3,7], [4,7], [5,7], [6,7]],
  blue:   [[7,1], [7,2], [7,3], [7,4], [7,5], [7,6]],
  red:    [[13,7], [12,7], [11,7], [10,7], [9,7], [8,7]],
  yellow: [[7,13], [7,12], [7,11], [7,10], [7,9], [7,8]],
};

// Where tokens sit when in base
const BASE_SLOTS = {
  green:  [[2,1], [2,4], [4,1], [4,4]],
  yellow: [[2,10], [2,13], [4,10], [4,13]],
  red:    [[10,10], [10,13], [13,10], [13,13]],
  blue:   [[10,1], [10,4], [13,1], [13,4]],
};

const defaultTokens = () => {
  const out = {};
  PLAYERS.forEach((p) => (out[p] = [-1, -1, -1, -1]));
  return out;
};

function distanceFromStart(player, pos) {
  const s = START_INDEX[player];
  if (pos >= s) return pos - s;
  return MAIN_LEN - s + pos;
}

function capturePossible(tokens, pos, movingPlayer) {
  if (typeof pos !== "number") return false;
  if (SAFE_SQUARES.has(pos)) return false;
  for (const p of PLAYERS) {
    if (p === movingPlayer) continue;
    for (const t of tokens[p]) if (t === pos) return true;
  }
  return false;
}

function performCapture(tokens, pos, movingPlayer) {
  const updated = {};
  PLAYERS.forEach((p) => {
    if (p === movingPlayer) {
      updated[p] = [...tokens[p]];
    } else {
      updated[p] = tokens[p].map((t) => (t === pos ? -1 : t));
    }
  });
  return updated;
}

function computeLegalMoves(tokens, player, diceValue) {
  const moves = [];
  const myTokens = tokens[player];
  myTokens.forEach((pos, i) => {
    // Token in home lane
    if (typeof pos === "string" && pos.startsWith("H")) {
      const step = parseInt(pos.slice(1), 10);
      const next = step + diceValue;
      if (next <= HOME_STEPS) {
        moves.push({ piece: i, from: pos, to: `H${next}`, finished: next === HOME_STEPS });
      }
      return;
    }
    // Token in base
    if (pos === -1) {
      if (diceValue === 6) {
        const entry = START_INDEX[player];
        const ownThere = tokens[player].some((t, j) => j !== i && t === entry);
        if (!ownThere) {
          moves.push({ piece: i, from: -1, to: entry, capture: capturePossible(tokens, entry, player) });
        }
      }
      return;
    }
    // Token on main path
    const dist = distanceFromStart(player, pos);
    const newDist = dist + diceValue;
    if (newDist >= MAIN_LEN) {
      const homeStep = newDist - MAIN_LEN + 1;
      if (homeStep <= HOME_STEPS) {
        moves.push({ piece: i, from: pos, to: `H${homeStep}`, finished: homeStep === HOME_STEPS });
      }
      return;
    }
    const target = (pos + diceValue) % MAIN_LEN;
    const ownThere = tokens[player].some((t, j) => j !== i && t === target);
    if (!ownThere) {
      moves.push({ piece: i, from: pos, to: target, capture: capturePossible(tokens, target, player) });
    }
  });
  return moves;
}

function finishedCount(tokens, player) {
  return tokens[player].filter(
    (t) => typeof t === "string" && t === `H${HOME_STEPS}`
  ).length;
}

// AI: pick the best move
function pickAIMove(moves) {
  // Priority: capture > finish > enter from base > advance furthest
  const capture = moves.find((m) => m.capture);
  if (capture) return capture;
  const finish = moves.find((m) => m.finished);
  if (finish) return finish;
  const enter = moves.find((m) => m.from === -1);
  if (enter) return enter;
  // Advance the token closest to home
  return moves[moves.length - 1];
}

export default function Ludo() {
  const [tokens, setTokens] = useState(defaultTokens);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dice, setDice] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [phase, setPhase] = useState("roll"); // roll | move | done
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [message, setMessage] = useState("Roll the dice to start!");
  const [winner, setWinner] = useState(null);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);

  const aiTimer = useRef(null);
  const currentPlayer = PLAYERS[currentPlayerIndex];
  const isHuman = currentPlayer === "green";

  // Cleanup AI timer
  useEffect(() => {
    return () => { if (aiTimer.current) clearTimeout(aiTimer.current); };
  }, []);

  const passTurn = useCallback(() => {
    setDice(null);
    setPhase("roll");
    setSelectedPiece(null);
    setConsecutiveSixes(0);
    setCurrentPlayerIndex((prev) => {
      const nxt = (prev + 1) % PLAYERS.length;
      setMessage(`${PLAYERS[nxt].toUpperCase()}'s turn`);
      return nxt;
    });
  }, []);

  const applyMove = useCallback((chosen, currentTokens, player, diceVal) => {
    let updated = { ...currentTokens };
    PLAYERS.forEach((p) => (updated[p] = [...currentTokens[p]]));

    if (typeof chosen.to === "number" && capturePossible(currentTokens, chosen.to, player)) {
      updated = performCapture(updated, chosen.to, player);
    }
    updated[player][chosen.piece] = chosen.to;
    setTokens(updated);

    if (chosen.finished && finishedCount(updated, player) >= 4) {
      setWinner(player);
      setMessage(`${player.toUpperCase()} wins!`);
      setPhase("done");
      return;
    }

    if (diceVal === 6) {
      setConsecutiveSixes((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setMessage(`${player.toUpperCase()} rolled three 6s — turn forfeited!`);
          setTimeout(() => passTurn(), 600);
          return 0;
        }
        setMessage(`${player.toUpperCase()} rolled a 6 — roll again!`);
        setDice(null);
        setPhase("roll");
        setSelectedPiece(null);
        return next;
      });
    } else {
      passTurn();
    }
  }, [passTurn]);

  const rollDice = useCallback(() => {
    if (winner || rolling || phase !== "roll") return;
    setRolling(true);
    setSelectedPiece(null);
    setMessage("Rolling...");

    const ticks = 8 + Math.floor(Math.random() * 6);
    let i = 0;
    const interval = setInterval(() => {
      const v = Math.floor(Math.random() * 6) + 1;
      setDice(v);
      i++;
      if (i >= ticks) {
        clearInterval(interval);
        setRolling(false);
        setDice((finalVal) => {
          // Check if there are legal moves
          setTimeout(() => {
            setTokens((currentTokens) => {
              const legal = computeLegalMoves(currentTokens, currentPlayer, finalVal);
              if (legal.length === 0) {
                setMessage(`${currentPlayer.toUpperCase()} rolled ${finalVal} — no legal moves`);
                setTimeout(() => passTurn(), 800);
              } else if (legal.length === 1 && !isHuman) {
                setPhase("move");
              } else {
                setPhase("move");
                if (isHuman) {
                  setMessage(`You rolled ${finalVal}. ${legal.length === 1 ? "Only one move — click MOVE or the piece." : "Select a piece to move."}`);
                }
              }
              return currentTokens;
            });
          }, 100);
          return finalVal;
        });
      }
    }, 60);
  }, [winner, rolling, phase, currentPlayer, isHuman, passTurn]);

  // AI auto-play
  useEffect(() => {
    if (winner || isHuman) return;
    if (aiTimer.current) clearTimeout(aiTimer.current);

    aiTimer.current = setTimeout(() => {
      if (phase === "roll") {
        rollDice();
      } else if (phase === "move" && dice !== null) {
        const legal = computeLegalMoves(tokens, currentPlayer, dice);
        if (legal.length === 0) {
          passTurn();
          return;
        }
        const chosen = pickAIMove(legal);
        setMessage(`${currentPlayer.toUpperCase()} moves piece ${chosen.piece + 1}`);
        applyMove(chosen, tokens, currentPlayer, dice);
      }
    }, phase === "roll" ? 700 : 500);

    return () => { if (aiTimer.current) clearTimeout(aiTimer.current); };
  }, [currentPlayerIndex, phase, winner, isHuman, dice, tokens, currentPlayer, rollDice, passTurn, applyMove]);

  function handleCellClick(target) {
    if (!isHuman || phase !== "move" || dice === null) return;
    const legal = computeLegalMoves(tokens, currentPlayer, dice);
    if (legal.length === 0) return;

    let chosen = null;
    if (selectedPiece !== null) {
      chosen = legal.find((m) => m.to === target && m.piece === selectedPiece);
    }
    if (!chosen) {
      const candidates = legal.filter((m) => m.to === target);
      if (candidates.length === 1) chosen = candidates[0];
    }
    if (!chosen) {
      setMessage("Can't move there. Pick a valid destination.");
      return;
    }
    applyMove(chosen, tokens, currentPlayer, dice);
  }

  function handlePieceClick(player, idx) {
    if (!isHuman || phase !== "move" || player !== currentPlayer || dice === null) return;
    const legal = computeLegalMoves(tokens, currentPlayer, dice);
    const movesForPiece = legal.filter((m) => m.piece === idx);

    if (movesForPiece.length === 0) {
      setMessage(`Piece ${idx + 1} can't move with a ${dice}.`);
      return;
    }

    if (movesForPiece.length === 1) {
      // Auto-move if only one option for this piece
      applyMove(movesForPiece[0], tokens, currentPlayer, dice);
      return;
    }

    setSelectedPiece(idx);
    setMessage(`Selected piece ${idx + 1}. Click a destination.`);
  }

  function handleMoveBtn() {
    if (!isHuman || phase !== "move" || dice === null) return;
    const legal = computeLegalMoves(tokens, currentPlayer, dice);
    if (legal.length === 0) {
      passTurn();
      return;
    }
    if (legal.length === 1) {
      applyMove(legal[0], tokens, currentPlayer, dice);
      return;
    }
    if (selectedPiece !== null) {
      const chosen = legal.find((m) => m.piece === selectedPiece);
      if (chosen) {
        applyMove(chosen, tokens, currentPlayer, dice);
      } else {
        setMessage("Selected piece can't move. Pick another.");
      }
    } else {
      setMessage("Multiple pieces can move — select one first.");
    }
  }

  function newGame() {
    if (aiTimer.current) clearTimeout(aiTimer.current);
    setTokens(defaultTokens());
    setCurrentPlayerIndex(0);
    setDice(null);
    setPhase("roll");
    setSelectedPiece(null);
    setMessage("New game! Roll the dice.");
    setWinner(null);
    setConsecutiveSixes(0);
  }

  // Compute which cells are legal destinations for highlighting
  const legalDestinations = useMemo(() => {
    if (!isHuman || phase !== "move" || dice === null) return new Set();
    const legal = computeLegalMoves(tokens, currentPlayer, dice);
    const filtered = selectedPiece !== null ? legal.filter((m) => m.piece === selectedPiece) : legal;
    return new Set(filtered.map((m) => {
      if (typeof m.to === "number") return `path-${m.to}`;
      return `home-${currentPlayer}-${m.to}`;
    }));
  }, [tokens, currentPlayer, dice, phase, isHuman, selectedPiece]);

  // Which pieces can move (for glow effect)
  const movablePieces = useMemo(() => {
    if (phase !== "move" || dice === null) return new Set();
    const legal = computeLegalMoves(tokens, currentPlayer, dice);
    return new Set(legal.map((m) => `${currentPlayer}-${m.piece}`));
  }, [tokens, currentPlayer, dice, phase]);

  // Token coordinate lookup
  const tokenPositions = useMemo(() => {
    const result = [];
    PLAYERS.forEach((player) => {
      tokens[player].forEach((pos, i) => {
        let rc = null;
        if (typeof pos === "number") rc = PATH_COORDS[pos];
        else if (typeof pos === "string" && pos.startsWith("H")) {
          const step = parseInt(pos.slice(1), 10);
          rc = HOME_PATHS[player][step - 1];
        }
        else if (pos === -1) rc = BASE_SLOTS[player][i];
        if (!rc) return;

        result.push({ player, idx: i, row: rc[0], col: rc[1], inBase: pos === -1 });
      });
    });
    return result;
  }, [tokens]);

  // Stack offsets for tokens sharing a cell
  const tokensByCell = useMemo(() => {
    const map = {};
    tokenPositions.forEach((t) => {
      const key = `${t.row}-${t.col}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tokenPositions]);

  function getStackOffset(row, col, player, idx) {
    const key = `${row}-${col}`;
    const stack = tokensByCell[key] || [];
    const kidx = stack.findIndex((t) => t.player === player && t.idx === idx);
    const n = stack.length;
    if (n <= 1) return [0, 0];
    if (n === 2) return [kidx === 0 ? -0.14 : 0.14, 0];
    if (n === 3) {
      const pat = [[-0.14, -0.08], [0.14, -0.08], [0, 0.14]];
      return pat[kidx] || [0, 0];
    }
    const pat = [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]];
    return pat[kidx % 4] || [0, 0];
  }

  // Dice face dots
  const diceDots = {
    1: [[1,1]],
    2: [[0,2],[2,0]],
    3: [[0,2],[1,1],[2,0]],
    4: [[0,0],[0,2],[2,0],[2,2]],
    5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
    6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]],
  };

  return (
    <div className="ludo-wrapper">
      {/* Top bar: players + controls */}
      <div className="ludo-topbar">
        <div className="ludo-players">
          {PLAYERS.map((p) => (
            <div
              key={p}
              className={`ludo-player-badge ${p === currentPlayer ? "active" : ""}`}
              style={{ borderColor: PLAYER_COLORS[p], color: PLAYER_COLORS[p] }}
            >
              <span className="ludo-badge-dot" style={{ background: PLAYER_COLORS[p] }} />
              {p === "green" ? "YOU" : p.toUpperCase()}
              <span className="ludo-badge-score">{finishedCount(tokens, p)}/4</span>
            </div>
          ))}
        </div>
        <div className="ludo-controls">
          {isHuman && phase === "roll" && !winner && (
            <button className="ludo-btn ludo-btn-roll" onClick={rollDice} disabled={rolling}>
              {rolling ? "..." : "ROLL"}
            </button>
          )}
          {isHuman && phase === "move" && !winner && (
            <button className="ludo-btn ludo-btn-move" onClick={handleMoveBtn}>MOVE</button>
          )}
          <button className="ludo-btn ludo-btn-new" onClick={newGame}>NEW</button>
        </div>
      </div>

      {/* Board */}
      <div className="ludo-board-container">
        {/* Dice overlay */}
        <div className={`ludo-dice ${rolling ? "ludo-dice-roll" : ""} ${dice ? "ludo-dice-show" : ""}`}
          style={{ borderColor: PLAYER_COLORS[currentPlayer] + "60" }}
        >
          {dice ? (
            <svg viewBox="0 0 3 3" width="36" height="36">
              {diceDots[dice]?.map(([r, c], i) => (
                <circle key={i} cx={c * 1 + 0.5} cy={r * 1 + 0.5} r="0.3" fill={PLAYER_COLORS[currentPlayer]} />
              ))}
            </svg>
          ) : (
            <span className="ludo-dice-placeholder">?</span>
          )}
        </div>

        <svg className="ludo-svg" viewBox="-0.2 -0.2 15.4 15.4" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="tokenGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="0.25" floodColor="#ff77e9" floodOpacity="0.7" />
            </filter>
            <filter id="legalGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="0.15" floodColor="#ff77e9" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Base quadrants */}
          <rect x="0" y="0" width="6" height="6" rx="0.3" className="ludo-base-green" />
          <rect x="9" y="0" width="6" height="6" rx="0.3" className="ludo-base-yellow" />
          <rect x="9" y="9" width="6" height="6" rx="0.3" className="ludo-base-red" />
          <rect x="0" y="9" width="6" height="6" rx="0.3" className="ludo-base-blue" />

          {/* Base inner circles (token home spots) */}
          {Object.entries(BASE_SLOTS).map(([p, slots]) =>
            slots.map(([r, c], i) => (
              <circle key={`bs-${p}-${i}`} cx={c + 0.5} cy={r + 0.5} r="0.38"
                className={`ludo-base-slot ludo-base-slot-${p}`} />
            ))
          )}

          {/* Main path */}
          {PATH_COORDS.map(([r, c], idx) => {
            const isLegal = legalDestinations.has(`path-${idx}`);
            const isSafe = SAFE_SQUARES.has(idx);
            return (
              <g key={`p-${idx}`} onClick={() => handleCellClick(idx)} className="ludo-cell-g">
                <rect
                  x={c + 0.04} y={r + 0.04} width="0.92" height="0.92" rx="0.08"
                  className={`ludo-path ${isSafe ? "ludo-path-safe" : ""} ${isLegal ? "ludo-path-legal" : ""}`}
                  filter={isLegal ? "url(#legalGlow)" : undefined}
                />
                {isSafe && (
                  <text x={c + 0.5} y={r + 0.62} textAnchor="middle" className="ludo-star">*</text>
                )}
              </g>
            );
          })}

          {/* Home lanes */}
          {Object.entries(HOME_PATHS).map(([p, coords]) =>
            coords.map(([r, c], i) => {
              const dest = `H${i + 1}`;
              const isLegal = legalDestinations.has(`home-${p}-${dest}`);
              return (
                <rect key={`h-${p}-${i}`}
                  x={c + 0.04} y={r + 0.04} width="0.92" height="0.92" rx="0.08"
                  className={`ludo-home ludo-home-${p} ${isLegal ? "ludo-path-legal" : ""}`}
                  filter={isLegal ? "url(#legalGlow)" : undefined}
                  onClick={() => handleCellClick(dest)}
                />
              );
            })
          )}

          {/* Center */}
          <g className="ludo-center">
            <polygon points="7.5,7.5 6,6 9,6" className="ludo-tri ludo-tri-green" />
            <polygon points="7.5,7.5 9,6 9,9" className="ludo-tri ludo-tri-yellow" />
            <polygon points="7.5,7.5 9,9 6,9" className="ludo-tri ludo-tri-red" />
            <polygon points="7.5,7.5 6,9 6,6" className="ludo-tri ludo-tri-blue" />
            <circle cx="7.5" cy="7.5" r="0.4" className="ludo-center-dot" />
          </g>

          {/* Tokens */}
          {tokenPositions.map((t) => {
            const [dx, dy] = getStackOffset(t.row, t.col, t.player, t.idx);
            const canMove = movablePieces.has(`${t.player}-${t.idx}`);
            const isSelected = t.player === currentPlayer && selectedPiece === t.idx;
            const cx = t.col + 0.5 + dx;
            const cy = t.row + 0.5 + dy;

            return (
              <g key={`t-${t.player}-${t.idx}`}
                className={`ludo-token ${canMove ? "ludo-token-movable" : ""} ${isSelected ? "ludo-token-selected" : ""}`}
                onClick={() => handlePieceClick(t.player, t.idx)}
                filter={canMove || isSelected ? "url(#tokenGlow)" : undefined}
              >
                <circle cx={cx} cy={cy} r="0.34" className={`ludo-chip ludo-chip-${t.player}`} />
                <circle cx={cx} cy={cy} r="0.2" className={`ludo-chip-inner ludo-chip-inner-${t.player}`} />
                <text x={cx} y={cy + 0.08} textAnchor="middle" className="ludo-chip-label">
                  {t.idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Message bar */}
      <div className="ludo-msg" style={{ borderColor: PLAYER_COLORS[currentPlayer] + "40" }}>
        <span className="ludo-msg-dot" style={{ background: PLAYER_COLORS[currentPlayer] }} />
        {message}
      </div>

      {winner && (
        <div className="ludo-winner-overlay" onClick={newGame}>
          <div className="ludo-winner-text" style={{ color: PLAYER_COLORS[winner] }}>
            {winner === "green" ? "YOU WIN!" : `${winner.toUpperCase()} WINS!`}
          </div>
          <div className="ludo-winner-sub">Click anywhere to play again</div>
        </div>
      )}
    </div>
  );
}
