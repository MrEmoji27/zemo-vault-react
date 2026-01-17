'use client';
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function MatrixWatermark({ isDark }) {
    const meshRef = useRef();

    // Create the "ZEMO" text texture once
    const textTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Fill with black (transparent in shader logic if desired, or just mask)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw "ZEMO" text in white to act as a mask
        ctx.fillStyle = 'white';
        // Use a pixel font if available or fallback to monospace
        // Since we downloaded the font, it might not be available to Canvas API immediately strictly by name
        // We'll use a robust fallback stack. The shader will use the brightness of this text as a mask.
        ctx.font = 'bold 180px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ZEMO', canvas.width / 2, canvas.height / 2);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter; // Keeping some smoothness can help the mask edges
        return tex;
    }, []);

    // Ensure the font is loaded before drawing if possible, avoiding blank text
    useEffect(() => {
        document.fonts.load('180px "Press Start 2P"').then(() => {
            // We could re-trigger texture generation here if needed, 
            // but normally the fallback monospace is fine until reload.
            // For simplicity in this step, we trust the font or monospace will render something.
            textTexture.needsUpdate = true;
        });
    }, [textTexture]);


    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                textTexture: { value: textTexture },
                isDark: { value: isDark ? 1.0 : 0.0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform sampler2D textTexture;
                uniform float isDark;
                varying vec2 vUv;

                // Function to create the matrix/dot pattern
                float matrix(vec2 uv) {
                    // Grid size for dots
                    float rows = 50.0;
                    vec2 grid = fract(uv * rows);
                    
                    // Random drop speed for each column
                    float columnRandom = fract(sin(dot(floor(uv * rows).x, 12.9898)) * 43758.5453);
                    float dropSpeed = time * (0.5 + 0.5 * columnRandom);
                    
                    // Vertical movement
                    float verticalPos = fract(uv.y * rows + dropSpeed);
                    
                    // Create simple dot shape
                    float dot = step(0.5, grid.x) * step(0.5, grid.y); // Square dots
                    
                    // Fading trail effect
                    float trail = smoothstep(0.0, 1.0, verticalPos);
                    
                    // Random flicker
                    float flicker = step(0.95, fract(sin(time * 10.0 + uv.x * 100.0) * 43758.5453));
                    
                    return dot * trail + flicker * 0.2;
                }

                void main() {
                    // 1. Get the text mask (white = 1, black = 0)
                    vec4 maskColor = texture2D(textTexture, vUv);
                    float mask = maskColor.r; // Use red channel as mask intensity

                    // 2. Generate Matrix Dot Pattern
                    float matrixPattern = matrix(vUv);

                    // 3. Define Colors
                    vec3 darkColor = vec3(0.0, 1.0, 0.55); // Neon Green/Cyan
                    vec3 lightColor = vec3(1.0, 0.0, 1.0); // Neon Magenta
                    vec3 baseColor = mix(lightColor, darkColor, isDark);

                    // 4. Combine: Pattern shows ONLY inside the text mask
                    // We multiply the pattern by the mask. 
                    // mask is 1.0 inside letters, 0.0 outside.
                    vec3 finalColor = baseColor * matrixPattern * mask;

                    // Add a faint outline or glow to the text itself so it's readable 
                    // even when dots are momentarily dark
                    float textOutline = mask * 0.15; 
                    finalColor += baseColor * textOutline;

                    gl_FragColor = vec4(finalColor, mask); // Use mask as alpha
                }
            `,
            transparent: true,
        });
    }, [textTexture, isDark]);

    useFrame((state) => {
        if (shaderMaterial) {
            shaderMaterial.uniforms.time.value = state.clock.elapsedTime;
            shaderMaterial.uniforms.isDark.value = isDark ? 1.0 : 0.0;
        }
    });

    return (
        <mesh ref={meshRef} material={shaderMaterial}>
            <planeGeometry args={[10, 2.5]} />
        </mesh>
    );
}

export default function ASCIIBackground({ isDark = true }) {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -2,
                pointerEvents: 'none',
                background: isDark ? '#050505' : '#f0f0f0',
                transition: 'background 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                gl={{ alpha: true, antialias: true }}
                style={{ width: '100%', height: '100%' }}
            >
                <MatrixWatermark isDark={isDark} />
            </Canvas>
        </div>
    );
}
