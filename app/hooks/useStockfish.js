import { useEffect, useRef, useState, useCallback } from 'react';

// Difficulty levels map to Stockfish skill levels (0-20)
const DIFFICULTY_LEVELS = {
    beginner: 2,   // Very prone to mistakes
    intermediate: 10, // Solid play
    pro: 20       // Grandmaster level
};

export function useStockfish(difficulty = 'intermediate') {
    const engine = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [bestMove, setBestMove] = useState(null);
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        // Initialize worker
        try {
            engine.current = new Worker('/stockfish.js');

            engine.current.onmessage = (event) => {
                const line = event.data;

                if (line === 'uciok') {
                    setIsReady(true);
                } else if (line.startsWith('bestmove')) {
                    const move = line.split(' ')[1];
                    setBestMove(move);
                    setIsThinking(false);
                }
            };

            // Initialize engine
            engine.current.postMessage('uci');
            engine.current.postMessage('isready');
        } catch (error) {
            console.error('Failed to load Stockfish:', error);
        }

        return () => {
            if (engine.current) {
                engine.current.terminate();
            }
        };
    }, []);

    useEffect(() => {
        if (isReady && engine.current) {
            // Configure difficulty
            const level = DIFFICULTY_LEVELS[difficulty] || 10;
            engine.current.postMessage(`setoption name Skill Level value ${level}`);

            // Limit think time to be responsive for lower levels
            // Pro level gets more time
            const moveTime = difficulty === 'pro' ? 2000 : 1000;
        }
    }, [difficulty, isReady]);

    const requestMove = useCallback((fen) => {
        if (!engine.current || !isReady) return;

        setIsThinking(true);
        setBestMove(null);

        engine.current.postMessage(`position fen ${fen}`);

        // Dynamic thinking time based on difficulty
        const moveTime = difficulty === 'pro' ? 2000 : (difficulty === 'intermediate' ? 1000 : 500);

        // Add random variation for lower levels so it doesn't play instantly
        //const randomDelay = Math.random() * 500; 

        engine.current.postMessage(`go movetime ${moveTime}`);
    }, [difficulty, isReady]);

    const resetEngine = useCallback(() => {
        if (engine.current) {
            engine.current.postMessage('ucinewgame');
            engine.current.postMessage('isready');
        }
    }, []);

    return { isReady, bestMove, isThinking, requestMove, resetEngine };
}
