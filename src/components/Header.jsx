import React, { useState, useEffect } from 'react';

const Header = ({ isDarkMode, toggleTheme }) => {
  const [glitchActive, setGlitchActive] = useState(false);

  const handleGlitchClick = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 300);
  };

  return (
    <header className="relative text-center mb-8 pt-8">
      <h1 className="font-title text-3xl md:text-5xl tracking-wider">
        <span 
          className="glitch-container cursor-pointer" 
          onClick={handleGlitchClick}
        >
          <span 
            id="animated-title"
            className={`text-cyberpunk-green ${glitchActive ? 'animate-glitch' : ''}`}
            style={{
              textShadow: '0 0 5px #00ff8c, 0 0 10px #00ff8c',
              transition: 'text-shadow 0.2s ease-in-out'
            }}
          >
            Zemo's Vault
          </span>
          <div 
            className="glitch-layer"
            style={{
              background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
              opacity: glitchActive ? 0.3 : 0,
              transition: 'opacity 0.1s ease-in-out'
            }}
          >
            Zemo's Vault
          </div>
        </span>
        <span 
          id="alien-emoji" 
          className="cursor-pointer ml-2 text-2xl"
          onClick={handleGlitchClick}
        >
          👾
        </span>
      </h1>
      
      <label 
        htmlFor="theme-toggle" 
        className="cursor-pointer absolute top-1/2 -translate-y-1/2 right-0"
      >
        <input 
          type="checkbox" 
          id="theme-toggle" 
          className="sr-only peer"
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        <div className="relative w-14 h-8 bg-gray-600 rounded-full peer-checked:bg-gray-200 transition-colors">
          <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-gray-700">
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 m-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 m-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </div>
        </div>
      </label>
    </header>
  );
};

export default Header;
