import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    try {
      if (window && window.localStorage) {
        localStorage.setItem(
          'career-compass-error',
          JSON.stringify({
            message: error.message,
            stack: error.stack,
            time: new Date().toISOString(),
          })
        );
      }
    } catch (e) {
      // ignore
    }
  }

  handleReset = () => {
    try {
      if (window && window.localStorage) {
        const corruptedKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('career-compass')) {
            try {
              const val = localStorage.getItem(key);
              if (val) JSON.parse(val);
            } catch (e) {
              corruptedKeys.push(key);
            }
          }
        }
        corruptedKeys.forEach((k) => localStorage.removeItem(k));
      }
    } catch (e) {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-5">
              <AlertTriangle size={32} />
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink-900 mb-2">
              出现了一点小问题
            </h1>
            <p className="text-ink-500 mb-4">
              应用遇到了一个意外错误，为了保护你的数据，我们暂停了当前操作。
            </p>
            {this.state.error && (
              <div className="bg-ink-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-ink-500 font-mono break-all">
                  {this.state.error.message || '未知错误'}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={this.handleReset} className="btn-primary">
                <RotateCcw size={16} /> 重置并恢复
              </button>
              <button onClick={this.handleGoHome} className="btn-ghost">
                <Home size={16} /> 返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
