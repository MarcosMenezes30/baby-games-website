import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(
        err?.message?.includes('Invalid login')
          ? 'E-mail ou senha incorretos. Verifique as credenciais.'
          : 'Erro ao autenticar. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div
          className="rounded-3xl p-8 space-y-8"
          style={{
            background: 'rgba(13,13,26,0.92)',
            border: '1px solid rgba(245,158,11,0.25)',
            boxShadow: '0 0 60px rgba(245,158,11,0.08), 0 25px 50px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              <ShieldAlert className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}
              >
                Área Restrita
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                Painel Admin
              </h1>
              <p className="text-sm text-white/40 mt-1">
                Acesso exclusivo para administradores Baby Games
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-mono uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@babygames.com.br"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-mono uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3.5 rounded-xl text-xs text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all cursor-pointer"
              style={{
                background: loading
                  ? 'rgba(255,255,255,0.06)'
                  : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: loading ? 'rgba(255,255,255,0.3)' : '#0D0D1A',
                boxShadow: loading ? 'none' : '0 0 20px rgba(245,158,11,0.25)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar no Painel
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="text-center">
            <button
              onClick={onBack}
              className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono cursor-pointer"
            >
              ← Voltar para a loja
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-white/20 font-mono mt-4">
          Sessão criptografada via Supabase Auth
        </p>
      </motion.div>
    </div>
  );
}
