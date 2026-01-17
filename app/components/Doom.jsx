'use client';

import React, { useState } from 'react';

export default function Doom() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          aspectRatio: '4/3',
          height: 'auto',
          margin: '0 auto',
          border: '2px solid var(--neon-green)',
          boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
          background: '#000',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--neon-green)',
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              zIndex: 1,
            }}
          >
            Loading DOOM...
          </div>
        )}
        <iframe
          src="https://raz0red.github.io/webprboom/"
          title="DOOM - WebPrBoom"
          width="100%"
          height="100%"
          style={{
            border: 'none',
            display: 'block',
          }}
          onLoad={() => setLoading(false)}
          allow="autoplay; fullscreen; gamepad"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
        />
      </div>
      <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.5rem', fontFamily: 'monospace' }}>
        DOOM via WebPrBoom | Controls: WASD/Arrows, Mouse, Space to fire, E to use
      </p>
    </div>
  );
}
