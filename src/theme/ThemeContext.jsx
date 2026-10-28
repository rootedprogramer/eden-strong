// ThemeContext.jsx
// Wraps the app. Sets the active path's tokens as CSS custom properties on
// the document root, so existing components can adopt them gradually via
// var(--es-primary) etc. instead of requiring a big-bang rewrite.
//
// Inside any component:
//   const { path, tokens, setPath } = useTheme();

import { createContext, useContext, useEffect, useState } from 'react';
import { PATHS, DEFAULT_PATH, getTokens } from './theme';

const ThemeContext = createContext(null);

const COLOR_KEYS = ['ink', 'bg', 'bgWarm', 'gold', 'sage', 'olive', 'rose', 'mute', 'line'];

function applyCssVars(tokens) {
  const root = document.documentElement;
  for (const key of COLOR_KEYS) root.style.setProperty(`--es-${key}`, tokens[key]);
  root.style.setProperty('--es-canvas', tokens.bg);
  root.style.setProperty('--es-primary', tokens.gold);
  root.style.setProperty('--es-text', tokens.ink);
  document.body.style.background = tokens.bg;
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
