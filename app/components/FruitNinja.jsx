'use client';

import React, { useRef, useEffect, useState } from 'react';

export default function FruitNinja() {
    const canvasRef = useRef(null);
    const gameStateRef = useRef({
        fruits: [],
        particles: [],
        bladeTrail: [],
        score: 0,
        combo: 0,
        comboTimer: 0,
        lives: 3,
        gameOver: false,
        running: false,
        spawnTimer: 0,
        lastTime: Date.now()
    });

    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [running, setRunning] = useState(false);
    const [paused, setPaused] = useState(false);

    const FRUIT_TYPES = [
        { type: 'apple', emoji: '🍎', color: '#ff3b3b', points: 10, size: 40 },
        { type: 'orange', emoji: '🍊', color: '#ff8c00', points: 10, size: 40 },
        { type: 'banana', emoji: '🍌', color: '#ffeb3b', points: 10, size: 45 },
        { type: 'watermelon', emoji: '🍉', color: '#ff006e', points: 15, size: 50 },
        { type: 'bomb', emoji: '💣', color: '#ff0000', points: 0, size: 35 }
    ];

    // Spawn a new fruit
    const spawnFruit = () => {
        const state = gameStateRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 15% chance of bomb
        const isBomb = Math.random() < 0.15;
        const fruitType = isBomb
            ? FRUIT_TYPES[4]
            : FRUIT_TYPES[Math.floor(Math.random() * 4)];

        const fruit = {
            ...fruitType,
            x: Math.random() * (canvas.width - 100) + 50,
            y: canvas.height + 50,
            vx: (Math.random() - 0.5) * 4,
            vy: -(16 + Math.random() * 6), // Upward velocity - balanced for good height
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            sliced: false,
            id: Date.now() + Math.random()
        };

        state.fruits.push(fruit);
    };

    // Create particles on slice
    const createSliceParticles = (x, y, color) => {
        const state = gameStateRef.current;
        const particleCount = 25;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 4;

            state.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                life: 1,
                maxLife: 1,
                size: 2 + Math.random() * 3
            });
        }
    };

    // Check if line segment intersects circle
    const lineCircleIntersection = (x1, y1, x2, y2, cx, cy, radius) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const fx = x1 - cx;
        const fy = y1 - cy;

        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = (fx * fx + fy * fy) - radius * radius;

        let discriminant = b * b - 4 * a * c;

        if (discriminant >= 0) {
            discriminant = Math.sqrt(discriminant);
            const t1 = (-b - discriminant) / (2 * a);
            const t2 = (-b + discriminant) / (2 * a);

            if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
                return true;
            }
        }

        return false;
    };

    // Check blade trail collision with fruits
    const checkCollisions = () => {
        const state = gameStateRef.current;
        const trail = state.bladeTrail;

        if (trail.length < 2) return;

        state.fruits.forEach(fruit => {
            if (fruit.sliced) return;

            for (let i = 1; i < trail.length; i++) {
                const p1 = trail[i - 1];
                const p2 = trail[i];

                if (lineCircleIntersection(p1.x, p1.y, p2.x, p2.y, fruit.x, fruit.y, fruit.size / 2)) {
                    fruit.sliced = true;

                    if (fruit.type === 'bomb') {
                        // Game over on bomb slice
                        state.gameOver = true;
                        state.running = false;
                        setGameOver(true);
                        createSliceParticles(fruit.x, fruit.y, '#ff0000');
                    } else {
                        // Score and combo
                        state.combo++;
                        state.comboTimer = 1.5; // 1.5 seconds to maintain combo
                        const comboMultiplier = Math.min(state.combo, 10);
                        state.score += fruit.points * comboMultiplier;

                        setScore(state.score);
                        setCombo(state.combo);

                        // Create particles
                        createSliceParticles(fruit.x, fruit.y, fruit.color);

                        // Split fruit into two halves
                        const half1 = {
                            ...fruit,
                            vx: fruit.vx - 3,
                            vy: fruit.vy * 0.5,
                            rotationSpeed: -0.3,
                            sliceHalf: 'left'
                        };
                        const half2 = {
                            ...fruit,
                            vx: fruit.vx + 3,
                            vy: fruit.vy * 0.5,
                            rotationSpeed: 0.3,
                            id: fruit.id + 0.1,
                            sliceHalf: 'right'
                        };

                        state.fruits.push(half1, half2);
                    }
                    break;
                }
            }
        });
    };

    // Update game state
    const updateGame = (deltaTime) => {
        const state = gameStateRef.current;
        const canvas = canvasRef.current;
        if (!canvas || !state.running) return;

        const dt = deltaTime / 16.67; // Normalize to 60fps

        // Update spawn timer
        state.spawnTimer -= deltaTime;
        if (state.spawnTimer <= 0) {
            spawnFruit();
            state.spawnTimer = 800 + Math.random() * 1200; // Spawn every 0.8-2 seconds
        }

        // Update combo timer
        if (state.comboTimer > 0) {
            state.comboTimer -= deltaTime / 1000;
            if (state.comboTimer <= 0) {
                state.combo = 0;
                setCombo(0);
            }
        }

        // Update fruits
        state.fruits = state.fruits.filter(fruit => {
            if (fruit.sliced && fruit.y > canvas.height + 100) {
                return false; // Remove sliced fruits that fell off
            }

            // Apply physics
            fruit.vy += 0.4 * dt; // Gravity
            fruit.x += fruit.vx * dt;
            fruit.y += fruit.vy * dt;
            fruit.rotation += fruit.rotationSpeed * dt;

            // Check if unsliced fruit fell off screen
            if (!fruit.sliced && fruit.y > canvas.height + 50) {
                if (fruit.type !== 'bomb') {
                    state.lives--;
                    setLives(state.lives);
                    if (state.lives <= 0) {
                        state.gameOver = true;
                        state.running = false;
                        setGameOver(true);
                    }
                }
                return false;
            }

            return fruit.y < canvas.height + 200;
        });

        // Update particles
        state.particles = state.particles.filter(particle => {
            particle.vy += 0.3 * dt; // Gravity
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.life -= (1 / 60) * dt;
            return particle.life > 0;
        });

        // Update blade trail (remove old points)
        const now = Date.now();
        state.bladeTrail = state.bladeTrail.filter(point => now - point.time < 300);
    };

    // Render game
    const render = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const state = gameStateRef.current;

        // Clear canvas
        ctx.fillStyle = '#0a0a1f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid background
        ctx.strokeStyle = 'rgba(0, 255, 140, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // Draw particles
        state.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw fruits
        state.fruits.forEach(fruit => {
            // Skip the original fruit if it's been sliced (only show the halves)
            if (fruit.sliced && !fruit.sliceHalf) return;

            ctx.save();
            ctx.translate(fruit.x, fruit.y);
            ctx.rotate(fruit.rotation);
            ctx.font = `${fruit.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = fruit.color;

            // Apply clipping for sliced halves
            if (fruit.sliceHalf) {
                ctx.beginPath();
                if (fruit.sliceHalf === 'left') {
                    // Clip left half (from -size to 0)
                    ctx.rect(-fruit.size, -fruit.size, fruit.size, fruit.size * 2);
                } else {
                    // Clip right half (from 0 to size)
                    ctx.rect(0, -fruit.size, fruit.size, fruit.size * 2);
                }
                ctx.clip();
            }

            ctx.fillText(fruit.emoji, 0, 0);
            ctx.restore();
        });

        // Draw blade trail
        if (state.bladeTrail.length > 1) {
            ctx.strokeStyle = '#00ff8c';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ff8c';

            ctx.beginPath();
            ctx.moveTo(state.bladeTrail[0].x, state.bladeTrail[0].y);
            for (let i = 1; i < state.bladeTrail.length; i++) {
                ctx.lineTo(state.bladeTrail[i].x, state.bladeTrail[i].y);
            }
            ctx.stroke();

            ctx.shadowBlur = 0;
        }

        // Draw combo text
        if (state.combo > 1) {
            ctx.font = 'bold 48px "Roboto Mono", monospace';
            ctx.fillStyle = '#ff006e';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff006e';
            ctx.fillText(`${state.combo}x COMBO!`, canvas.width / 2, 80);
            ctx.shadowBlur = 0;
        }

        // Draw game over
        if (state.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = 'bold 64px "Roboto Mono", monospace';
            ctx.fillStyle = '#ff006e';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff006e';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

            ctx.font = 'bold 32px "Roboto Mono", monospace';
            ctx.fillStyle = '#00ff8c';
            ctx.shadowColor = '#00ff8c';
            ctx.fillText(`Final Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 20);
            ctx.shadowBlur = 0;
        }
    };

    // Game loop
    useEffect(() => {
        let animationId;

        const gameLoop = () => {
            const state = gameStateRef.current;
            const now = Date.now();
            const deltaTime = now - state.lastTime;
            state.lastTime = now;

            updateGame(deltaTime);
            checkCollisions();
            render();

            animationId = requestAnimationFrame(gameLoop);
        };

        if (running) {
            gameStateRef.current.lastTime = Date.now();
            gameLoop();
        }

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [running]);

    // Hover-based slicing: track mouse movement without click
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleHover = (e) => {
            if (gameOver) return;
            const state = gameStateRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
            const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
            state.bladeTrail.push({ x, y, time: Date.now() });
            if (state.bladeTrail.length > 20) state.bladeTrail.shift();
        };
        const clearTrail = () => { gameStateRef.current.bladeTrail = []; };
        canvas.addEventListener('mousemove', handleHover);
        canvas.addEventListener('mouseleave', clearTrail);
        return () => {
            canvas.removeEventListener('mousemove', handleHover);
            canvas.removeEventListener('mouseleave', clearTrail);
        };
    }, []);

    // Mouse/Touch handlers
    const handlePointerDown = (e) => {
        if (gameOver) return;
        const state = gameStateRef.current;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

        state.bladeTrail = [{ x, y, time: Date.now() }];
    };

    const handlePointerMove = (e) => {
        if (gameOver) return;
        const state = gameStateRef.current;
        if (state.bladeTrail.length === 0) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

        state.bladeTrail.push({ x, y, time: Date.now() });

        // Limit trail length
        if (state.bladeTrail.length > 20) {
            state.bladeTrail.shift();
        }
    };

    const handlePointerUp = () => {
        const state = gameStateRef.current;
        state.bladeTrail = [];
    };

    // Start game
    const startGame = () => {
        const state = gameStateRef.current;
        state.fruits = [];
        state.particles = [];
        state.bladeTrail = [];
        state.score = 0;
        state.combo = 0;
        state.comboTimer = 0;
        state.lives = 3;
        state.gameOver = false;
        state.running = true;
        state.spawnTimer = 500;

        setScore(0);
        setCombo(0);
        setLives(3);
        setGameOver(false);
        setRunning(true);
        setPaused(false);
    };

    // Pause the game
    const handlePause = () => {
        const state = gameStateRef.current;
        state.running = false;
        state.paused = true;
        setRunning(false);
        setPaused(true);
    };

    // Resume the game
    const handleResume = () => {
        const state = gameStateRef.current;
        state.running = true;
        state.paused = false;
        setRunning(true);
        setPaused(false);
    };

    return (
        <div className="fruit-ninja-wrapper">
            <div className="game-info-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <span style={{ color: '#00ff8c', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Score: {score}
                        </span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <span style={{ color: '#ff006e', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {combo > 1 ? `${combo}x Combo!` : ''}
                        </span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <span style={{ color: lives > 1 ? '#00ff8c' : '#ff006e', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Lives: {lives}
                        </span>
                    </div>
                </div>
            </div>

            <div className="game-stage">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="fruit-ninja-canvas"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                />
            </div>

            <div className="controls-chip" style={{ marginTop: '1rem' }}>
                {!running && !gameOver && (
                    <button className="control-btn" onClick={startGame}>
                        Start Game
                    </button>
                )}
                {gameOver && (
                    <button className="control-btn" onClick={startGame}>
                        Play Again
                    </button>
                )}
                {running && !paused && (
                    <button className="control-btn" onClick={handlePause}>
                        Pause
                    </button>
                )}
                {paused && (
                    <button className="control-btn" onClick={handleResume}>
                        Resume
                    </button>
                )}
                {running && !paused && <span>Swipe to slice fruits! Avoid bombs 💣</span>}
                {paused && <span>Game Paused</span>}
            </div>
        </div>
    );
}
