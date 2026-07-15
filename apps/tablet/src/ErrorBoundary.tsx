import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  failed: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Pixel Pals encountered an unrecoverable render error.', error, info);
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="app-shell">
        <section className="storybook-panel loading-panel" role="alert">
          <div className="welcome-copy">
            <p className="eyebrow">The story paused safely</p>
            <h1>Pixel Pals needs a fresh start</h1>
            <p className="intro">Your saved world has not been erased. Reload the app to try opening it again.</p>
            <button className="inline-action" type="button" onClick={() => window.location.reload()}>
              Reload Pixel Pals
            </button>
          </div>
        </section>
      </main>
    );
  }
}
