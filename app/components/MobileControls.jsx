'use client';

import React from 'react';

/** Touch controls for mobile - D-Pad + Action button */
export default function MobileControls({ showArrows = true, showActions = true, onAction = ' ' }) {

  const handlePress = (key) => {
    const event = new KeyboardEvent('keydown', {
      key: key,
      code: key === ' ' ? 'Space' : key,
      bubbles: true,
      cancelable: true,
      view: window
    });
    window.dispatchEvent(event);

    setTimeout(() => {
      const upEvent = new KeyboardEvent('keyup', {
        key: key,
        code: key === ' ' ? 'Space' : key,
        bubbles: true,
        cancelable: true,
        view: window
      });
      window.dispatchEvent(upEvent);
    }, 100);
  };

  return (
    <div className="mobile-controls">
      {showArrows && (
        <div className="d-pad">
          <button className="d-btn d-up" onPointerDown={(e) => { e.preventDefault(); handlePress('ArrowUp'); }}>▲</button>
          <div className="d-row">
            <button className="d-btn d-left" onPointerDown={(e) => { e.preventDefault(); handlePress('ArrowLeft'); }}>◀</button>
            <button className="d-btn d-down" onPointerDown={(e) => { e.preventDefault(); handlePress('ArrowDown'); }}>▼</button>
            <button className="d-btn d-right" onPointerDown={(e) => { e.preventDefault(); handlePress('ArrowRight'); }}>▶</button>
          </div>
        </div>
      )}

      {showActions && (
        <div className="action-pad">
          <button className="d-btn d-action" onPointerDown={(e) => { e.preventDefault(); handlePress(onAction); }}>
            A
          </button>
        </div>
      )}

      <style jsx>{`
        .mobile-controls {
          display: none;
          margin-top: 1rem;
          padding: 1rem;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 16px;
          border: 1px solid rgba(0, 255, 140, 0.2);
          width: 100%;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 768px) {
          .mobile-controls {
            display: flex;
          }
        }

        .d-pad {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .d-row {
          display: flex;
          gap: 8px;
        }

        .d-btn {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(0, 255, 140, 0.15);
          border: 1px solid rgba(0, 255, 140, 0.4);
          color: #00ff8c;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          touch-action: manipulation;
          user-select: none;
          -webkit-user-select: none;
          transition: background 0.1s;
        }

        .d-btn:active {
          background: rgba(0, 255, 140, 0.4);
          transform: scale(0.95);
        }

        .d-action {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border-color: #ff0055;
          color: #ff0055;
          background: rgba(255, 0, 85, 0.15);
          font-weight: bold;
        }

        .d-action:active {
          background: rgba(255, 0, 85, 0.4);
        }
      `}</style>
    </div>
  );
}
