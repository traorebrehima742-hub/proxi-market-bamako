import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';

interface PWAInstallBannerProps {
  compact?: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ compact }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  // Compact button for header or navigation
  if (compact) {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold shadow-xs hover:bg-teal-100 transition-colors"
          title="Installer l'application PWA"
        >
          <Download className="w-3.5 h-3.5 text-[#00685f]" />
          <span>Installer l'app</span>
        </button>
      );
    }
    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold shadow-xs hover:bg-teal-100 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#00685f]" />
            <span>PWA iOS</span>
          </button>
          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 relative">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#00685f]">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Installer sur iPhone & iPad</h3>
                    <p className="text-xs text-slate-500">Accès hors-ligne & plein écran</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 mb-5">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <p>Appuyez sur le bouton <strong>Partager</strong> <Share className="w-4 h-4 inline text-blue-600 mx-0.5" /> dans la barre Safari.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <p>Faites défiler vers le bas et appuyez sur <strong>Sur l'écran d'accueil</strong> <PlusSquare className="w-4 h-4 inline text-slate-700 mx-0.5" />.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <p>Confirmez en haut à droite avec <strong>Ajouter</strong>.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-3 rounded-xl bg-[#00685f] text-white font-semibold shadow-md active:scale-95 transition-transform"
                >
                  J'ai compris
                </button>
              </div>
            </div>
          )}
        </>
      );
    }
    return null;
  }

  // Full banner mode (e.g. inside Profile or top of Home)
  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/70 to-teal-50/90 p-4 border border-teal-200/80 shadow-xs mb-3">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
        title="Masquer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3.5 pr-6">
        <div className="w-12 h-12 rounded-2xl bg-[#00685f] flex items-center justify-center text-white shrink-0 shadow-sm ring-2 ring-teal-100">
          <Download className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00685f]">Application PWA Mobile</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <h4 className="font-bold text-slate-900 text-sm leading-tight mt-0.5">Installez Proxi Market sur votre téléphone</h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-snug">
            Accès ultra-rapide 1-clic depuis votre écran d'accueil sans passer par le store, fonctionne hors-ligne.
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 pt-1 border-t border-teal-200/60">
        {isInstallable ? (
          <button
            onClick={install}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#00685f] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#00574f] active:scale-98 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Installer l'application gratuite</span>
          </button>
        ) : isIOS ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#00685f] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#00574f] active:scale-98 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Guide d'installation iPhone (Safari)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-teal-900 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>PWA compatible Android, iOS & Chrome Web</span>
          </div>
        )}
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#00685f]">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Installer sur iPhone & iPad</h3>
                <p className="text-xs text-slate-500">Ajouter à l'écran d'accueil</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 mb-5">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p>Appuyez sur l'icône <strong>Partager</strong> <Share className="w-4 h-4 inline text-blue-600 mx-0.5" /> dans la barre inférieure de Safari.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Sélectionnez <strong>Sur l'écran d'accueil</strong> <PlusSquare className="w-4 h-4 inline text-slate-700 mx-0.5" />.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p>Appuyez sur <strong>Ajouter</strong> en haut à droite.</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 rounded-xl bg-[#00685f] text-white font-semibold shadow-md active:scale-95 transition-transform"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
