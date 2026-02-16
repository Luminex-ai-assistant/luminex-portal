import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api/cache';
import App from '@/App';
import '@/styles/globals.css';

// Debug: Log initialization
console.log('🚀 Portal starting...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  console.log('✅ Root element found');

  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
  
  console.log('✅ React app rendered');
} catch (error) {
  console.error('❌ Failed to start app:', error);
  document.body.innerHTML = `
    <div style="
      padding: 2rem;
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
    ">
      <h1 style="color: #ef4444;">Failed to Load Portal</h1>
      <pre style="
        background: #1e293b;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow: auto;
        color: #94a3b8;
      ">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
