import React, { useState, useRef, useEffect } from 'react';
import { ConversationThread } from '../types';
import { Storage } from '../lib/storage';
import { 
  X, Send, Phone, Paperclip, CheckCheck, ShieldCheck, 
  FileText, ArrowLeft, Mic, Play, Pause, Trash2, Volume2, AlertCircle, ChevronRight 
} from 'lucide-react';
import { 
  formatAudioDuration, 
  VoiceRecorderSession, 
  playSpeechTts 
} from '../lib/audioVoice';

// Audio Player Bubble Component
const VoiceNoteBubble: React.FC<{
  audio: { url: string; durationSec: number; waveform?: number[]; transcript?: string };
  text: string;
  isMe: boolean;
}> = ({ audio, text, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsControllerRef = useRef<{ stop: () => void } | null>(null);

  const duration = Math.max(1, audio.durationSec || 5);
  const speechText = audio.transcript || (text && !text.startsWith('🎤 Message vocal') ? text.replace(/^🎤\s*Vocal\s*:\s*[«"']?/, '').replace(/[»"']?$/, '') : '');

  // Cleanup audio & TTS on unmount or URL change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (ttsControllerRef.current) {
        ttsControllerRef.current.stop();
        ttsControllerRef.current = null;
      }
    };
  }, [audio.url]);

  const stopAllPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (ttsControllerRef.current) {
      ttsControllerRef.current.stop();
      ttsControllerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const playWithTts = (spokenContent: string) => {
    stopAllPlayback();
    setIsPlaying(true);
    setCurrentTime(0);

    const controller = playSpeechTts(spokenContent || "Message vocal reçu", {
      rate: playbackRate,
      onProgress: (ratio) => {
        setCurrentTime(ratio * duration);
      },
      onEnd: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        ttsControllerRef.current = null;
      },
      onError: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        ttsControllerRef.current = null;
      },
    });
    ttsControllerRef.current = controller;
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAllPlayback();
      return;
    }

    // 1. If we have a recorded audio data URL or link, try playing native audio first
    if (audio.url && (audio.url.startsWith('data:audio') || audio.url.startsWith('blob:') || audio.url.startsWith('http'))) {
      try {
        let el = audioRef.current;
        if (!el || el.src !== audio.url) {
          el = new Audio(audio.url);
          audioRef.current = el;

          el.addEventListener('timeupdate', () => {
            if (el) setCurrentTime(el.currentTime);
          });
          el.addEventListener('ended', () => {
            setIsPlaying(false);
            setCurrentTime(0);
          });
          el.addEventListener('pause', () => {
            setIsPlaying(false);
          });
          el.addEventListener('play', () => {
            setIsPlaying(true);
          });
          el.addEventListener('error', (e) => {
            console.warn('HTML5 audio error, falling back to speech synthesis:', e);
            if (speechText) {
              playWithTts(speechText);
            } else {
              setIsPlaying(false);
            }
          });
        }

        el.playbackRate = playbackRate;
        el.play().catch((err) => {
          console.warn('Audio play() rejected, falling back to speech synthesis:', err);
          if (speechText) {
            playWithTts(speechText);
          } else {
            setIsPlaying(false);
          }
        });
        setIsPlaying(true);
        return;
      } catch (err) {
        console.warn('Native audio instantiation failed:', err);
      }
    }

    // 2. If no native audio URL or if it's text-based merchant message, speak using natural voice
    if (speechText) {
      playWithTts(speechText);
    } else {
      // Short vocal feedback
      playWithTts(isMe ? "Message vocal de vous" : "Message vocal reçu");
    }
  };

  const toggleSpeed = () => {
    const nextRate = playbackRate === 1.0 ? 1.5 : playbackRate === 1.5 ? 2.0 : 1.0;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const progressRatio = Math.min(1, Math.max(0, currentTime / duration));

  // 20 waveform bars
  const bars = audio.waveform && audio.waveform.length >= 10 
    ? audio.waveform.slice(0, 20) 
    : [35, 55, 80, 95, 65, 45, 85, 100, 75, 50, 65, 85, 45, 65, 85, 55, 45, 75, 60, 40];

  return (
    <div className="flex flex-col gap-1.5 w-60 sm:w-68">
      <div className="flex items-center gap-2.5">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 shrink-0 shadow-2xs ${
            isMe
              ? 'bg-white text-[#00685f] hover:bg-teal-50'
              : 'bg-[#00685f] text-white hover:bg-[#00574f]'
          }`}
          aria-label={isPlaying ? 'Mettre en pause' : 'Écouter le message vocal'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Interactive Waveform */}
        <div 
          className="flex-1 flex items-center gap-0.5 h-8 cursor-pointer py-1"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickFraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            if (audioRef.current) {
              audioRef.current.currentTime = clickFraction * duration;
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          title="Cliquer pour avancer dans le vocal"
        >
          {bars.map((val, idx) => {
            const barFraction = idx / bars.length;
            const isPlayed = barFraction <= progressRatio;
            const heightPx = Math.max(4, Math.round((val / 100) * 24));

            return (
              <span
                key={idx}
                className={`flex-1 rounded-full transition-all duration-75 ${
                  isMe
                    ? isPlayed ? 'bg-white' : 'bg-white/40'
                    : isPlayed ? 'bg-[#00685f]' : 'bg-teal-200'
                }`}
                style={{ height: `${heightPx}px` }}
              />
            );
          })}
        </div>

        {/* Speed button */}
        <button
          type="button"
          onClick={toggleSpeed}
          className={`text-[10px] font-black px-1.5 py-0.5 rounded-md transition-colors shrink-0 ${
            isMe 
              ? 'bg-white/20 text-white hover:bg-white/30' 
              : 'bg-teal-100 text-teal-900 hover:bg-teal-200'
          }`}
          title="Vitesse de lecture"
        >
          {playbackRate}x
        </button>
      </div>

      {/* Transcript or spoken quote preview */}
      {speechText && (
        <div className={`text-[11px] leading-snug px-1 line-clamp-2 italic font-normal ${
          isMe ? 'text-teal-50/90' : 'text-slate-700'
        }`}>
          « {speechText} »
        </div>
      )}

      {/* Timing and Voice Indicator */}
      <div className={`flex items-center justify-between text-[10px] font-medium px-0.5 pt-0.5 border-t ${
        isMe ? 'text-teal-100/80 border-white/15' : 'text-slate-400 border-slate-100'
      }`}>
        <span className="flex items-center gap-1">
          <Volume2 className="w-3 h-3" />
          <span>{audio.url ? 'Vocal enregistré' : 'Message vocal'}</span>
        </span>
        <span className="tabular-nums font-mono">
          {formatAudioDuration(currentTime > 0 ? currentTime : duration)}
        </span>
      </div>
    </div>
  );
};

interface ChatModalProps {
  thread: ConversationThread | null;
  onClose: () => void;
  onThreadsUpdate: () => void;
  onOpenQuoteDetail?: (thread: ConversationThread) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  thread,
  onClose,
  onThreadsUpdate,
  onOpenQuoteDetail,
}) => {
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [liveVolume, setLiveVolume] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);

  const recorderSessionRef = useRef<VoiceRecorderSession | null>(null);
  const recordTimerRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
      if (recorderSessionRef.current) {
        recorderSessionRef.current.cancel();
      }
    };
  }, []);

  if (!thread) return null;

  const quickSuggestions = [
    'Bonjour, êtes-vous disponible aujourd’hui ?',
    'Pouvez-vous intervenir à domicile ?',
    'Quel est votre délai moyen d’intervention ?',
    'Quel est le tarif estimé pour ce travail ?',
  ];

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Send user message
    Storage.sendThreadMessage(thread.id, text.trim(), 'user');
    setInputMsg('');
    onThreadsUpdate();

    // Trigger realistic artisan / merchant response
    setIsTyping(true);
    setTimeout(() => {
      const lower = text.toLowerCase();
      let autoReply = `Message bien reçu ! Je suis disponible et je prends en charge votre demande.`;

      if (lower.includes('disponible') || lower.includes('aujourd’hui') || lower.includes('quand')) {
        autoReply = `Oui, je suis actuellement disponible à Bamako ! Donnez-moi juste votre localisation précise pour caler l'horaire.`;
      } else if (lower.includes('prix') || lower.includes('tarif') || lower.includes('devis') || lower.includes('combien')) {
        autoReply = `Pour cette prestation, le tarif dépend des pièces et de l'ampleur. Généralement cela commence dès nos tarifs standards (${thread.quotePreview?.price || 'abordables'}). Pouvez-vous détailler votre panne ?`;
      } else if (lower.includes('domicile') || lower.includes('deplacement') || lower.includes('déplacer')) {
        autoReply = `Absolument, je me déplace partout sur Bamako avec mon outillage complet.`;
      } else if (lower.includes('bonjour') || lower.includes('salam')) {
        autoReply = `I bisimila ! Comment puis-je vous aider aujourd'hui ?`;
      }

      Storage.sendThreadMessage(thread.id, autoReply, 'merchant');
      setIsTyping(false);
      onThreadsUpdate();
    }, 1200);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMsg);
  };

  const handleAttachPhoto = () => {
    const photoNotice = "📷 Photo du problème / de l'article transmise";
    sendMessage(photoNotice);
  };

  const handleCall = () => {
    window.location.href = `tel:${thread.phone}`;
  };

  // Start real voice recording
  const startRecording = async () => {
    try {
      setMicErrorMessage(null);
      setIsRequestingMic(true);
      setLiveTranscript('');
      setLiveVolume(0);

      const session = new VoiceRecorderSession();
      recorderSessionRef.current = session;

      const res = await session.start(
        (vol) => setLiveVolume(vol),
        (transcript) => setLiveTranscript(transcript)
      );

      setIsRequestingMic(false);

      if (!res.success) {
        setMicErrorMessage(res.error || 'Impossible d’accéder au microphone.');
        recorderSessionRef.current = null;
        return;
      }

      setIsRecording(true);
      setRecordDuration(0);

      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (e: any) {
      setIsRequestingMic(false);
      setMicErrorMessage('Erreur lors de l’activation du microphone.');
      console.error('Audio recorder initialization:', e);
    }
  };

  // Stop recording and send real recorded audio message
  const stopAndSendRecording = async () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    const session = recorderSessionRef.current;
    if (!session) {
      setIsRecording(false);
      return;
    }

    setIsRecording(false);

    const result = await session.stop();
    recorderSessionRef.current = null;

    const finalDuration = Math.max(1, result.durationSec || recordDuration);
    const transcript = result.transcript || liveTranscript;

    // Display label: includes the transcript if speech recognition caught words
    const displayMsg = transcript ? `🎤 Vocal : « ${transcript} »` : '🎤 Message vocal';

    // Store message with persistent Base64 Data URL so playback is 100% real
    Storage.sendThreadMessage(
      thread.id,
      displayMsg,
      'user',
      {
        url: result.audioUrl,
        durationSec: finalDuration,
        waveform: result.waveform,
        transcript,
      }
    );
    onThreadsUpdate();

    // Trigger natural response from artisan / merchant
    setIsTyping(true);
    setTimeout(() => {
      const replyText = thread.category === 'artisans'
        ? `I bisimila ! J'ai bien écouté votre message vocal. Je prends mon matériel et je peux passer voir la panne.`
        : `Bonjour ! Bien reçu votre message vocal. L'article est disponible et prêt en magasin.`;

      Storage.sendThreadMessage(
        thread.id,
        replyText,
        'merchant',
        {
          url: '', // Natural French speech synthesis will voice this
          durationSec: 6,
          waveform: [45, 65, 85, 95, 75, 55, 80, 95, 70, 50, 65, 85, 90, 65, 45, 75, 80, 55, 40, 30],
          transcript: replyText,
        }
      );
      setIsTyping(false);
      onThreadsUpdate();
    }, 1500);

    setRecordDuration(0);
    setLiveTranscript('');
    setLiveVolume(0);
  };

  // Cancel recording
  const cancelRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (recorderSessionRef.current) {
      recorderSessionRef.current.cancel();
      recorderSessionRef.current = null;
    }
    setIsRecording(false);
    setRecordDuration(0);
    setLiveTranscript('');
    setLiveVolume(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-full sm:h-[90vh] sm:max-h-[680px] sm:rounded-3xl bg-white overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative shrink-0">
              <img
                src={thread.avatar}
                alt={thread.contactName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
              {thread.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {thread.contactName}
                </h3>
                {thread.verified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00685f] shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {thread.contactSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCall}
              className="p-2 rounded-xl text-[#00685f] hover:bg-teal-50 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Appeler directement"
            >
              <Phone className="w-4 h-4 text-[#00685f]" />
              <span className="hidden sm:inline">Appeler</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Fermer la discussion"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Relais Local Warning Notice */}
        <div className="px-4 py-2 bg-[#00685f]/8 border-b border-teal-100/60 flex items-center justify-between text-[11px] text-[#00685f] font-medium">
          <span>Relais sécurisé Proxi Market • Bamako</span>
          <span className="text-[10px] text-teal-800">Messages & Vocaux chiffrés</span>
        </div>

        {/* Microphone Error Notice Banner if permission is blocked */}
        {micErrorMessage && (
          <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">{micErrorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setMicErrorMessage(null)}
              className="px-2 py-0.5 bg-white border border-rose-200 text-[11px] font-bold rounded-md hover:bg-rose-100 shrink-0"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70">
          {/* Product / Artisan preview card at chat top */}
          {thread.productPreview && (
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3 mb-2">
              <img
                src={thread.productPreview.image}
                alt={thread.productPreview.title}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400">Article en discussion</span>
                <h4 className="text-xs font-bold text-slate-900 truncate">{thread.productPreview.title}</h4>
                <p className="text-xs font-black text-[#00685f]">{thread.productPreview.price}</p>
              </div>
            </div>
          )}

          {thread.quotePreview && (
            <div 
              onClick={() => onOpenQuoteDetail && onOpenQuoteDetail(thread)}
              className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs flex items-center gap-3 mb-2 cursor-pointer hover:bg-amber-100/70 transition-all group active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#855300] flex items-center justify-center shrink-0 border border-amber-200">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-800">Devis Artisans</span>
                  <span className="text-[11px] font-bold text-[#00685f] group-hover:underline flex items-center">
                    Consulter le devis <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{thread.quotePreview.title}</h4>
                <p className="text-xs font-black text-[#855300]">{thread.quotePreview.price}</p>
              </div>
            </div>
          )}

          {/* Messages list */}
          {thread.messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-[#00685f] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {m.audio ? (
                    <VoiceNoteBubble audio={m.audio} text={m.text} isMe={isMe} />
                  ) : (
                    <p>{m.text}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-[#00685f]" />}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-2xl border border-slate-200/70 w-fit shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#00685f] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#00685f] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#00685f] animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-medium">{thread.contactName} est en train d'écrire...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-200/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
          {quickSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(suggestion)}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-teal-50 hover:text-[#00685f] border border-slate-200 text-slate-600 text-[11px] font-medium whitespace-nowrap transition-colors shadow-2xs active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input Bar or Active Voice Recording Bar */}
        {isRecording ? (
          <div className="p-3 bg-teal-900 text-white flex flex-col gap-2 pb-safe animate-in fade-in duration-200">
            {/* Live speech transcript pill if speaking */}
            {liveTranscript && (
              <div className="px-3 py-1.5 rounded-lg bg-white/10 text-teal-100 text-xs italic flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">« {liveTranscript} »</span>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={cancelRecording}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-red-500 text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs"
                title="Annuler le message vocal"
                aria-label="Annuler"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Recording Waves & Timer */}
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/15 min-w-0">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="text-xs font-bold font-mono tracking-wider text-teal-200">
                  {formatAudioDuration(recordDuration)}
                </span>

                {/* Real-time Dynamic Volume Waves reacting to the voice */}
                <div className="flex-1 flex items-center gap-1 h-6 overflow-hidden">
                  {[12, 24, 18, 28, 20, 16, 26, 22, 14, 25, 18, 12].map((baseHeight, idx) => {
                    const dynamicScale = Math.max(0.3, Math.min(1.8, (liveVolume / 40) + ((idx % 3) * 0.2)));
                    const barHeight = Math.max(4, Math.min(24, Math.round(baseHeight * dynamicScale)));

                    return (
                      <span
                        key={idx}
                        className="flex-1 bg-teal-300 rounded-full transition-all duration-75"
                        style={{ height: `${barHeight}px` }}
                      />
                    );
                  })}
                </div>

                <span className="text-[11px] text-teal-200 font-medium hidden sm:inline truncate">
                  Parlez maintenant...
                </span>
              </div>

              {/* Send Real Voice Recording */}
              <button
                type="button"
                onClick={stopAndSendRecording}
                className="h-10 px-3.5 rounded-xl bg-white hover:bg-teal-50 text-[#00685f] font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
                title="Arrêter et envoyer votre vocal"
              >
                <Send className="w-4 h-4 text-[#00685f]" />
                <span>Envoyer</span>
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 pb-safe"
          >
            <button
              type="button"
              onClick={handleAttachPhoto}
              className="p-2 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-100 transition-colors shrink-0"
              title="Joindre une photo"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={`Écrire à ${thread.contactName}...`}
              className="flex-1 h-11 px-3.5 rounded-xl bg-slate-100 border border-transparent focus:border-[#00685f] focus:bg-white focus:outline-none text-sm text-slate-800 min-w-0"
            />

            {/* Microphone Button - directly next to send button */}
            <button
              type="button"
              onClick={startRecording}
              disabled={isRequestingMic}
              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-2xs active:scale-95 transition-all shrink-0 ${
                isRequestingMic 
                  ? 'bg-amber-100 text-amber-800 animate-pulse' 
                  : 'bg-teal-50 hover:bg-teal-100 text-[#00685f] border border-teal-200/80'
              }`}
              title="Enregistrer un message vocal (cliquez pour parler)"
              aria-label="Enregistrer un vocal"
            >
              <Mic className={`w-5 h-5 ${isRequestingMic ? 'animate-spin text-amber-800' : 'text-[#00685f]'}`} />
            </button>

            {/* Send Airplane Button */}
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="w-11 h-11 rounded-xl bg-[#00685f] hover:bg-[#00574f] disabled:opacity-40 text-white flex items-center justify-center shadow-xs active:scale-95 transition-all shrink-0"
              aria-label="Envoyer"
              title="Envoyer le message écrit"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
