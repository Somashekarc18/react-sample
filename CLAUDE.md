# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React 19 + Vite** starter project with minimal setup for rapid development. The project uses:
- React 19.2.7 with React DOM
- Vite 8.1.1 as the build tool and dev server
- Oxlint for linting (Rust-based, faster than traditional linters)
- Hot Module Reloading (HMR) enabled by default

## Architecture

The project follows a simple structure:
- **`src/main.jsx`**: Entry point that mounts the root React component
- **`src/App.jsx`**: Main application component (contains the demo counter)
- **`src/App.css`** & **`src/index.css`**: Global and component-level styles
- **`src/assets/`**: Static assets (SVGs, images)
- **`index.html`**: HTML template that loads the React app via `src/main.jsx`. Contains a small pre-mount `<script>` that reads the saved theme from `localStorage` (falling back to `prefers-color-scheme`) and sets the `dark-mode` class on `<html>` before first paint — this prevents a light-mode flash. Keep it in sync with the theme logic in `src/App.jsx` (`getInitialIsDark`).
- **`vite.config.js`**: Vite configuration with React plugin enabled

React is configured with StrictMode in development to catch potential issues.

## Common Commands

```bash
# Start development server (runs on http://localhost:5173 by default)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview

# Run linter (Oxlint)
npm run lint
```

## Development Workflow

1. **Start dev server**: `npm run dev` - enables hot reloading; edits to files automatically refresh the browser
2. **Write/edit components**: Modify `.jsx` and `.css` files in `src/`
3. **Lint your code**: `npm run lint` to check for issues (no automatic fix mode configured)
4. **Build**: `npm run build` to create optimized production assets in `dist/`

## Notes

- The React Compiler is not enabled in this template due to performance impact on dev/build times. To enable it, refer to [React Compiler documentation](https://react.dev/learn/react-compiler/installation).
- TypeScript is not configured. For a TypeScript setup with type-aware linting, use the `template-react-ts` template instead.
- Oxlint is the default linter (uses Oxc). If you need SWC-based React plugin processing, see [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc).
