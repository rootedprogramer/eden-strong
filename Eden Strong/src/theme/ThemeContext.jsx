// ThemeContext.jsx
// Wraps the app. Sets the active path's tokens as CSS custom properties on
// the document root, so existing components can adopt them gradually via
// var(--es-primary) etc. instead of requiring a big-bang rewrite.
//
// Inside any component:
//   const { path, tokens, setPath } = useTheme();

import { createContext, useContext, useEffect, useState } from 'react';
import { PATHS, TYPE, SPACE, RADIUS, DEFAULT_PATH, getTokens } from './theme';

const ThemeContext = createContext(null);

function applyCssVars(tokens) {
  const root = document.documentElement;
  root.style.setProperty('--es-canvas', tokens.canvas);
  root.style.setProperty('--es-primary', tokens.primary);
  root.style.setProperty('--es-secondary', tokens.secondary);
  root.style.setProperty('--es-accent', tokens.accent);
  root.style.setProperty('--es-text', tokens.text);
  root.style.setProperty('--es-surface', tokens.surface);
  root.style.setProperty('--es-font-display', TYPE.fontDisplay);
  root.style.setProperty('--es-font-body', TYPE.fontBody);
  root.style.setProperty('--es-radius-card', RADIUS.card);
  root.style.setProperty('--es-radius-control', RADIUS.control);
  root.style.setProperty('--es-space-gutter', SPACE.gutter);
}

export function ThemeProvider({ initialPath, children }) {
  const [path, setPath] = useState(
    initialPath && PATHS[initialPath] ? initialPath : DEFAULT_PATH
  );

  useEffect(() => {
    applyCssVars(getTokens(path));
  }, [path]);

  return (
    <ThemeContext.Provider value={{ path, setPath, tokens: getTokens(path) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a <ThemeProvider>');
  }
  return ctx;
}
