import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Une erreur inattendue est survenue.';
      
      try {
        if (this.state.error?.message) {
          const errorData = JSON.parse(this.state.error.message);
          if (errorData.error && errorData.error.includes('Missing or insufficient permissions')) {
            errorMessage = 'Erreur de permission Firestore. Veuillez vérifier les règles de sécurité.';
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tighter uppercase italic">Système Interrompu</h1>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {errorMessage}
              </p>
            </div>
            {this.state.error && (
              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-left overflow-auto max-h-40">
                <code className="text-[10px] text-red-400 font-mono break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <RefreshCw className="w-4 h-4" />
              Redémarrer Nemo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
