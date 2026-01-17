'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Pixel Trail - 8-bit style mouse cursor trail
 * Creates pixelated blocks that follow the mouse
 */
const PixelTrail = () => {
    const canvasRef = useRef(null);
    const pixelsRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Pixel class for trail effect
        class Pixel {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 8 + Math.random() * 8; // 8-16px blocks
                this.life = 1.0;
                this.decay = 0.02 + Math.random() * 0.03;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.color = Math.random() > 0.5 ? '#00ff8c' : '#6366f1';
            }

            update() {
                this.life -= this.decay;
                this.x += this.vx;
                this.y += this.vy;
            }

            draw(ctx) {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.life * 0.5;
                ctx.fillRect(
                    Math.floor(this.x / this.size) * this.size,
                    Math.floor(this.y / this.size) * this.size,
                    this.size,
                    this.size
                );
            }

            isDead() {
                return this.life <= 0;
            }
        }

        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;

            // Add new pixels on mouse move
            if (pixelsRef.current.length < 50) {
                pixelsRef.current.push(new Pixel(e.clientX, e.clientY));
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw pixels
            pixelsRef.current = pixelsRef.current.filter(pixel => {
                pixel.update();
                if (!pixel.isDead()) {
                    pixel.draw(ctx);
                    return true;
                }
                return false;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
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
                zIndex: 9998,
                pointerEvents: 'none',
                mixBlendMode: 'screen'
            }}
        />
    );
};

export default PixelTrail;
