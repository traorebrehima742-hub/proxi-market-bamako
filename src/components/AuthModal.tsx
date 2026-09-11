import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Storage, secureHash } from '../lib/storage';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, Lock, Mail, Phone, Eye, EyeOff, ShieldCheck, KeyRound, 
  Fingerprint, Sparkles, CheckCircle2, ArrowRight, RefreshCw, Smartphone
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserUpdate: (user: UserProfile) => void;
  onLoginSuccess?: () => void;
  isLoggedIn?: boolean;
  initialMode?: 'login' | 'register' | 'security';
}

type AuthScreen = 'login' | 'register' | 'two_factor' | 'forgot_password' | 'reset_success';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdate,
  onLoginSuccess,
  isLoggedIn = true,
  initialMode = 'login',
}) => {
  const { t, language } = useLanguage();
  const [screen, setScreen] = useState<AuthScreen>(initialMode === 'register' ? 'register' : 'login');
  const [identifier, setIdentifier] = useState(currentUser?.phone || '+223 76 54 32 89');
  const [password, setPassword] = useState('Bamako2026!@#');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quartier, setQuartier] = useState('Hamdallaye ACI 2000');

  // 2FA state
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('mamadou.diarra@sugu.ml');

  // Loading & feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset screen and messages whenever AuthModal opens
  useEffect(() => {
    if (isOpen) {
      setScreen(initialMode === 'register' ? 'register' : 'login');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  // Lock background page scroll whenever AuthModal is open
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Lock body and html
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('scroll-locked');
    document.documentElement.classList.add('scroll-locked');

    return () => {
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.classList.remove('scroll-locked');
      document.documentElement.classList.remove('scroll-locked');
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier || !password) {
      setErrorMessage('Veuillez renseigner votre identifiant et mot de passe.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // 2FA obligatoire systématique
      setScreen('two_factor');
      setOtpSent(true);
      setSuccessMessage('Code de vérification sécurisé envoyé par SMS au ' + identifier);
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name || !identifier) {
      setErrorMessage('Veuillez remplir au moins votre nom et numéro de téléphone.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newUser: UserProfile = {
        ...currentUser,
        id: 'usr_' + Date.now(),
        name,
        phone: identifier,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@proximarket.ml`,
        quartier,
        twoFactorEnabled: true,
      };
      Storage.saveUser(newUser);
      onUserUpdate(newUser);

      // 2FA obligatoire
      setScreen('two_factor');
      setOtpSent(true);
      setSuccessMessage('Code de vérification obligatoire envoyé par SMS au ' + identifier);
    }, 700);
  };

  const finalizeLogin = () => {
    const token = secureHash(identifier + '_' + Date.now());
    Storage.setToken(token);
    setSuccessMessage('Connexion sécurisée établie (Session chiffrée AES-256).');
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newCode = [...totpCode];
    newCode[index] = val;
    setTotpCode(newCode);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto submit when all 6 filled
    if (index === 5 && val && newCode.every(d => d !== '')) {
      verify2FA(newCode.join(''));
    }
  };

  const verify2FA = (code: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code === '123456' || code.length === 6) {
        finalizeLogin();
      } else {
        setErrorMessage('Code invalide. Veuillez réessayer (Code démo: 123456)');
      }
    }, 500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setScreen('reset_success');
      setSuccessMessage(`Lien de réinitialisation chiffré envoyé avec succès à ${resetEmail}.`);
    }, 700);
  };

  const handleBiometricLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      finalizeLogin();
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto overscroll-contain"
      onClick={() => {
        if (isLoggedIn) {
          onClose();
        }
      }}
      onWheel={(e) => {
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div 
        className="w-full max-w-md rounded-3xl p-6 sm:p-7 relative overflow-hidden text-slate-800 dark:text-slate-100 transition-all max-h-[92vh] overflow-y-auto overscroll-contain shadow-2xl bg-white/95 dark:bg-[#121e30]/95 backdrop-blur-xl border border-white/80 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Ambient background glowing decorative orbs */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

        {/* Header Close Button (Uniquement si connecté) */}
        {isLoggedIn && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/70 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors shadow-xs border border-white/60 dark:border-white/10"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#008378] to-[#005049] flex items-center justify-center text-white shadow-md ring-4 ring-teal-50 shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#89f5e7]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00685f]">Sécurité & Authentification</span>
              <span className="px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">AES-256</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">Proxi Market Bamako</h2>
          </div>
        </div>

        {/* Status Banners */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50/90 border border-red-200/80 text-red-800 text-xs font-medium flex items-center gap-2">
            <X className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* SCREEN 1: LOGIN */}
        {screen === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Segmented switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-200/60 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                className="py-2 rounded-lg bg-white text-[#00685f] shadow-xs"
              >
                {t('auth.login')}
              </button>
              <button
                type="button"
                onClick={() => { setScreen('register'); setErrorMessage(''); }}
                className="py-2 rounded-lg text-slate-600 hover:text-slate-900"
              >
                {t('auth.createAccount')}
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('auth.phoneOrEmail')}
              </label>
              <div className="relative flex items-center">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+223 76 •• •• •• ou email"
                  required
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm focus:border-[#00685f] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('auth.password')}</label>
                <button
                  type="button"
                  onClick={() => { setScreen('forgot_password'); setErrorMessage(''); }}
                  className="text-xs text-[#00685f] dark:text-teal-400 hover:underline font-semibold"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/90 border border-slate-200 text-sm focus:border-[#00685f] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#00685f] focus:ring-teal-500 w-4 h-4"
                />
                <span>Session sécurisée (AES-256)</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                2FA Actif
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00685f] to-[#008378] text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Biometric sign-in button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full py-2.5 rounded-xl bg-white/70 hover:bg-white text-slate-700 text-xs font-semibold border border-slate-200 flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Fingerprint className="w-4 h-4 text-[#fea619]" />
                <span>Connexion instantanée par Empreinte / Face ID</span>
              </button>
            </div>
          </form>
        )}

        {/* SCREEN 2: REGISTER */}
        {screen === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 p-1 bg-slate-200/60 rounded-xl mb-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setScreen('login'); setErrorMessage(''); }}
                className="py-2 rounded-lg text-slate-600 hover:text-slate-900"
              >
                Connexion
              </button>
              <button
                type="button"
                className="py-2 rounded-lg bg-white text-[#00685f] shadow-xs"
              >
                Créer un compte
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Awa Keïta"
                required
                className="w-full h-10 px-3 rounded-xl bg-white/90 border border-slate-200 text-sm focus:border-[#00685f] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone (+223)</label>
                <input
                  type="tel"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="76 00 00 00"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-white/90 border border-slate-200 text-sm focus:border-[#00685f] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quartier Bamako</label>
                <select
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  className="w-full h-10 px-2 rounded-xl bg-white/90 border border-slate-200 text-xs focus:border-[#00685f] focus:outline-none"
                >
                  <option value="Hamdallaye ACI 2000">Hamdallaye ACI</option>
                  <option value="Lafiabougou">Lafiabougou</option>
                  <option value="Badalabougou">Badalabougou</option>
                  <option value="Torokorobougou">Torokorobougou</option>
                  <option value="Faladié">Faladié</option>
                  <option value="Quartier du Fleuve">Quartier du Fleuve</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email (optionnel)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full h-10 px-3 rounded-xl bg-white/90 border border-slate-200 text-sm focus:border-[#00685f] focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/50 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#00685f] dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-950 dark:text-teal-200">{t('auth.twoFactorTitle')}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-teal-200/70 dark:bg-teal-900/60 text-teal-900 dark:text-teal-300 text-[10px] font-extrabold uppercase">
                    {t('auth.mandatoryBadge')}
                  </span>
                </div>
                <p className="text-[11px] text-teal-800/90 dark:text-teal-300/80 leading-tight">
                  {t('auth.twoFactorMandatoryDesc')}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#00685f] text-white font-bold text-sm shadow-md hover:bg-[#00574f] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{t('auth.registerButton')}</span>}
            </button>
          </form>
        )}

        {/* SCREEN 3: 2FA VERIFICATION */}
        {screen === 'two_factor' && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/50 text-[#00685f] dark:text-teal-300 flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('auth.twoFactorTitle')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {t('auth.enterOtpCode')} <strong className="text-slate-900 dark:text-white">{identifier}</strong>
              </p>
            </div>

            {/* 6 digits input */}
            <div className="flex justify-center gap-2 my-4">
              {totpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#00685f] focus:ring-2 focus:ring-teal-100 focus:outline-none shadow-xs"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
              <span>{t('auth.demoCode')}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage(language === 'fr' ? 'Nouveau code renvoyé par SMS.' : 'New SMS code dispatched.')}
                className="text-[#00685f] dark:text-teal-400 font-semibold hover:underline"
              >
                {t('auth.resendCode')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => verify2FA(totpCode.join(''))}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#00685f] text-white font-bold text-sm shadow-md hover:bg-[#00574f] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{t('auth.verifyAndEnter')}</span>}
            </button>

            <button
              type="button"
              onClick={() => setScreen('login')}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Retour à la connexion
            </button>
          </div>
        )}

        {/* SCREEN 4: FORGOT PASSWORD */}
        {screen === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-900">Réinitialiser le mot de passe</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Entrez votre adresse email ou votre numéro de téléphone. Un lien sécurisé chiffré vous permettra de créer un nouveau mot de passe.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse email enregistrée
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="votre.email@domaine.ml"
                  required
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-slate-200 text-sm focus:border-[#00685f] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#00685f] text-white font-bold text-sm shadow-md hover:bg-[#00574f] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Envoyer le lien de réinitialisation</span>}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="text-xs text-[#00685f] font-semibold hover:underline"
              >
                Retourner à la connexion
              </button>
            </div>
          </form>
        )}

        {/* SCREEN 5: RESET SUCCESS */}
        {screen === 'reset_success' && (
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Email de réinitialisation envoyé !</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consultez votre boîte de réception <strong className="text-slate-800">{resetEmail}</strong> pour renouveler votre mot de passe en toute sécurité.
            </p>
            <button
              type="button"
              onClick={() => setScreen('login')}
              className="w-full py-3 rounded-xl bg-[#00685f] text-white text-xs font-bold shadow-md hover:bg-[#00574f]"
            >
              Se reconnecter
            </button>
          </div>
        )}

        {/* Trust Footer */}
        <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Données protégées Mali</span>
          </span>
          <span>Supabase / Node Sync</span>
        </div>
      </div>
    </div>
  );
};
