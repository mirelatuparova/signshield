import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted Inter (само реално използваните тегла: 400/500/600) вместо
// render-blocking <link> към fonts.googleapis.com — виж index.html.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import './index.css';
import App from './App.tsx';

// Входна точка — монтира React дървото в #root (index.html).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
