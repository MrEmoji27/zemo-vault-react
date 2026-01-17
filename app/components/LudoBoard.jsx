import React from 'react';
import './LudoBoard.css';

// 15x15 grid helpers
const area = (r, c) => ({ gridArea: `${r} / ${c} / span 1 / span 1` });

const LudoBoard = () => {
  const renderTokens = (color) => (
    <div className={`inner-base ${color}-inner-base`}>
      <div className="token-placeholder"><div className={`token ${color}-token`}></div></div>
      <div className="token-placeholder"><div className={`token ${color}-token`}></div></div>
      <div className="token-placeholder"><div className={`token ${color}-token`}></div></div>
      <div className="token-placeholder"><div className={`token ${color}-token`}></div></div>
    </div>
  );

  // Main plus path segments (rows and cols) using [r, c] pairs
  const row7Cols = [2,3,4,5,6,10,11,12,13,14];
  const col7Rows = [2,3,4,5,6,10,11,12,13,14];
  const row9Cols = [2,3,4,5,6,10,11,12,13,14];
  const col9Rows = [2,3,4,5,6,10,11,12,13,14];

  // Home lanes per color (6 tiles each)
  const yellowLane = [2,3,4,5,6].map(r => [r,8]).concat([[7,8]]);
  const redLane    = [14,13,12,11,10].map(c => [8,c]).concat([[8,9]]);
  const blueLane   = [14,13,12,11,10].map(r => [r,8]).concat([[9,8]]);
  const greenLane  = [2,3,4,5,6].map(c => [8,c]).concat([[8,7]]);

  // Safe star canonical spots (subset)
  const safe = [[7,2],[2,9],[9,14],[14,7]];

  return (
    <div className="ludo-container">
      <div className="ludo-board" role="grid" aria-label="Ludo Board 15x15">
        {/* Bases (spanning 5x5 each) */}
        <div className="player-base green-base" style={{ gridArea: '1 / 1 / 6 / 6' }}>{renderTokens('green')}</div>
        <div className="player-base yellow-base" style={{ gridArea: '1 / 10 / 6 / 15' }}>{renderTokens('yellow')}</div>
        <div className="player-base red-base" style={{ gridArea: '10 / 10 / 15 / 15' }}>{renderTokens('red')}</div>
        <div className="player-base blue-base" style={{ gridArea: '10 / 1 / 15 / 6' }}>{renderTokens('blue')}</div>

        {/* Center (3x3), with four triangles */}
        <div className="center-home" style={{ gridArea: '7 / 7 / 10 / 10' }}>
          <div className="triangle green-triangle" />
          <div className="triangle yellow-triangle" />
          <div className="triangle red-triangle" />
          <div className="triangle blue-triangle" />
        </div>

        {/* Path tiles */}
        {row7Cols.map((c) => (
          <div key={`r7-${c}`} className="path-cell" style={area(7,c)} />
        ))}
        {col7Rows.map((r) => (
          <div key={`c7-${r}`} className="path-cell" style={area(r,7)} />
        ))}
        {row9Cols.map((c) => (
          <div key={`r9-${c}`} className="path-cell" style={area(9,c)} />
        ))}
        {col9Rows.map((r) => (
          <div key={`c9-${r}`} className="path-cell" style={area(r,9)} />
        ))}

        {/* Entry arrows (edge hints) */}
        <div className="path-cell red-path arrow-right" style={area(7,13)} />
        <div className="path-cell green-path arrow-down" style={area(13,7)} />
        <div className="path-cell yellow-path arrow-left" style={area(9,3)} />
        <div className="path-cell blue-path arrow-up" style={area(3,9)} />

        {/* Home lanes */}
        {yellowLane.map(([r,c],i) => (
          <div key={`yl-${i}`} className={`path-cell yellow-path ${i===5?'arrow-up':''}`} style={area(r,c)} />
        ))}
        {redLane.map(([r,c],i) => (
          <div key={`rl-${i}`} className={`path-cell red-path ${i===5?'arrow-left':''}`} style={area(r,c)} />
        ))}
        {blueLane.map(([r,c],i) => (
          <div key={`bl-${i}`} className={`path-cell blue-path ${i===5?'arrow-down':''}`} style={area(r,c)} />
        ))}
        {greenLane.map(([r,c],i) => (
          <div key={`gl-${i}`} className={`path-cell green-path ${i===5?'arrow-right':''}`} style={area(r,c)} />
        ))}

        {/* Safe spots overlay (stars) */}
        {safe.map(([r,c],i) => (
          <div key={`safe-${i}`} className="path-cell safe-spot" style={area(r,c)}>
            <span className="star" />
          </div>
        ))}

        {/* corner anchors */}
        <div className="path-cell" style={area(1,8)} />
        <div className="path-cell" style={area(8,1)} />
        <div className="path-cell" style={area(15,8)} />
        <div className="path-cell" style={area(8,15)} />
      </div>
    </div>
  );
};

export default LudoBoard;
