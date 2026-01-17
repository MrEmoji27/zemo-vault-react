'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { useStockfish } from '../hooks/useStockfish';

// Neon Theme Colors
const COLORS = {
    board: 'transparent', // Let CSS background show through
    grid: 'rgba(0, 255, 140, 0.2)',
    whitePiece: '#00ff8c',   // Neon Green
    blackPiece: '#ff3333',   // Neon Red
    moveHighlight: 'rgba(0, 255, 140, 0.3)',
    captureHighlight: 'rgba(255, 51, 51, 0.4)',
    checkHighlight: 'rgba(255, 64, 64, 0.6)'
};

const PIECE_UNICODE = {
    p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚'
};

const ChessCanvas = () => {
    const canvasRef = useRef(null);
    const [game, setGame] = useState(new Chess());
    const [difficulty, setDifficulty] = useState('intermediate');
    const [status, setStatus] = useState('White to move');

    // Engine Hook
    const { isReady, bestMove, isThinking, requestMove, resetEngine } = useStockfish(difficulty);

    // Visual State
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [legalMoves, setLegalMoves] = useState([]);
    const [particles, setParticles] = useState([]);

    // Board Metrics
    const BOARD_SIZE = 600;
    const SQUARE_SIZE = BOARD_SIZE / 8;

    // History State for Redo (use state for reactivity)
    const [undoneMoves, setUndoneMoves] = useState([]);

    // --- Engine Interaction ---

    // Effect: Handle Engine Move
    useEffect(() => {
        if (bestMove) {
            const from = bestMove.substring(0, 2);
            const to = bestMove.substring(2, 4);
            const promotion = bestMove.length > 4 ? bestMove.substring(4, 5) : undefined;

            try {
                const move = game.move({ from, to, promotion: promotion || 'q' });
                if (move) {
                    // Clear redo history on new move
                    setUndoneMoves([]);

                    // Create particles for capture
                    if (move.captured) {
                        createExplosion(
                            (move.to.charCodeAt(0) - 97) * SQUARE_SIZE + SQUARE_SIZE / 2,
                            (8 - parseInt(move.to[1])) * SQUARE_SIZE + SQUARE_SIZE / 2,
                            COLORS.whitePiece,
                            30 // More particles for AI capture
                        );
                    }
                    setGame(new Chess(game.fen())); // Trigger re-render
                }
            } catch (e) {
                console.error("Invalid engine move:", bestMove);
            }
        }
    }, [bestMove]); // game dependency removed to avoid loops, relying on setGame

    // Effect: Request AI Move when it's Black's turn
    useEffect(() => {
        if (!game.isGameOver() && game.turn() === 'b' && !isThinking) {
            requestMove(game.fen());
        }
        updateStatus();
    }, [game, isThinking, requestMove]);

    const updateStatus = () => {
        if (game.isGameOver()) {
            if (game.isCheckmate()) setStatus(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins`);
            else if (game.isDraw()) setStatus('Draw!');
            else setStatus('Game Over');
        } else {
            setStatus(game.turn() === 'w' ? 'Your Turn' : 'AI Thinking...');
        }
    };

    // --- Particle System ---
    const createExplosion = (x, y, color, count = 20) => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            const speed = Math.random() * 4 + 2;
            const angle = Math.random() * Math.PI * 2;
            newParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: color,
                decay: 0.02 + Math.random() * 0.03
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    };

    const createMoveTrail = (fromX, fromY, toX, toY, color) => {
        const dist = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const steps = dist / 20; // Particle every 20px
        const newParticles = [];

        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            newParticles.push({
                x: fromX + (toX - fromX) * t,
                y: fromY + (toY - fromY) * t + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                life: 0.6,
                color: color,
                decay: 0.05
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    };

    // Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        let animationId;

        const render = () => {
            if (!ctx) return;

            // Clear
            // Clear
            ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
            // Optional: Slight tint if needed, but relies on CSS for glass
            // ctx.fillStyle = 'rgba(10, 10, 31, 0.3)';
            // ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

            // Draw Glass Checkerboard
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const isDark = (r + c) % 2 === 1;
                    if (isDark) {
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Dark glass squares
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Light glass squares
                    }
                    ctx.fillRect(c * SQUARE_SIZE, r * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
                }
            }

            // Draw Grid Lines (Subtle overlay)
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            for (let i = 0; i <= 8; i++) {
                ctx.beginPath();
                ctx.moveTo(i * SQUARE_SIZE, 0);
                ctx.lineTo(i * SQUARE_SIZE, BOARD_SIZE);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, i * SQUARE_SIZE);
                ctx.lineTo(BOARD_SIZE, i * SQUARE_SIZE);
                ctx.stroke();
            }

            // Draw Highlights
            if (selectedSquare) {
                const x = (selectedSquare.charCodeAt(0) - 97) * SQUARE_SIZE;
                const y = (8 - parseInt(selectedSquare[1])) * SQUARE_SIZE;
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
            }

            legalMoves.forEach(move => {
                const x = (move.to.charCodeAt(0) - 97) * SQUARE_SIZE;
                const y = (8 - parseInt(move.to[1])) * SQUARE_SIZE;

                if (move.captured) {
                    ctx.fillStyle = COLORS.captureHighlight;
                    ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
                } else {
                    ctx.fillStyle = COLORS.moveHighlight;
                    ctx.beginPath();
                    ctx.arc(x + SQUARE_SIZE / 2, y + SQUARE_SIZE / 2, SQUARE_SIZE / 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // Draw Check Highlight
            if (game.inCheck()) {
                const board = game.board();
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const p = board[r][c];
                        if (p && p.type === 'k' && p.color === game.turn()) {
                            ctx.shadowBlur = 30;
                            ctx.shadowColor = 'red';
                            ctx.fillStyle = COLORS.checkHighlight;
                            ctx.beginPath();
                            ctx.arc(c * SQUARE_SIZE + SQUARE_SIZE / 2, r * SQUARE_SIZE + SQUARE_SIZE / 2, SQUARE_SIZE / 2.5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.shadowBlur = 0;
                        }
                    }
                }
            }

            // Draw Pieces
            const board = game.board();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${SQUARE_SIZE * 0.7}px Arial`;

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = board[r][c];
                    if (piece) {
                        const x = c * SQUARE_SIZE + SQUARE_SIZE / 2;
                        const y = r * SQUARE_SIZE + SQUARE_SIZE / 2;

                        ctx.fillStyle = piece.color === 'w' ? COLORS.whitePiece : COLORS.blackPiece;
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = ctx.fillStyle;
                        ctx.fillText(PIECE_UNICODE[piece.type], x, y);
                        ctx.shadowBlur = 0;
                    }
                }
            }

            // Draw Particles
            if (particles.length > 0) {
                setParticles(prev => prev.filter(p => {
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.shadowBlur = 10 * p.life;
                    ctx.shadowColor = p.color;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, Math.max(0, 3 * p.life), 0, Math.PI * 2);
                    ctx.fill();

                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= p.decay || 0.05;
                    return p.life > 0;
                }));
                ctx.globalAlpha = 1.0;
                ctx.shadowBlur = 0;
            }

            animationId = requestAnimationFrame(render);
        };
        render();

        return () => cancelAnimationFrame(animationId);
    }, [game, selectedSquare, legalMoves, particles]);


    // --- Interaction ---
    const handleCanvasClick = (e) => {
        if (game.isGameOver() || (game.turn() === 'b' && !game.isGameOver())) return;

        const rect = canvasRef.current.getBoundingClientRect();
        // Calculate scaling if canvas is resized via CSS
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const file = Math.floor(x / SQUARE_SIZE);
        const rank = 7 - Math.floor(y / SQUARE_SIZE);

        if (file < 0 || file > 7 || rank < 0 || rank > 7) return;

        const square = `${String.fromCharCode(97 + file)}${rank + 1}`;
        const piece = game.get(square);

        // Move Logic
        if (selectedSquare) {
            // Check if clicking same square (deselect)
            if (square === selectedSquare) {
                setSelectedSquare(null);
                setLegalMoves([]);
                return;
            }

            // Attempt Move
            try {
                const move = game.move({
                    from: selectedSquare,
                    to: square,
                    promotion: 'q' // Auto-promote to Queen for simplicity
                });

                if (move) {
                    // Valid Move
                    // Clear redo history
                    setUndoneMoves([]);

                    const fromX = (selectedSquare.charCodeAt(0) - 97) * SQUARE_SIZE + SQUARE_SIZE / 2;
                    const fromY = (8 - parseInt(selectedSquare[1])) * SQUARE_SIZE + SQUARE_SIZE / 2;
                    const toX = x; // Approximate click pos
                    const toY = y;

                    createMoveTrail(fromX, fromY, toX, toY, COLORS.moveHighlight);

                    if (move.captured) {
                        createExplosion(
                            (move.to.charCodeAt(0) - 97) * SQUARE_SIZE + SQUARE_SIZE / 2,
                            (8 - parseInt(move.to[1])) * SQUARE_SIZE + SQUARE_SIZE / 2,
                            COLORS.blackPiece
                        );
                    }
                    setGame(new Chess(game.fen()));
                    setSelectedSquare(null);
                    setLegalMoves([]);
                    return;
                }
            } catch (e) {
                // Invalid move, fall through to selection logic
            }
        }

        // Selection Logic
        if (piece && piece.color === 'w') {
            setSelectedSquare(square);
            setLegalMoves(game.moves({ square: square, verbose: true }));
        } else {
            setSelectedSquare(null);
            setLegalMoves([]);
        }
    };

    const handleReset = () => {
        setGame(new Chess());
        setParticles([]);
        setSelectedSquare(null);
        setLegalMoves([]);
        setDifficulty('intermediate'); // Reset visual, though state might persist
        resetEngine();
    };

    const handleUndo = () => {
        if (game.history().length === 0) return;

        let movesToUndo = 1;
        if (game.turn() === 'w' && game.history().length >= 2 && !game.isGameOver()) {
            movesToUndo = 2;
        }

        const newUndone = [];
        for (let i = 0; i < movesToUndo; i++) {
            const move = game.undo();
            if (move) newUndone.push(move);
        }
        setUndoneMoves(prev => [...prev, ...newUndone]);

        setGame(new Chess(game.fen()));
        setParticles([]);
        setLegalMoves([]);
        setSelectedSquare(null);
    };

    const handleRedo = () => {
        if (undoneMoves.length === 0) return;

        let movesToRedo = 1;
        if (undoneMoves.length >= 2) {
            const last = undoneMoves[undoneMoves.length - 1];
            const prev = undoneMoves[undoneMoves.length - 2];
            if (last.color === 'w' && prev.color === 'b') {
                movesToRedo = 2;
            }
        }

        const remaining = [...undoneMoves];
        for (let i = 0; i < movesToRedo; i++) {
            const move = remaining.pop();
            if (move) game.move(move);
        }
        setUndoneMoves(remaining);

        setGame(new Chess(game.fen()));
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto p-4">
            {/* Header / HUD */}
            <div className="flex justify-between items-center w-full bg-black/40 p-4 rounded-lg border border-[#00ff8c]/30 backdrop-blur-sm">
                <div className="text-[#00ff8c] font-mono text-xl font-bold glow-text">
                    CHESS TERMINAL
                </div>
                <div className="text-white/80 font-mono">
                    {status}
                </div>
                <div className="flex gap-2">
                    {['beginner', 'intermediate', 'pro'].map(level => (
                        <button
                            key={level}
                            onClick={() => {
                                setDifficulty(level);
                                resetEngine();
                            }}
                            className={`px-3 py-1 rounded text-sm font-bold transition-all border ${difficulty === level
                                ? 'bg-[#00ff8c]/20 border-[#00ff8c] text-[#00ff8c] shadow-[0_0_10px_rgba(0,255,140,0.3)]'
                                : 'border-transparent text-gray-500 hover:text-white'
                                }`}
                        >
                            {level.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas Container with Glassmorphism */}
            <div className="relative p-6 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                <div className="relative rounded-lg shadow-2xl overflow-hidden border border-white/5 bg-[#0a0a1f]/60">
                    <canvas
                        ref={canvasRef}
                        width={BOARD_SIZE}
                        height={BOARD_SIZE}
                        onClick={handleCanvasClick}
                        className="cursor-pointer touch-none max-w-full h-auto"
                        style={{ maxHeight: '75vh' }}
                    />

                    {/* Thinking Overlay */}
                    {isThinking && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none bg-black/60 rounded-full px-3 py-1 border border-[#ff3333]/50 backdrop-blur-sm">
                            <div className="w-3 h-3 bg-[#ff3333] rounded-full animate-ping"></div>
                            <span className="text-[#ff3333] font-mono text-xs font-bold">CALCULATING...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <button
                    onClick={handleReset}
                    className="control-btn"
                >
                    NEW GAME
                </button>
                <button
                    onClick={handleUndo}
                    className="control-btn"
                    disabled={game.history().length === 0}
                >
                    UNDO
                </button>
                <button
                    onClick={handleRedo}
                    className="control-btn"
                    disabled={undoneMoves.length === 0}
                >
                    REDO
                </button>
            </div>

            <div className="text-white/40 text-xs font-mono mt-4">
                * Pro Mode is powered by Stockfish 16 // WebAssembly
            </div>
        </div>
    );
};

export default ChessCanvas;
