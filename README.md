# Zemo's Vault - React Version

A modern React + Tailwind CSS web application converted from the original HTML version. This application provides a cyberpunk-themed interface for browsing computer science lab experiments and code examples.

## Features

- 🎨 **Cyberpunk Design**: Dark theme with neon green accents and glitch effects
- 🌙 **Theme Toggle**: Switch between dark and light modes
- ✨ **Particle Animation**: Dynamic background with animated particles
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎯 **Interactive UI**: Smooth animations and hover effects
- 💻 **Code Highlighting**: Syntax highlighting for C code examples
- 🔍 **Easy Navigation**: Hierarchical selection (Year → Subject → Experiment)

## Technologies Used

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **React Syntax Highlighter** - Code syntax highlighting
- **Prism.js** - Code highlighting themes

## Project Structure

```
zemo-vault-react/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Main header with title and theme toggle
│   │   ├── Selector.jsx        # Year/Subject/Experiment selection
│   │   ├── CodeDisplay.jsx     # Code and output display
│   │   └── ParticleBackground.jsx # Animated particle background
│   ├── data/
│   │   └── labData.js         # Lab experiment data
│   ├── App.jsx                # Main application component
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles and Tailwind imports
├── index.html                # HTML template
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd zemo-vault-react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Breakdown

### Theme System
- Automatic theme persistence using localStorage
- Smooth transitions between dark and light modes
- Cyberpunk green color scheme in dark mode
- Clean, professional look in light mode

### Particle Background
- Canvas-based particle animation
- Particles with random movement and opacity
- Connection lines between nearby particles
- Responsive to window resizing

### Code Display
- Syntax highlighting for C code
- Tabbed interface for multi-part experiments
- Copy-friendly code blocks
- Formatted output display

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interface elements
- Optimized for various screen sizes

## Data Structure

The application uses a hierarchical data structure:

```javascript
{
  "Year": {
    "Subject": {
      "experiment": {
        title: "Experiment Title",
        parts: [
          {
            subtitle: "Part Title",
            code: "C code here",
            output: "Expected output"
          }
        ]
      }
    }
  }
}
```

## Customization

### Colors
The cyberpunk theme uses these main colors:
- Primary: `#00ff8c` (cyberpunk green)
- Background: `#0c0c0c` (dark background)
- Text: `#e0e0e0` (light text)

### Fonts
- **Title**: Bungee (cyberpunk style)
- **Body**: Roboto Mono (monospace)
- **Code**: Fira Code (programming font)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Original HTML Version

This React version was converted from the original HTML file (`z-5-ultimate.html`) while maintaining all functionality and improving the user experience with modern React patterns and Tailwind CSS styling.