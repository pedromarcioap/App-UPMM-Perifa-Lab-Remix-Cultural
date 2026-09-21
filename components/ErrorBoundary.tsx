import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Capturado erro de renderização:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    try {
      window.location.reload();
    } catch {}
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#141312] text-zinc-200 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-2">
            {this.props.fallbackTitle || 'Ajuste de Renderização Necessário'}
          </h1>
          <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
            Ocorreu uma instabilidade na interface da plataforma. O estado local foi preservado e você pode reiniciar o painel com segurança.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFB800] hover:bg-[#E5A600] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar Painel</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
