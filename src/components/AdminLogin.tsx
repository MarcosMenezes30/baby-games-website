import { useState, FormEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, Mail, Eye, EyeOff, ShieldAlert, ShieldCheck,
  Loader2, LogIn, KeyRound, ArrowLeft, Laptop, Smartphone,
  Tablet, UserCheck, User, MonitorSmartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { detectCurrentDeviceInfo, getCurrentDeviceId } from '../lib/device';
import { registerAdminDevice, updateAdminDeviceLastActive } from '../lib/api';
import { AdminDevice } from '../types';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const { login, confirmMfa } = useAuth();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA / MFA state
  const [step, setStep] = useState<'credentials' | 'mfa' | 'device'>('credentials');
  const [mfaFactorId, setMfaFactorId] = useState<string>('');
  const [mfaCode, setMfaCode] = useState('');
  const mfaInputRef = useRef<HTMLInputElement>(null);

  // New device registration state
  const [deviceUserName, setDeviceUserName] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [detectedInfo, setDetectedInfo] = useState(() => detectCurrentDeviceInfo());

  useEffect(() => {
    if (step === 'mfa') {
      setTimeout(() => {
        mfaInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  const checkDeviceAndProceed = async () => {
    const currentId = getCurrentDeviceId();
    if (currentId) {
      // Returning device on this browser — update activity and proceed
      await updateAdminDeviceLastActive(currentId);
      onSuccess();
    } else {
      // New device/browser detected!
      const info = detectCurrentDeviceInfo();
      setDetectedInfo(info);
      setDeviceName(info.suggestedName);
      setStep('device');
    }
  };

  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.mfaRequired && res.factorId) {
        setMfaFactorId(res.factorId);
        setStep('mfa');
      } else {
        await checkDeviceAndProceed();
      }
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

  const handleMfaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!mfaCode || mfaCode.trim().length < 6) {
      setError('Digite o código de 6 dígitos exibido no seu aplicativo autenticador.');
      return;
    }

    setLoading(true);
    try {
      await confirmMfa(mfaFactorId, mfaCode.trim());
      await checkDeviceAndProceed();
    } catch (err: any) {
      setError(
        err?.message?.includes('Invalid') || err?.message?.includes('expired')
          ? 'Código do autenticador inválido ou expirado. Verifique o app e tente novamente.'
          : 'Falha na validação do código 2FA. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!deviceUserName.trim() || !deviceName.trim()) {
      setError('Preencha seu nome e o nome do dispositivo.');
      return;
    }

    setLoading(true);
    try {
      const newDevice: AdminDevice = {
        id: `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userName: deviceUserName.trim(),
        deviceName: deviceName.trim(),
        deviceType: detectedInfo.deviceType,
        browser: detectedInfo.browser,
        os: detectedInfo.os,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await registerAdminDevice(newDevice);
      onSuccess();
    } catch (err: any) {
      setError('Erro ao registrar dispositivo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const DeviceIcon = detectedInfo.deviceType === 'mobile'
    ? Smartphone
    : detectedInfo.deviceType === 'tablet'
      ? Tablet
      : Laptop;

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
          className="rounded-3xl p-8 space-y-7"
          style={{
            background: 'rgba(13,13,26,0.92)',
            border: '1px solid rgba(245,158,11,0.25)',
            boxShadow: '0 0 60px rgba(245,158,11,0.08), 0 25px 50px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <AnimatePresence mode="wait">
            {step === 'credentials' && (
              <motion.div
                key="step-credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center space-y-3">
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
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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
                <div className="text-center pt-2">
                  <button
                    id="admin-login-back-btn"
                    type="button"
                    onClick={onBack}
                    className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono cursor-pointer"
                  >
                    ← Voltar para a loja
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'mfa' && (
              <motion.div
                key="step-mfa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* 2FA Header */}
                <div className="text-center space-y-3">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto"
                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', boxShadow: '0 0 25px rgba(124,58,237,0.25)' }}
                  >
                    <KeyRound className="w-8 h-8 text-violet-400 animate-pulse" />
                  </div>
                  <div>
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c084fc' }}
                    >
                      Segurança 2FA
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                      Código Authenticator
                    </h2>
                    <p className="text-xs text-white/50 mt-1 max-w-xs mx-auto">
                      Abra seu aplicativo autenticador (<span className="text-amber-400">Google Authenticator</span>, <span className="text-violet-400">Authy</span>, etc.) e digite o código de 6 dígitos gerado.
                    </p>
                  </div>
                </div>

                {/* MFA Code Form */}
                <form onSubmit={handleMfaSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-center block text-xs text-white/50 font-mono uppercase tracking-wider">
                      Código de Acesso (6 dígitos)
                    </label>
                    <div className="relative">
                      <input
                        ref={mfaInputRef}
                        id="admin-mfa-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                        value={mfaCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setMfaCode(val);
                        }}
                        placeholder="000000"
                        className="w-full py-4 text-center rounded-2xl text-2xl font-mono font-bold text-white tracking-[0.4em] placeholder-white/10 outline-none transition-all"
                        style={{
                          background: 'rgba(124,58,237,0.08)',
                          border: '1px solid rgba(124,58,237,0.3)',
                          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#A78BFA')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)')}
                      />
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

                  {/* Verify button */}
                  <button
                    id="admin-mfa-submit"
                    type="submit"
                    disabled={loading || mfaCode.length < 6}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                      color: 'white',
                      boxShadow: mfaCode.length === 6 ? '0 0 25px rgba(124,58,237,0.4)' : 'none',
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validando Código...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Verificar e Continuar
                      </>
                    )}
                  </button>
                </form>

                {/* Back to credentials */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setError(null);
                      setMfaCode('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors font-mono cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Voltar ao login com senha
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'device' && (
              <motion.div
                key="step-device"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Device Header */}
                <div className="text-center space-y-3">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto"
                    style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)', boxShadow: '0 0 25px rgba(52,211,153,0.2)' }}
                  >
                    <DeviceIcon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full"
                      style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}
                    >
                      Novo Dispositivo
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                      Identificar Dispositivo
                    </h2>
                    <p className="text-xs text-white/50 mt-1 max-w-xs mx-auto">
                      Identificamos um novo acesso. Dê um nome ao seu dispositivo e informe seu nome para registro no painel.
                    </p>
                  </div>
                </div>

                {/* Detected device badge */}
                <div
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-mono"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="text-emerald-400 font-bold">{detectedInfo.os}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-violet-300">{detectedInfo.browser}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/40 uppercase text-[10px]">{detectedInfo.deviceType}</span>
                </div>

                {/* Device Form */}
                <form onSubmit={handleDeviceSubmit} className="space-y-4">
                  {/* User Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50 font-mono uppercase tracking-wider">
                      Seu Nome (Utilizador) *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        id="admin-device-user-name"
                        type="text"
                        required
                        autoFocus
                        value={deviceUserName}
                        onChange={(e) => setDeviceUserName(e.target.value)}
                        placeholder="Ex: Marcos Menezes"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#34d399')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                      />
                    </div>
                  </div>

                  {/* Device Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50 font-mono uppercase tracking-wider">
                      Nome deste Dispositivo *
                    </label>
                    <div className="relative">
                      <MonitorSmartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        id="admin-device-name"
                        type="text"
                        required
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder="Ex: MacBook Air Pessoal"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#34d399')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                      />
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

                  {/* Save button */}
                  <button
                    id="admin-device-submit"
                    type="submit"
                    disabled={loading || !deviceUserName.trim() || !deviceName.trim()}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      boxShadow: '0 0 25px rgba(16,185,129,0.3)',
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Registrando Dispositivo...
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Confirmar e Acessar Painel
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-white/20 font-mono mt-4">
          Mapeamento seguro de dispositivos de administrador
        </p>
      </motion.div>
    </div>
  );
}
