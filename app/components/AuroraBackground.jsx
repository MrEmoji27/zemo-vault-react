'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Aurora Background - Subtle ambient glow effect
 * Cyberpunk-themed with purple/green gradients
 */
const AuroraBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const animate = () => {
            time += 0.005;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create gradient aurora effect
            const gradient1 = ctx.createRadialGradient(
                canvas.width * 0.2 + Math.sin(time) * 100,
                canvas.height * 0.3 + Math.cos(time * 0.8) * 100,
                0,
                canvas.width * 0.2,
                canvas.height * 0.3,
                canvas.width * 0.6
            );
            gradient1.addColorStop(0, 'rgba(99, 102, 241, 0.08)'); // Purple
            gradient1.addColorStop(1, 'rgba(99, 102, 241, 0)');

            const gradient2 = ctx.createRadialGradient(
                canvas.width * 0.8 + Math.cos(time * 1.2) * 100,
                canvas.height * 0.7 + Math.sin(time * 0.9) * 100,
                0,
                canvas.width * 0.8,
                canvas.height * 0.7,
                canvas.width * 0.5
            );
            gradient2.addColorStop(0, 'rgba(0, 255, 140, 0.06)'); // Green
            gradient2.addColorStop(1, 'rgba(0, 255, 140, 0)');

            // Draw gradients
            ctx.fillStyle = gradient1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = gradient2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -2,
                pointerEvents: 'none',
                opacity: 0.4 // Subtle effect
            }}
        />
    );
};

export default AuroraBackground;
