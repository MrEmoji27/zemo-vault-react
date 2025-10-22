import React, { useEffect, useRef, useState } from 'react';

const JS_DOS_JS = 'https://js-dos.com/8.0/current/js-dos.js';
const JS_DOS_CSS = 'https://js-dos.com/8.0/current/js-dos.css';
const WDOSBOX = 'https://js-dos.com/8.0/current/wdosbox.js';

function loadOnce(url, tag) {
  return new Promise((resolve, reject) => {
    // If already loaded
    if (tag === 'script' && document.querySelector(`script[src="${url}"]`)) return resolve();
    if (tag === 'link' && document.querySelector(`link[href="${url}"]`)) return resolve();

    let el;
    if (tag === 'script') {
      el = document.createElement('script');
      el.src = url;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = (e) => reject(e);
      document.head.appendChild(el);
    } else if (tag === 'link') {
      el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = url;
      el.onload = () => resolve();
      el.onerror = (e) => reject(e);
      document.head.appendChild(el);
    }
  });
}

function Doom() {
  const containerRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let client = null;
    let disposed = false;

    (async () => {
      try {
        if (!containerRef.current) return;

        await loadOnce(JS_DOS_CSS, 'link');
        await loadOnce(JS_DOS_JS, 'script');

        const Dos = window.Dos;
        if (!Dos) throw new Error('js-dos failed to load');

        client = Dos(containerRef.current, { wdosboxUrl: WDOSBOX });
        await client.run('/doom/doom.zip');
        if (disposed && client) client.exit();
      } catch (e) {
        console.error(e);
        setError('Missing js-dos assets or /doom/doom.zip. Place a DOS Doom-compatible zip (e.g., Freedoom) into public/doom/doom.zip and reload.');
      }
    })();

    return () => {
      disposed = true;
      try { if (client) client.exit(); } catch {}
    };
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        style={{ width: 640, height: 400, margin: '0 auto', border: '2px solid #00ff8c' }}
      />
      {error && (
        <p className="text-center text-green mt-4" style={{ maxWidth: 700, margin: '1rem auto' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Doom;
