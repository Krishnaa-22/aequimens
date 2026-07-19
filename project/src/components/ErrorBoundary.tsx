import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Icon } from './Icon';

interface State { hasError: boolean; }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Aequimens UI error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
        <div className="w-full max-w-md rounded-3xl border border-silver bg-white p-7 text-center shadow-soft-lg">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-olive-tint text-olive-primary"><Icon name="AlertTriangle" size={24} /></span>
          <h1 className="mt-5 text-2xl font-bold text-ink">Something did not load correctly</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">Your local data has not been deleted. Reload Aequimens to try again.</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-6 w-full"><Icon name="RefreshCw" size={17} /> Reload app</button>
        </div>
      </div>
    );
  }
}
