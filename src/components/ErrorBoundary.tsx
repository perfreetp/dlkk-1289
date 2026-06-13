import { Component, type ReactNode } from 'react';
import { RotateCcw, Home, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    try {
      console.error('[App Error] 应用出现异常:', error.message);
    } catch (e) {
      // ignore
    }
  }

  handleReset = () => {
    try {
      if (window && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('career-compass')) {
            try {
              const val = localStorage.getItem(key);
              if (val) JSON.parse(val);
            } catch (e) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
    } catch (e) {
      // ignore
    }
    this.setState({ hasError: false });
    if (window && window.location) {
      window.location.href = '/';
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false });
    if (window && window.location) {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-sun-100 text-sun-500 flex items-center justify-center mb-5">
              <AlertCircle size={32} />
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink-900 mb-3">
              页面暂时开小差了
            </h1>
            <p className="text-ink-500 mb-6">
              别担心，你的数据都还在。试试刷新页面或返回首页，应该就能恢复正常啦。
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={this.handleReset} className="btn-primary">
                <RotateCcw size={16} /> 刷新恢复
              </button>
              <button onClick={this.handleGoHome} className="btn-ghost">
                <Home size={16} /> 返回首页
              </button>
            </div>
            <p className="text-xs text-ink-400 mt-6">
              如果问题持续出现，可以试试清除浏览器缓存后重新打开
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

