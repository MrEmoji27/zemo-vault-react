'use client';

import React, { useEffect, useMemo, useState } from "react";
import "./LudoGame.css";

const PLAYERS = ["green", "yellow", "red", "blue"];
const PLAYER_COLORS = {
  green: "#00ff8c",
  yellow: "#ffd43b",
  red: "#ff3b3b",
  blue: "#3bb4ff",
};
const PLAYER_RING = {
  green: "#49ffce",
  yellow: "#ffe470",
  red: "#ff8080",
  blue: "#7fd6ff",
};

const MAIN_LEN = 52;
const HOME_STEPS = 6;
const START_INDEX = { green: 0, yellow: 13, red: 26, blue: 39 };
const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

const PATH_COORDS = [
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0], [7, 0],
  [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  [14, 7], [13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7], [8, 8], [8, 9], [8, 10], [8, 11], [8, 12], [8, 13],
  [8, 14], [7, 14], [6, 14], [5, 14], [4, 14], [3, 14], [2, 14], [1, 14], [1, 13], [1, 12], [1, 11], [1, 10], [1, 9],
];

const HOME_PATHS = {
  green: [[2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7]],
  yellow: [[7, 12], [7, 11], [7, 10], [7, 9], [7, 8], [7, 7]],
  red: [[12, 7], [11, 7], [10, 7], [9, 7], [8, 7], [7, 7]],
  blue: [[7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7]],
};

const BASE_SLOTS = {
  green: [[1, 1], [1, 4], [4, 1], [4, 4]],
  yellow: [[1, 10], [1, 13], [4, 10], [4, 13]],
  red: [[10, 10], [10, 13], [13, 10], [13, 13]],
  blue: [[10, 1], [10, 4], [13, 1], [13, 4]],
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
  const updated = { ...tokens };
  PLAYERS.forEach((p) => {
    if (p === movingPlayer) return;
    updated[p] = updated[p].map((t) => (t === pos ? -1 : t));
  });
  return updated;
}

function computeLegalMovesFrom(tokens, player, diceValue) {
  const moves = [];
  const myTokens = tokens[player];
  myTokens.forEach((pos, i) => {
    if (typeof pos === "string" && pos.startsWith("H")) {
      const step = parseInt(pos.slice(1), 10);
      const next = step + diceValue;
      if (next <= HOME_STEPS) moves.push({ piece: i, from: pos, to: `H${next}`, finished: next === HOME_STEPS });
      return;
    }
    if (pos === -1) {
      if (diceValue === 6) {
        const entry = START_INDEX[player];
        const ownThere = tokens[player].some((t) => t === entry);
        if (!ownThere) moves.push({ piece: i, from: -1, to: entry, capture: capturePossible(tokens, entry, player) });
      }
      return;
    }
    const dist = distanceFromStart(player, pos);
    const newDist = dist + diceValue;
    if (newDist >= MAIN_LEN) {
      const homeStep = newDist - MAIN_LEN + 1;
      if (homeStep <= HOME_STEPS) moves.push({ piece: i, from: pos, to: `H${homeStep}`, finished: homeStep === HOME_STEPS });
      return;
    }
    const target = (pos + diceValue) % MAIN_LEN;
    const ownThere = tokens[player].some((t) => t === target);
    if (!ownThere) moves.push({ piece: i, from: pos, to: target, capture: capturePossible(tokens, target, player) });
  });
  return moves;
}

export default function Ludo() {
  const [tokens, setTokens] = useState(defaultTokens);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dice, setDice] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [diceRolled, setDiceRolled] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [message, setMessage] = useState("Press ROLL to start.");
  const [winner, setWinner] = useState(null);
  const [recentMoveMarker, setRecentMoveMarker] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  const currentPlayer = PLAYERS[currentPlayerIndex];

  useEffect(() => {
    if (winner) setMessage(`${winner.toUpperCase()} wins!`);
  }, [winner]);

  const finishedCount = (player) =>
    tokens[player].filter((t) => typeof t === "string" && t.startsWith("H") && parseInt(t.slice(1), 10) === HOME_STEPS).length;

  function rollDice() {
    if (winner || rolling) return;
    if (diceRolled) {
      setMessage("You already rolled — select a piece or SKIP.");
      return;
    }
    setRolling(true);
    setSelectedPiece(null);
    setMessage("Rolling...");
    const ticks = 10 + Math.floor(Math.random() * 8);
    let i = 0;
    const interval = setInterval(() => {
      const v = Math.floor(Math.random() * 6) + 1;
      setDice(v);
      i++;
      if (i >= ticks) {
        clearInterval(interval);
        setRolling(false);
        setDiceRolled(true);
        setMessage(`${currentPlayer.toUpperCase()} rolled ${v}. Select a piece.`);
      }
    }, 70);
  }

  function passTurn(nextIndex = null) {
    setDice(null);
    setDiceRolled(false);
    setSelectedPiece(null);
    setRecentMoveMarker(null);
    setCurrentPlayerIndex((prev) => {
      const nxt = nextIndex !== null ? nextIndex : (prev + 1) % PLAYERS.length;
      // Set message based on computed next index to avoid stale state
      setMessage(`${PLAYERS[nxt].toUpperCase()}'s turn.`);
      return nxt;
    });
  }

  function handleSelectPiece(idx) {
    if (!diceRolled) {
      setMessage("Roll first.");
      return;
    }
    setSelectedPiece(idx);
    setMessage(`Selected piece ${idx + 1}. Press MOVE to confirm.`);
  }

  function moveSelectedPiece() {
    if (!diceRolled) {
      setMessage("Roll first.");
      return;
    }
    const val = dice;
    const legal = computeLegalMovesFrom(tokens, currentPlayer, val);
    if (legal.length === 0) {
      setMessage("No legal moves. Turn passes.");
      passTurn();
      return;
    }
    let chosen = null;
    if (selectedPiece !== null) {
      chosen = legal.find((m) => m.piece === selectedPiece);
      if (!chosen) {
        setMessage("Selected piece cannot move with this roll.");
        return;
      }
    } else if (legal.length === 1) {
      chosen = legal[0];
    } else {
      setMessage("Multiple possible moves — select which piece to move.");
      return;
    }

    let updated = { ...tokens };
    if (typeof chosen.to === "number" && capturePossible(tokens, chosen.to, currentPlayer)) {
      updated = performCapture(updated, chosen.to, currentPlayer);
    }
    const playerTokens = [...updated[currentPlayer]];
    playerTokens[chosen.piece] = chosen.to;
    updated[currentPlayer] = playerTokens;
    setTokens(updated);
    setRecentMoveMarker({ player: currentPlayer, piece: chosen.piece, to: chosen.to });

    if (chosen.finished) {
      const finishedNow = finishedCount(currentPlayer) + 1;
      if (finishedNow >= 4) {
        setWinner(currentPlayer);
        setMessage(`${currentPlayer.toUpperCase()} wins!`);
        return;
      }
    }

    if (val === 6) {
      setDice(null);
      setDiceRolled(false);
      setSelectedPiece(null);
      setMessage(`${currentPlayer.toUpperCase()} rolled a 6 — roll again.`);
      return;
    }
    passTurn();
  }

  function moveToTarget(target) {
    if (!diceRolled) {
      setMessage("Roll first.");
      return;
    }
    const val = dice;
    const legal = computeLegalMovesFrom(tokens, currentPlayer, val);
    if (legal.length === 0) {
      setMessage("No legal moves. Turn passes.");
      passTurn();
      return;
    }
    // if a piece is selected, try exact target match
    let chosen = null;
    if (selectedPiece !== null) {
      chosen = legal.find((m) => m.to === target && m.piece === selectedPiece);
    }
    // otherwise allow any unique move to that target
    if (!chosen) {
      const candidates = legal.filter((m) => m.to === target);
      if (candidates.length === 1) chosen = candidates[0];
      if (!chosen) {
        setMessage("Select a valid piece for that destination.");
        return;
      }
    }

    let updated = { ...tokens };
    if (typeof chosen.to === "number" && capturePossible(tokens, chosen.to, currentPlayer)) {
      updated = performCapture(updated, chosen.to, currentPlayer);
    }
    const playerTokens = [...updated[currentPlayer]];
    playerTokens[chosen.piece] = chosen.to;
    updated[currentPlayer] = playerTokens;
    setTokens(updated);
    setRecentMoveMarker({ player: currentPlayer, piece: chosen.piece, to: chosen.to });

    if (chosen.finished) {
      const finishedNow = finishedCount(currentPlayer) + 1;
      if (finishedNow >= 4) {
        setWinner(currentPlayer);
        setMessage(`${currentPlayer.toUpperCase()} wins!`);
        return;
      }
    }

    if (val === 6) {
      setDice(null);
      setDiceRolled(false);
      setSelectedPiece(null);
      setMessage(`${currentPlayer.toUpperCase()} rolled a 6 — roll again.`);
      return;
    }
    passTurn();
  }

  function skipTurn() {
    if (!diceRolled) {
      setMessage("Roll first.");
      return;
    }
    passTurn();
  }

  function newGame() {
    setTokens(defaultTokens());
    setCurrentPlayerIndex(0);
    setDice(null);
    setDiceRolled(false);
    setSelectedPiece(null);
    setMessage("New game. Press ROLL.");
    setWinner(null);
    setRecentMoveMarker(null);
    setShowInfoPanel(true);
  }

  const boardCells = useMemo(() => {
    const rows = Array.from({ length: 15 }).map(() =>
      Array.from({ length: 15 }).map(() => ({ type: "empty" }))
    );

    for (let r = 0; r <= 5; r++)
      for (let c = 0; c <= 5; c++) rows[r][c] = { type: "base-green" };
    for (let r = 0; r <= 5; r++)
      for (let c = 9; c <= 14; c++) rows[r][c] = { type: "base-yellow" };
    for (let r = 9; r <= 14; r++)
      for (let c = 0; c <= 5; c++) rows[r][c] = { type: "base-red" };
    for (let r = 9; r <= 14; r++)
      for (let c = 9; c <= 14; c++) rows[r][c] = { type: "base-blue" };

    PATH_COORDS.forEach((coord, idx) => {
      const [r, c] = coord;
      rows[r][c] = { type: "path", index: idx, safe: SAFE_SQUARES.has(idx) };
    });

    Object.entries(HOME_PATHS).forEach(([p, coords]) => {
      coords.forEach((coord, i) => {
        const [r, c] = coord;
        rows[r][c] = { type: `home-${p}`, step: i + 1 };
      });
    });

    rows[7][7] = { type: "center" };

    return rows;
  }, []);

  const tokensByCoord = useMemo(() => {
    const map = {};
    PLAYERS.forEach((player) => {
      tokens[player].forEach((pos, i) => {
        if (typeof pos === "number") {
          const coord = PATH_COORDS[pos];
          if (!coord) return;
          const key = `${coord[0]}-${coord[1]}`;
          map[key] = map[key] || [];
          map[key].push({ player, idx: i });
          return;
        }
        if (typeof pos === "string" && pos.startsWith("H")) {
          const step = parseInt(pos.slice(1), 10);
          const coord = HOME_PATHS[player][step - 1];
          if (!coord) return;
          const key = `${coord[0]}-${coord[1]}`;
          map[key] = map[key] || [];
          map[key].push({ player, idx: i });
          return;
        }
        if (pos === -1) {
          const slot = BASE_SLOTS[player][i];
          if (!slot) return;
          const key = `${slot[0]}-${slot[1]}`;
          map[key] = map[key] || [];
          map[key].push({ player, idx: i, base: true });
        }
      });
    });
    return map;
  }, [tokens]);

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-[1200px] grid grid-cols-12 gap-4">
        {/* Sidebar removed to declutter; tokens are selectable on-board now */}
        <div className="col-span-2"></div>

        <div className="col-span-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {PLAYERS.map((p) => (
                <div key={p} className={`px-2 py-1 rounded-md border ${p === currentPlayer ? "ring-2 ring-green-400" : "opacity-60"}`} style={{ borderColor: PLAYER_RING[p] }}>
                  <span className="text-xs" style={{ color: PLAYER_COLORS[p] }}>{p.toUpperCase()}</span>
                </div>
              ))}
              <div className={`px-2 py-1 rounded-md border`} style={{ borderColor: "rgba(0,255,140,0.35)" }}>
                <span className="text-xs text-gray-200">Dice: <span className="text-white font-semibold">{dice ?? "-"}</span></span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={rollDice} disabled={rolling || winner != null} className="px-4 py-2 rounded-md neon-btn-green">
                {rolling ? "Rolling…" : "ROLL"}
              </button>
              <button onClick={moveSelectedPiece} disabled={!diceRolled || winner != null} className="px-4 py-2 rounded-md neon-btn-yellow">MOVE</button>
              <button onClick={skipTurn} disabled={!diceRolled || winner != null} className="px-4 py-2 rounded-md neon-btn-red">SKIP</button>
              <button onClick={newGame} className="px-4 py-2 rounded-md neon-btn-white">NEW</button>
            </div>
          </div>

          <div className="board-outer neon-border">
            <div className={`dice-display ${rolling ? "dice-rolling" : ""}`}><div className="dice-inner">{dice ?? "-"}</div></div>

            {/* SVG BOARD */}
            <svg className="ludo-svg" viewBox="0 0 15 15" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Ludo board">
              <defs>
                <filter id="glowPink" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="0.35" floodColor="#ff77e9" floodOpacity="0.75" />
                </filter>
                <filter id="glowBlue" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="0.25" floodColor="#5cc3ff" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* Bases with rounded frames */}
              <g className="bases" stroke="rgba(255,255,255,0.08)" strokeWidth="0.08">
                <rect x="0" y="0" width="6" height="6" rx="0.5" className="base-green" />
                <rect x="9" y="0" width="6" height="6" rx="0.5" className="base-yellow" />
                <rect x="0" y="9" width="6" height="6" rx="0.5" className="base-red" />
                <rect x="9" y="9" width="6" height="6" rx="0.5" className="base-blue" />
              </g>

              {/* Main path squares (neon blue) */}
              <g className="path-squares">
                {PATH_COORDS.map(([r,c], idx) => {
                  const legal = diceRolled && computeLegalMovesFrom(tokens, currentPlayer, dice).some(m => typeof m.to === 'number' && m.to === idx && (selectedPiece === null || m.piece === selectedPiece));
                  const safe = SAFE_SQUARES.has(idx);
                  return (
                    <g key={`p-${idx}`} onClick={() => { if (diceRolled) moveToTarget(idx); }} className={`svg-cell ${legal ? 'svg-legal' : ''}`}>
                      <rect x={c+0.01} y={r+0.01} width="0.98" height="0.98" rx="0.08" className={safe ? 'path-safe' : 'path'} />
                      {safe && (
                        <path
                          className="safe-star"
                          d={`M ${c+0.5} ${r+0.34}
                              l 0.06 0.12 0.14 0.02 -0.10 0.09 0.02 0.14 -0.12 -0.07 -0.12 0.07 0.02 -0.14 -0.10 -0.09 0.14 -0.02 Z`}
                        />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Home lanes */}
              {Object.entries(HOME_PATHS).map(([p, coords]) => (
                <g key={`home-${p}`} className={`home-lane home-${p}`}>
                  {coords.map(([r,c], i) => {
                    const dest = `H${i+1}`;
                    const legal = diceRolled && computeLegalMovesFrom(tokens, currentPlayer, dice).some(m => typeof m.to === 'string' && m.to === dest && (selectedPiece === null || m.piece === selectedPiece));
                    return (
                      <rect key={`h-${p}-${i}`} x={c+0.01} y={r+0.01} width="0.98" height="0.98" rx="0.08" className={`home ${p} ${legal ? 'svg-legal' : ''}`} onClick={() => { if (diceRolled) moveToTarget(dest); }} />
                    );
                  })}
                </g>
              ))}

              {/* Center rosette */}
              <g className="center">
                {/* center square */}
                <rect x="6.6" y="6.6" width="1.8" height="1.8" rx="0.22" className="center-core" />
                {/* Up (green) triangle */}
                <polygon className="center-fan green" points="7.5,7.5 6.6,6.6 8.4,6.6" />
                {/* Right (yellow) triangle */}
                <polygon className="center-fan yellow" points="7.5,7.5 8.4,6.6 8.4,8.4" />
                {/* Down (red) triangle */}
                <polygon className="center-fan red" points="7.5,7.5 6.6,8.4 8.4,8.4" />
                {/* Left (blue) triangle */}
                <polygon className="center-fan blue" points="7.5,7.5 6.6,6.6 6.6,8.4" />
              </g>

              {/* Tokens as circles (with stacking offsets) */}
              <g className="tokens" filter="url(#glowBlue)">
                {PLAYERS.flatMap(player => (
                  tokens[player].map((pos, i) => {
                    // Resolve grid coordinate for each token
                    let rc = null;
                    if (typeof pos === 'number') rc = PATH_COORDS[pos];
                    else if (typeof pos === 'string' && pos.startsWith('H')) rc = HOME_PATHS[player][parseInt(pos.slice(1),10)-1];
                    else if (pos === -1) rc = BASE_SLOTS[player][i];
                    if (!rc) return null;
                    const [r,c] = rc;
                    // state classes
                    let canMoveForThis = false;
                    if (diceRolled && player === currentPlayer && typeof dice === 'number') {
                      const legal = computeLegalMovesFrom(tokens, currentPlayer, dice);
                      canMoveForThis = legal.some(m => m.piece === i);
                    }
                    const isSelected = player === currentPlayer && selectedPiece === i;

                    // stacking offsets for multiple tokens on one cell
                    const key = `${r}-${c}`;
                    const stack = tokensByCoord[key] || [];
                    const kidx = stack.findIndex(t => t.player === player && t.idx === i);
                    const n = stack.length;
                    let dx = 0, dy = 0;
                    if (n === 2) {
                      dx = kidx === 0 ? -0.12 : 0.12;
                    } else if (n === 3) {
                      const pat = [ [-0.12, -0.07], [0.12, -0.07], [0, 0.12] ];
                      dx = pat[kidx]?.[0] ?? 0; dy = pat[kidx]?.[1] ?? 0;
                    } else if (n >= 4) {
                      const pat = [ [-0.12,-0.12], [0.12,-0.12], [-0.12,0.12], [0.12,0.12] ];
                      const p = pat[kidx % 4] || [0,0]; dx = p[0]; dy = p[1];
                    }
                    return (
                      <g key={`t-${player}-${i}`} className={`token-svg ${player} ${canMoveForThis ? 'can-move' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => { if (player === currentPlayer) handleSelectPiece(i); }}>
                        <circle cx={c+0.5+dx} cy={r+0.5+dy} r={0.32} className="chip" />
                        <text x={c+0.5+dx} y={r+0.56+dy} textAnchor="middle" className="chip-label">{i+1}</text>
                      </g>
                    );
                  })
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

