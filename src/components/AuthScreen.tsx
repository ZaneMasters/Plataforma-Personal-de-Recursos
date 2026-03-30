import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

interface AuthScreenProps {
  onGoogleLogin: () => Promise<void>;
  onEmailLogin: (email: string, password: string) => Promise<void>;
  onEmailRegister: (email: string, password: string) => Promise<void>;
}

export function AuthScreen({ onGoogleLogin, onEmailLogin, onEmailRegister }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setShowPassword(false);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await onEmailLogin(email.trim(), password);
      } else {
        await onEmailRegister(email.trim(), password);
      }
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err?.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await onGoogleLogin();
    } catch {
      // Errors handled in parent
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-surface-50 dark:bg-[#0b1120] relative overflow-hidden font-sans transition-colors duration-200">
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-100 dark:bg-accent-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-100 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 pointer-events-none" />

      <div className="bg-white dark:bg-surface-800 p-8 sm:p-10 rounded-2xl shadow-2xl z-10 w-full max-w-sm border border-surface-100 dark:border-surface-700 flex flex-col">
        
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-surface-900 dark:bg-surface-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-7 h-7 text-white dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-black text-surface-900 dark:text-surface-50 tracking-tight">
            LinkVault
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1 text-center leading-relaxed">
            {mode === 'login' ? 'Accede a tu ecosistema privado de recursos.' : 'Crea tu cuenta personal y segura.'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-surface-100 dark:bg-surface-900/60 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-50 shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
              mode === 'register'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-50 shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Crear Cuenta
          </button>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <div className="relative">
            <label className="block text-[11px] font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                placeholder="tu@correo.com"
                className="w-full pl-9 pr-3 py-2.5 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-600 rounded-lg text-sm focus:outline-none focus:border-accent-500 dark:focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20 text-surface-800 dark:text-surface-100 transition-colors placeholder:text-surface-400"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[11px] font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">
              Contraseña {mode === 'register' && <span className="font-normal normal-case tracking-normal">(mín. 6 caracteres)</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null); }}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-600 rounded-lg text-sm focus:outline-none focus:border-accent-500 dark:focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20 text-surface-800 dark:text-surface-100 transition-colors placeholder:text-surface-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg px-3 py-2.5 text-red-600 dark:text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full flex items-center justify-center gap-2 bg-surface-900 hover:bg-surface-700 dark:bg-accent-600 dark:hover:bg-accent-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
            ) : mode === 'login' ? (
              <><LogIn className="w-4 h-4" /> Entrar a mi Cuenta</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Crear mi Cuenta</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500">o</span>
          <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
        </div>

        {/* Google Button */}
        <button
          id="auth-google-btn"
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-surface-700 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-200 py-2.5 px-4 rounded-lg font-bold text-sm hover:bg-surface-50 dark:hover:bg-surface-600 hover:shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          )}
          Continuar con Google
        </button>
      </div>

      <Toaster position="bottom-right" toastOptions={{ className: 'font-sans font-medium text-sm rounded shadow-lg' }} />
    </div>
  );
}

function getFirebaseErrorMessage(code?: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'El formato del correo no es válido.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado. Intenta iniciar sesión.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil. Usa al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Espera un momento e intenta de nuevo.';
    case 'auth/network-request-failed':
      return 'Error de red. Verifica tu conexión a internet.';
    case 'auth/popup-closed-by-user':
      return 'Inicio de sesión cancelado.';
    default:
      return 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}
