'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Ported and enhanced from https://codepen.io/JuanFuentes/pen/eYEeoyE
 */

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform bool uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;
    vec3 transformed = position;

    if (uEnableWaves) {
      transformed.x += sin(time + position.y) * .5;
      transformed.y += cos(time + position.z) * .15;
      transformed.z += sin(time + position.x);
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;
uniform bool uEnableWaves;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    
    // float move = sin(time + mouse) * 0.01; // unused in original ported logic effectively, or subtle
    
    float r, g, b;

    if (uEnableWaves) {
      r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
      g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
      b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    } else {
      vec4 tex = texture2D(uTexture, pos);
      r = tex.r;
      g = tex.g;
      b = tex.b;
    }

    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;


// --- Utils ---
const map = (n, start, stop, start2, stop2) => {
    return (n - start) / (stop - start) * (stop2 - start2) + start2;
};

// --- Classes ---

class AsciiFilter {
    constructor(renderer, { fontSize, fontFamily, charset, invert }) {
        this.renderer = renderer;
        this.invert = invert ?? true;
        this.fontSize = fontSize || 14;
        this.fontFamily = fontFamily || "'Courier New', Consolas, monospace";
        this.charset = charset || ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

        // Create DOM elements
        this.domElement = document.createElement("div");
        this.pre = document.createElement("pre");
        this.domElement.appendChild(this.pre);
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d", { willReadFrequently: true });
        // We do not append canvas to domElement because we only use it for reading pixels
        // Wait, the original appended it? "this.domElement.appendChild(this.canvas);"
        // Actually looking at original code, it appends both? 
        // "this.domElement.appendChild(this.pre); this.domElement.appendChild(this.canvas);"
        // The canvas seems to be used to draw the webgl output, then read pixels, then write text to PRE.
        // Usually we want to hide the canvas if we are showing ASCII.
        // The original CSS hides the canvas? "canvas { ... }" doesn't hide it.
        // But "pre" has z-index 9.
        // Let's stick to original structure.
        this.domElement.appendChild(this.canvas);

        this.deg = 0;
        this.center = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0 };

        this.setup();
    }

    setup() {
        this.domElement.style.position = "absolute";
        this.domElement.style.left = "0";
        this.domElement.style.top = "0";
        this.domElement.style.width = "100%";
        this.domElement.style.height = "100%";
        this.domElement.style.overflow = "hidden"; // Ensure no scrollbars

        // Style pre
        this.pre.style.margin = "0";
        this.pre.style.padding = "0";
        this.pre.style.lineHeight = "1em";
        this.pre.style.textAlign = "left";
        this.pre.style.position = "absolute";
        this.pre.style.left = "0";
        this.pre.style.top = "0";
        this.pre.style.width = "100%";
        this.pre.style.height = "100%";
        this.pre.style.fontFamily = this.fontFamily;
        this.pre.style.fontSize = `${this.fontSize}px`;

        // Gradient effect from original CSS
        // We apply it via JS or rely on global CSS? usage of 'this.pre' implies we should style it here 
        // to be self-contained.
        this.pre.style.backgroundImage = "radial-gradient(circle, #ff6188 0%, #fc9867 50%, #ffd866 100%)";
        this.pre.style.backgroundAttachment = "fixed";
        this.pre.style.webkitTextFillColor = "transparent";
        this.pre.style.webkitBackgroundClip = "text";
        this.pre.style.zIndex = "9";
        // this.pre.style.mixBlendMode = "difference"; 

        // Hide canvas visually, we just need it for data extraction
        this.canvas.style.display = "none";

        this.context.imageSmoothingEnabled = false;
    }

    get charWidth() {
        this.context.font = `${this.fontSize}px ${this.fontFamily}`;
        return this.context.measureText("A").width;
    }

    reset(width, height) {
        this.width = width;
        this.height = height;
        // Calculate columns and rows based on font size/aspect
        // The original logic: ~~(this.width / (this.fontSize * (this.charWidth / this.fontSize)));
        // charWidth / fontSize is aspect ratio.
        const aspect = this.charWidth / this.fontSize;
        this.cols = ~~(this.width / (this.fontSize * aspect));
        this.rows = ~~(this.height / this.fontSize);

        this.canvas.width = this.cols;
        this.canvas.height = this.rows;
    }

    setSize(width, height) {
        this.reset(width, height);
        this.center = { x: width / 2, y: height / 2 };
        // If mouse never moved, center it
        if (this.mouse.x === 0 && this.mouse.y === 0) {
            this.mouse = { x: width / 2, y: height / 2 };
        }
    }

    updateMouse(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
    }

    render(scene, camera) {
        // Render 3D scene to canvas
        this.renderer.render(scene, camera);

        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear 2D context
        this.context.clearRect(0, 0, w, h);

        // Draw the webgl canvas (renderer.domElement) scaled down to our grid size
        this.context.drawImage(this.renderer.domElement, 0, 0, w, h);

        // Convert to ASCII
        this.asciify(this.context, w, h);

        // Update Hue
        this.hue();
    }

    hue() {
        const dx = this.mouse.x - this.center.x;
        const dy = this.mouse.y - this.center.y;
        const deg = Math.atan2(dy, dx) * 180 / Math.PI;
        this.deg += (deg - this.deg) * .075;
        this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
    }

    asciify(ctx, w, h) {
        const imgData = ctx.getImageData(0, 0, w, h).data;
        let str = '';
        const charsetLen = this.charset.length - 1;

        // Optimized loop
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (x * 4 + y * 4 * w);
                const r = imgData[i];
                const g = imgData[i + 1];
                const b = imgData[i + 2];
                const a = imgData[i + 3];

                let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
                if (a === 0) gray = 0; // Transparent is black/dark

                // Map gray to char
                // If invert is true: light = index 0 (space), dark = index end ($)
                // Original: if (this.invert) char = this.charset.length - char - 1;
                // Wait, typically dense chars like @ are dark, space is light.
                // If background is white, we want dark chars for dark areas.
                // If using gradient text on transparent/bg, usually we want density => brightness or volume.
                // Let's stick to original logic:
                // let char = ~~((1 - gray) * (this.charset.length - 1));

                let charIdx = ~~((1 - gray) * charsetLen);
                if (this.invert) charIdx = charsetLen - charIdx;

                // Clamp
                charIdx = Math.max(0, Math.min(charIdx, charsetLen));

                str += this.charset[charIdx];
            }
            str += '\n';
        }
        this.pre.textContent = str; // textContent faster than innerHTML
    }
}

class CanvasTxt {
    constructor(txt, { fontFamily, color, fontSize } = {}) {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.fontSize = fontSize || 200;
        this.fontFamily = fontFamily || "Arial, Helvetica, sans-serif";
        this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
        this.color = color || "#ffffff"; // White text for mask usage
        this.txt = txt || "Hello World";
        this.resize(); // Initial sizing
        this.render(); // Initial render
    }

    get texture() { return this.canvas; }

    resize() {
        // Measure first
        this.context.font = this.font;
        const metrics = this.context.measureText(this.txt);
        const w = Math.ceil(metrics.width) || 100;
        const h = Math.ceil((metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 1.5) || this.fontSize;

        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = this.color;
        this.context.font = this.font;
        this.context.textBaseline = 'middle';
        this.context.textAlign = 'center';
        // Draw centered
        this.context.fillText(this.txt, this.canvas.width / 2, this.canvas.height / 2);
    }
}

const ASCIIText = ({
    text = "zemo",
    enableWaves = true,
    asciiFontSize = 8
}) => {
    const containerRef = useRef(null);
    const asciiFilterRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const meshRef = useRef(null);
    const frameIdRef = useRef(null);
    const textObjRef = useRef(null);
    const textureRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const targetRotationRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Setup Three.js
        const width = window.innerWidth;
        const height = window.innerHeight;

        const scene = new THREE.Scene();
        // Camera setup
        const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        camera.position.z = 30; // Original was 35, adjust if needed

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setSize(width, height);
        // We don't append renderer.domElement directly because AsciiFilter handles it internally via a secondary canvas?
        // Actually AsciiFilter writes renderer output to a 2D canvas. 
        // But AsciiFilter expects the renderer passed to it.

        // Setup Filter
        const asciiFilter = new AsciiFilter(renderer, {
            fontSize: asciiFontSize,
            fontFamily: "'IBM Plex Mono', monospace",
            charset: ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
            invert: true
        });

        containerRef.current.appendChild(asciiFilter.domElement);
        asciiFilter.setSize(width, height);

        // Text Texture - reduced size for better readability
        const canvasTxt = new CanvasTxt(text, { fontSize: 100 });
        const texture = new THREE.CanvasTexture(canvasTxt.texture);
        texture.minFilter = THREE.NearestFilter;

        // Material
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            uniforms: {
                uTime: { value: 0 },
                mouse: { value: 0.0 }, // We can map mouse X to this if we want effect
                uTexture: { value: texture },
                uEnableWaves: { value: enableWaves }
            }
        });

        // Mesh - smaller plane for reduced text size
        // Plane covering view. 
        const geometry = new THREE.PlaneGeometry(25, 10, 36, 36);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Refs for loop
        asciiFilterRef.current = asciiFilter;
        rendererRef.current = renderer;
        sceneRef.current = scene;
        cameraRef.current = camera;
        meshRef.current = mesh;
        textObjRef.current = canvasTxt;
        textureRef.current = texture;

        // Event Listeners
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            asciiFilter.setSize(w, h);
        };

        const handleMouseMove = (e) => {
            const x = e.clientX * window.devicePixelRatio;
            const y = e.clientY * window.devicePixelRatio;
            asciiFilter.updateMouse(x, y);

            // Store mouse position for shader uniform
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;

            // Map mouse to rotation targets for parallax effect
            const mx = map(e.clientY, 0, window.innerHeight, 0.5, -0.5);
            const my = map(e.clientX, 0, window.innerWidth, -0.5, 0.5);
            targetRotationRef.current.x = mx;
            targetRotationRef.current.y = my;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        // Start Loop
        let startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const time = (now - startTime) * 0.001;

            // Update Uniforms
            if (mesh.material.uniforms) {
                mesh.material.uniforms.uTime.value = time;
                mesh.material.uniforms.uEnableWaves.value = enableWaves;
                // Normalize mouse position for shader
                const mouseNormalized = (mouseRef.current.x / window.innerWidth) * 2 - 1;
                mesh.material.uniforms.mouse.value = mouseNormalized;
            }

            // Smooth parallax rotation based on mouse position
            mesh.rotation.x += (targetRotationRef.current.x - mesh.rotation.x) * 0.05;
            mesh.rotation.y += (targetRotationRef.current.y - mesh.rotation.y) * 0.05;
            // Add subtle idle sway on z-axis
            mesh.rotation.z = Math.sin(time * 0.2) * 0.05;

            // Render
            asciiFilter.render(scene, camera);

            frameIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameIdRef.current);
            containerRef.current?.removeChild(asciiFilter.domElement);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, []); // Run once on mount

    // Update text/props seamlessly if possible
    useEffect(() => {
        if (textObjRef.current && textureRef.current) {
            textObjRef.current.txt = text;
            textObjRef.current.resize();
            textObjRef.current.render();
            textureRef.current.needsUpdate = true;
        }
    }, [text]);

    useEffect(() => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uEnableWaves.value = enableWaves;
        }
    }, [enableWaves]);

    return (
        <div
            ref={containerRef}
            className="ascii-text-container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1, // Behind everything
                background: '#000000', // Pure black bg
                pointerEvents: 'none',
                overflow: 'hidden'
            }}
        />
    );
};

export default ASCIIText;
