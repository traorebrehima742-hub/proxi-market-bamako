// Audio recording, speech recognition and voice playback utility for Proxi Market

/**
 * Returns the best supported audio MIME type for MediaRecorder in the current browser
 */
export function getSupportedMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return '';
  const candidateTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/wav',
  ];

  for (const t of candidateTypes) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return '';
}

/**
 * Formats seconds into M:SS display
 */
export function formatAudioDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Converts a Blob to a persistent Data URL (base64) so it never expires in localStorage
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Speaks text using the browser's natural French SpeechSynthesis voice
 */
export function playSpeechTts(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    onProgress?: (ratio: number) => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
): { stop: () => void } {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (options.onEnd) options.onEnd();
    return { stop: () => {} };
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Clean text from emojis for smoother reading
  const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|🎤|🔊|⚡/gu, '').trim() || text;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'fr-FR';
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;

  // Try to pick a natural French voice if available
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find((v) => v.lang.startsWith('fr') || v.lang === 'fr-FR' || v.lang.toLowerCase().includes('french'));
  if (frVoice) {
    utterance.voice = frVoice;
  }

  let progressInterval: any = null;
  const estimatedDurationSec = Math.max(2, (cleanText.length / 14) / (options.rate || 1.0));
  let elapsed = 0;

  utterance.onstart = () => {
    elapsed = 0;
    if (options.onProgress) {
      options.onProgress(0);
      progressInterval = setInterval(() => {
        elapsed += 0.1;
        const ratio = Math.min(1, elapsed / estimatedDurationSec);
        if (options.onProgress) options.onProgress(ratio);
      }, 100);
    }
  };

  utterance.onend = () => {
    if (progressInterval) clearInterval(progressInterval);
    if (options.onProgress) options.onProgress(1);
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    if (progressInterval) clearInterval(progressInterval);
    if (options.onError) options.onError(e);
    else if (options.onEnd) options.onEnd();
  };

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      if (progressInterval) clearInterval(progressInterval);
      window.speechSynthesis.cancel();
      if (options.onEnd) options.onEnd();
    },
  };
}

/**
 * Controller to capture real microphone audio and live speech recognition
 */
export class VoiceRecorderSession {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private recordedWaveform: number[] = [];
  private speechRecognition: any = null;
  private transcript: string = '';
  private mimeType: string = '';
  private startTime: number = 0;

  public async start(
    onVolume?: (vol: number) => void,
    onLiveTranscript?: (text: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { success: false, error: 'Votre navigateur ne supporte pas l’accès au microphone.' };
    }

    try {
      // 1. Request real microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStream = stream;
      this.audioChunks = [];
      this.recordedWaveform = [];
      this.transcript = '';
      this.startTime = Date.now();

      // 2. Select best mime type
      this.mimeType = getSupportedMimeType();
      const recorderOptions: MediaRecorderOptions = {};
      if (this.mimeType) {
        recorderOptions.mimeType = this.mimeType;
      }

      this.mediaRecorder = new MediaRecorder(stream, recorderOptions);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);

      // 3. Setup AudioContext for real voice volume & waveform
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 64;
          source.connect(this.analyser);

          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          let sampleCounter = 0;

          const updateVolume = () => {
            if (!this.analyser) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((average / 128) * 100));

            if (onVolume) onVolume(normalized);

            // Periodically sample for final waveform
            sampleCounter++;
            if (sampleCounter % 6 === 0) {
              this.recordedWaveform.push(Math.max(15, normalized));
            }

            this.animFrameId = requestAnimationFrame(updateVolume);
          };

          updateVolume();
        }
      } catch (err) {
        console.warn('AudioContext visualization not available:', err);
      }

      // 4. Setup SpeechRecognition (French) to capture what is said
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          const recognition = new SpeechRec();
          recognition.lang = 'fr-FR';
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;

          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript;
            }
            this.transcript = fullText.trim();
            if (onLiveTranscript) onLiveTranscript(this.transcript);
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition status:', e?.error);
          };

          recognition.start();
          this.speechRecognition = recognition;
        }
      } catch (speechErr) {
        console.warn('Speech recognition not active:', speechErr);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      return {
        success: false,
        error: isDenied
          ? 'Autorisation micro refusée. Veuillez autoriser l’accès au micro dans votre navigateur.'
          : 'Impossible d’activer le micro sur cet appareil.',
      };
    }
  }

  public stop(): Promise<{
    audioUrl: string;
    durationSec: number;
    waveform: number[];
    transcript: string;
  }> {
    return new Promise((resolve) => {
      const elapsedSec = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      // Stop speech recognition
      if (this.speechRecognition) {
        try {
          this.speechRecognition.stop();
        } catch {}
      }

      // Stop visualization
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (this.audioContext) {
        try {
          this.audioContext.close();
        } catch {}
        this.audioContext = null;
      }

      // Normalize waveform to 20 bars
      let finalWaveform = this.recordedWaveform;
      if (finalWaveform.length < 20) {
        while (finalWaveform.length < 20) {
          finalWaveform.push(Math.round(20 + Math.random() * 50));
        }
      } else if (finalWaveform.length > 20) {
        const step = finalWaveform.length / 20;
        const sampled: number[] = [];
        for (let i = 0; i < 20; i++) {
          sampled.push(finalWaveform[Math.floor(i * step)] || 30);
        }
        finalWaveform = sampled;
      }

      const recorder = this.mediaRecorder;
      if (!recorder || recorder.state === 'inactive') {
        this.cleanupStream();
        resolve({
          audioUrl: '',
          durationSec: elapsedSec,
          waveform: finalWaveform,
          transcript: this.transcript,
        });
        return;
      }

      recorder.onstop = async () => {
        try {
          const type = this.mimeType || recorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type });
          const base64Url = await blobToDataUrl(audioBlob);

          this.cleanupStream();
          resolve({
            audioUrl: base64Url,
            durationSec: elapsedSec,
            waveform: finalWaveform,
            transcript: this.transcript,
          });
        } catch (blobErr) {
          console.error('Error generating audio data URL:', blobErr);
          this.cleanupStream();
          resolve({
            audioUrl: '',
            durationSec: elapsedSec,
            waveform: finalWaveform,
            transcript: this.transcript,
          });
        }
      };

      try {
        recorder.stop();
      } catch {
        this.cleanupStream();
        resolve({
          audioUrl: '',
          durationSec: elapsedSec,
          waveform: finalWaveform,
          transcript: this.transcript,
        });
      }
    });
  }

  public cancel() {
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch {}
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    this.cleanupStream();
    this.audioChunks = [];
    this.recordedWaveform = [];
  }

  private cleanupStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
  }
}
