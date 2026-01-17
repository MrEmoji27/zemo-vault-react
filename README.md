# 🎮 Zemo's Vault

A cyberpunk-themed lab experiment repository with a built-in arcade. Browse 48+ computer science experiments with syntax highlighting and play 12 classic games.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)

## ✨ Features

### Lab Vault
- 📚 **48 Lab Experiments** across 5 subjects (AI, Computer Networks, DevOps, IOT, ML)
- 🎨 **Syntax Highlighting** with react-syntax-highlighter
- 📁 **File-System Based** - Just drop code files to add experiments
- 🔍 **Easy Navigation** - Year → Subject → Experiment hierarchy

### Arcade
- 🎮 **12 Games**: Tic-Tac-Toe, 2048, Snake, Tetris, Pong, Breakout, Space Invaders, Flappy Bird, Chess (with Stockfish AI), Doom, Fruit Ninja, Coin Flip
- 🎯 **PrimeReact Carousel** for game selection
- 📱 **Mobile Touch Controls** for all games

### UI/UX
- 🌙 **Glassmorphism Design** with neon green accents
- ✨ **Pixel Trail** mouse effect
- 📱 **Fully Responsive** - Works on all devices
- 🎭 **ASCII Art Header** with glitch effects

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
app/
├── components/      # React components (games, UI)
├── labs/           # Lab experiments (file-based)
│   └── 3rd Year/
│       ├── AI/
│       ├── Computer Networks/
│       ├── DevOps/
│       ├── IOT/
│       └── ML/
├── hooks/          # Custom hooks (useStockfish)
├── actions/        # Server actions (getExperiments)
├── page.jsx        # Main app
└── globals.css     # All styles
```

## 🎮 Games Included

| Game | Controls |
|------|----------|
| Chess | Click to move, Stockfish AI opponent |
| 2048 | Arrow keys / Swipe |
| Snake | Arrow keys / WASD |
| Tetris | Arrow keys |
| Pong | W/S keys |
| Space Invaders | Arrows + Space |
| Flappy Bird | Space / Click |
| Breakout | Arrows |

## 🛠 Tech Stack

- **Framework**: Next.js 15
- **UI**: React 19, Tailwind CSS
- **Components**: PrimeReact Carousel
- **Syntax**: react-syntax-highlighter + Prism
- **Chess AI**: Stockfish WebAssembly
- **Fonts**: Bungee, Fira Code

## 📊 Stats

- **Lines of Code**: 16,000+
- **Components**: 28
- **Lab Experiments**: 48
- **Arcade Games**: 12

## 📱 Mobile Support

- Responsive layouts for all screen sizes
- Touch controls for arcade games
- Horizontal scrolling game carousel
- Touch-friendly tap targets

## 🎨 Theme

- **Primary**: `#00ff8c` (Neon Green)
- **Background**: `#0c0c0c` (Dark)
- **Accent**: `#6366f1` (Indigo)

## 📄 License

MIT License - Use freely!

---

Made with 💚 by MrEmoji27