# Hotel IO

A multiplayer hotel game built with Three.js, ECSY, and WebSockets.

## Features

- 3D environment with real-time rendering
- Multiplayer support with WebSocket communication
- Entity Component System (ECS) architecture
- Performance monitoring with stats.js
- Modern UI with Web Components

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/hotel-io.git
cd hotel-io
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `src/` - Source code
  - `components/` - ECSY components
  - `systems/` - ECSY systems
  - `ui/` - Web Components
  - `common/` - Shared utilities and constants
  - `game.ts` - Main game class
  - `main.ts` - Entry point

## Development

### Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Adding New Features

1. Create new components in `src/components/`
2. Create new systems in `src/systems/`
3. Register components and systems in `src/game.ts`

## License

MIT
