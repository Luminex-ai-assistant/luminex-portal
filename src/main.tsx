import React from 'react';
import { createRoot } from 'react-dom/client';

// Minimal test - just render a div
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <div style={{
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      background: '#0f172a',
      color: '#f8fafc',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#6366f1' }}>✅ Luminex Portal Loaded!</h1>
      <p>React is working. The full app will be restored once this test passes.</p>
      <button onClick={() => window.location.reload()} style={{
        padding: '0.75rem 1.5rem',
        background: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        marginTop: '1rem'
      }}>
        Reload
      </button>
    </div>
  );
} else {
  document.body.innerHTML = '<div style="padding:2rem;color:#ef4444">Root element not found</div>';
}
