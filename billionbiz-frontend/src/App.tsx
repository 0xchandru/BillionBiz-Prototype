import { BrowserRouter } from 'react-router-dom';
import React, { Suspense } from 'react';
import HostDispatcher, { RouteLoadingFallback } from './components/routing/HostDispatcher';

class RouteErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[BillionBiz] Route failed to load', error);
  }

  render() {
    if (this.state.error) {
      return (
        <main role="alert" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
          <section style={{ maxWidth: 420, padding: 28, border: '1px solid #e2e8f0', borderRadius: 16, background: '#fff', boxShadow: '0 12px 32px rgba(15,23,42,.08)' }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 20 }}>This page didn’t finish loading</h1>
            <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>Check your connection and try loading the page again.</p>
            <button type="button" onClick={() => window.location.reload()} style={{ padding: '10px 14px', border: 0, borderRadius: 8, background: '#111827', color: '#fff', fontWeight: 650, cursor: 'pointer' }}>Reload page</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <RouteErrorBoundary>
          <HostDispatcher />
        </RouteErrorBoundary>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
