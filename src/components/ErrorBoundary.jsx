import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });

  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8 font-sans">
          <div className="max-w-2xl w-full bg-slate-800 rounded-3xl p-10 border border-slate-700 shadow-2xl">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Algo salió mal.</h1>
            <p className="text-slate-300 mb-6">
              La aplicación ha encontrado un error inesperado. Por favor, recarga la página o contacta a soporte.
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-auto max-h-64 mb-6">
              <code className="text-xs text-red-300 font-mono">
                {this.state.error && this.state.error.toString()}
              </code>
              <br />
              <code className="text-[10px] text-slate-500 font-mono mt-2 block whitespace-pre-wrap">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
