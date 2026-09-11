import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Sparkles, Bot, User, HelpCircle, ShieldCheck, 
  MapPin, ShoppingBag, Wrench, Smartphone, RefreshCw 
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'accueil' | 'decouvrir' | 'messages' | 'favoris' | 'profil') => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  action?: {
    label: string;
    targetTab?: 'accueil' | 'decouvrir' | 'messages' | 'favoris' | 'profil';
  };
}

const DEFAULT_MESSAGES: Message[] = [
  {
    id: 'intro-1',
    sender: 'bot',
    text: 'I ni ce ! Bonjour ! Je suis votre assistant intelligent Proxi Market Bamako. Comment puis-je vous aider aujourd\'hui pour vos achats de proximité, artisans ou livraisons à Bamako ?',
    time: '12:00',
  },
];

const SUGGESTIONS = [
  'Comment payer par Orange Money ou Wave ?',
  'Trouver un mécanicien Djakarta près d’ACI 2000',
  'Comment fonctionne la livraison coursier ?',
  'Garantie & vérification avant paiement',
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('proxi_ai_history');
      return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
    } catch {
      return DEFAULT_MESSAGES;
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('proxi_ai_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Contextual intelligent responses tailored to Proxi Market Bamako
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let replyText = '';
      let actionObj: Message['action'] | undefined = undefined;

      if (lower.includes('orange money') || lower.includes('wave') || lower.includes('payer') || lower.includes('paiement')) {
        replyText = "Sur Proxi Market, les paiements sont 100% sécurisés. Vous pouvez régler par Orange Money Mali (+223), Wave Mali (0% de frais) ou en espèces directement au livreur lors de la remise en main propre. Vos fonds ne sont débloqués qu'après vérification physique du produit !";
        actionObj = { label: 'Voir mes moyens de paiement', targetTab: 'profil' };
      } else if (lower.includes('mecanicien') || lower.includes('djakarta') || lower.includes('moto') || lower.includes('panne')) {
        replyText = "Nous avons Oumar Traoré à Hamdallaye ACI (noté 4.9★, 128 avis) spécialisé sur les motos Djakarta et Sanili avec déplacement à domicile dès 4 000 FCFA. Vous pouvez lui demander un devis instantané ou l'appeler directement.";
        actionObj = { label: 'Voir les artisans à domicile', targetTab: 'accueil' };
      } else if (lower.includes('bazin') || lower.includes('getzner') || lower.includes('tissu') || lower.includes('mode')) {
        replyText = "Pour le Bazin de qualité, retrouvez la Boutique Mandé Bazin (Hamdallaye ACI, 350m) et l'Atelier Maison du Bazin Fanta K. avec du Bazin Riche Getzner teinté artisanalement grand teint en 5 mètres à 45 000 FCFA.";
        actionObj = { label: 'Explorer le Bazin & Mode', targetTab: 'accueil' };
      } else if (lower.includes('livraison') || lower.includes('coursier') || lower.includes('temps') || lower.includes('délai')) {
        replyText = "La livraison rapide est effectuée par des coursiers certifiés partout à Bamako (Commune I à VI). Le délai moyen est de 15 à 30 minutes avec suivi en temps réel sur la carte.";
        actionObj = { label: 'Suivre ma commande en route', targetTab: 'profil' };
      } else if (lower.includes('solaire') || lower.includes('delestage') || lower.includes('batterie')) {
        replyText = "Pour vous équiper face aux coupures de courant, découvrez le Kit Solaire Domicile 300W avec batterie Gel 150Ah et 4 ampoules LED chez Mali Énergie Verte (Quartier du Fleuve) à 165 000 FCFA avec garantie 2 ans.";
        actionObj = { label: 'Voir les kits solaires', targetTab: 'accueil' };
      } else if (lower.includes('bonjour') || lower.includes('salam') || lower.includes('salut')) {
        replyText = "I bisimila ! Bienvenue sur Proxi Market. Que recherchez-vous aujourd'hui : un produit frais du marché de Médine, du Bazin à ACI 2000, ou un artisan de confiance (plombier, mécanicien, électricien) ?";
      } else {
        replyText = `Merci pour votre question ! Proxi Market regroupe les meilleurs commerces et artisans de Bamako avec contact WhatsApp direct, paiement vérifié (Orange Money / Wave) et livraison rapide. Vous pouvez parcourir les offres ou demander un devis gratuit.`;
        actionObj = { label: 'Découvrir le marché', targetTab: 'decouvrir' };
      }

      const botReply: Message = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: actionObj,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botReply]);
    }, 800);
  };

  const handleActionClick = (targetTab?: 'accueil' | 'decouvrir' | 'messages' | 'favoris' | 'profil') => {
    if (targetTab && onNavigateTab) {
      onNavigateTab(targetTab);
      onClose();
    }
  };

  const clearHistory = () => {
    setMessages(DEFAULT_MESSAGES);
    try {
      localStorage.removeItem('proxi_ai_history');
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg h-[90vh] max-h-[680px] rounded-3xl flex flex-col relative overflow-hidden text-slate-800"
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 25px 50px -12px rgba(0, 104, 95, 0.3), inset 0 2px 2px rgba(255, 255, 255, 1)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#00685f] to-[#008378] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-2 ring-white/30">
              <Sparkles className="w-5 h-5 text-[#fea619]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base leading-tight">Assistant Proxi IA</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-xs text-teal-100 font-medium">Spécialiste Bamako & Support 24/7</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearHistory}
              title="Réinitialiser la discussion"
              className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Proximity Context Tag */}
        <div className="px-4 py-2 bg-teal-50/80 border-b border-teal-100 flex items-center justify-between text-xs text-teal-900">
          <span className="flex items-center gap-1 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#fea619]" />
            <span>Zone active : Bamako (ACI 2000, Lafiabougou...)</span>
          </span>
          <span className="text-[11px] text-teal-700">Modèle IA Contextuel</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center shrink-0 shadow-xs mb-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[82%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#00685f] text-white rounded-br-xs'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.action && (
                    <button
                      onClick={() => handleActionClick(msg.action?.targetTab)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-[#00685f] hover:bg-teal-100 font-semibold text-xs border border-teal-200 shadow-2xs transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{msg.action.label}</span>
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mb-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white rounded-2xl rounded-bl-xs border border-slate-200/80 shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Pills */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-200/80 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 text-slate-700 hover:text-[#00685f] text-xs font-medium border border-slate-200/80 shadow-2xs transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Posez votre question (ex: Bazin, Djakarta, Wave)..."
            className="flex-1 h-11 px-4 rounded-xl bg-slate-100 border border-transparent focus:border-[#00685f] focus:bg-white focus:outline-none text-sm text-slate-800 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-11 h-11 rounded-xl bg-[#00685f] hover:bg-[#00574f] disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-sm shrink-0 active:scale-95"
            aria-label="Envoyer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
