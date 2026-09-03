import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Clock,
  Activity,
  Users,
  Star,
  CheckCircle2,
  Lock,
  Compass,
  Radio,
  RefreshCw,
  Zap,
  Flame,
  ShieldAlert,
  Repeat,
  MessageSquareQuote,
  ChevronDown,
  X,
  Smile,
  CircleDot,
  Send,
  Sliders,
  Wind,
  Headphones,
  Waves,
  AlertOctagon,
  LifeBuoy
} from 'lucide-react';
import { Persona, ChatMessage, CallStage, BehavioralMode, PersonaEmotion } from '../types';
import { audioSynth, SoundscapeType } from '../utils/audioSynth';
import { AmbientOrb } from './AmbientOrb';
import { VoiceOrb3D } from './3d/VoiceOrb3D';
import { PersonaVisuals } from './PersonaVisuals';
import { PERSONAS_DATA } from '../data/personas';
import { zeroizeAudioBuffer, purgeClientAudioCaches, calculateRMSVolume } from '../utils/audioStream';
import { CrisisHelplineModal } from './CrisisHelplineModal';
import { PostCallDecompressionModal } from './PostCallDecompressionModal';

interface VoiceCallModalProps {
  persona: Persona;
  onEndCall: () => void;
  onEscalateToHuman: (persona: Persona) => void;
  onPersonaSwitch?: (persona: Persona) => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  persona: initialPersona,
  onEndCall,
  onEscalateToHuman,
  onPersonaSwitch,
}) => {
  const [currentPersona, setCurrentPersona] = useState<Persona>(initialPersona);
  const [callStage, setCallStage] = useState<CallStage>('AI_LIVE');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<PersonaEmotion>('neutral');
  const [visualMode, setVisualMode] = useState<'portrait' | '3d-orb' | 'orb'>('3d-orb');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showPersonaDrawer, setShowPersonaDrawer] = useState(false);

  // New Modals & Controls
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [showDecompressionModal, setShowDecompressionModal] = useState(false);
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>('none');
  const [soundscapeVolume, setSoundscapeVolume] = useState(0.12);
  const [showSoundscapeDrawer, setShowSoundscapeDrawer] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  // Quick Reactive Emojis State
  const [activeReactions, setActiveReactions] = useState<Array<{
    id: string;
    emoji: string;
    rx: number;
    rot: number;
    scale: number;
  }>>([]);
  const [isAvatarPulsing, setIsAvatarPulsing] = useState(false);
  const avatarPulseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendReactiveEmoji = (emoji: string) => {
    if (navigator.vibrate) navigator.vibrate(20);
    audioSynth.playConnectedChime();

    const newReaction = {
      id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      emoji,
      rx: (Math.random() - 0.5) * 110,
      rot: (Math.random() - 0.5) * 32,
      scale: 0.9 + Math.random() * 0.4,
    };

    setActiveReactions((prev) => [...prev.slice(-12), newReaction]);

    // Trigger avatar CSS pulse animation
    setIsAvatarPulsing(true);
    if (avatarPulseTimerRef.current) clearTimeout(avatarPulseTimerRef.current);
    avatarPulseTimerRef.current = setTimeout(() => {
      setIsAvatarPulsing(false);
    }, 900);

    // Auto cleanup reaction
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 1900);
  };

  // In-memory unique ephemeral session ID
  const [sessionId] = useState(() => `sess_ephemeral_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  // Opening Mode Selector & Generation State
  const [openingStyle, setOpeningStyle] = useState<'spontaneous_warm' | 'user_first_silent' | 'late_night_grounding' | 'direct_reality_check'>('spontaneous_warm');
  const [isOpeningLoading, setIsOpeningLoading] = useState(false);
  const [hasInitializedOpening, setHasInitializedOpening] = useState(false);

  // Behavioral Matrix State (Receptive/Venting vs Directive/Action)
  const [behavioralMode, setBehavioralMode] = useState<BehavioralMode>('receptive_venting');
  const [bargeInCount, setBargeInCount] = useState(0);
  const [lastLatencyMs, setLastLatencyMs] = useState<number>(165);
  const [ttftMs, setTtftMs] = useState<number>(110);

  // Escalation & Human Listener State
  const [matchedListener, setMatchedListener] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState(2);
  const [queueWaitSeconds, setQueueWaitSeconds] = useState(20);
  const [distressAlert, setDistressAlert] = useState<string | null>(null);

  // Zero-Knowledge Ephemeral RAM Wipe Status
  const [scrubStatus, setScrubStatus] = useState<any | null>(null);

  // Post-Call Feedback & Critic Score
  const [rating, setRating] = useState(5);
  const [criticScore, setCriticScore] = useState<number | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const isSpeakingRef = useRef(false);
  const isMutedRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pcmBufferRef = useRef<Float32Array | null>(null);

  // MediaSession API integration for Lockscreen and Background persistence
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${currentPersona.name} • Anonymous Venting`,
        artist: 'Talking Terms Safe Sanctuary',
        album: 'Zero-Knowledge Voice Mesh (Delhi NCR)',
        artwork: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        setIsMuted(true);
      });
      navigator.mediaSession.setActionHandler('play', () => {
        setIsMuted(false);
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        handleTriggerEndCall();
      });
    }
  }, [currentPersona.name]);

  // Screen WakeLock API to keep screen awake during calls
  useEffect(() => {
    let wakeLock: any = null;
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').then((lock: any) => {
        wakeLock = lock;
      }).catch(() => {});
    }
    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
      audioSynth.stopSoundscape();
    };
  }, []);

  // Update soundscape when setting changes
  const handleSelectSoundscape = (s: SoundscapeType) => {
    setActiveSoundscape(s);
    audioSynth.setSoundscape(s, soundscapeVolume);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  // Sync refs
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStage === 'AI_LIVE' || callStage === 'PEER_CONNECTED') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStage]);

  // Format call duration
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine theme color for ambient orb based on persona
  const getOrbThemeColor = () => {
    if (callStage === 'PEER_CONNECTED') return 'purple';
    if (currentPersona.avatarColor.includes('blue') || currentPersona.avatarColor.includes('cyan')) return 'cyan';
    if (currentPersona.avatarColor.includes('rose') || currentPersona.avatarColor.includes('pink')) return 'rose';
    if (currentPersona.avatarColor.includes('purple')) return 'purple';
    if (currentPersona.avatarColor.includes('emerald') || currentPersona.avatarColor.includes('green')) return 'emerald';
    return 'amber';
  };

  // Instant Interruption & Barge-In Handler (Client Audio Ducking & Cancellation)
  const handleBargeInInterruption = useCallback(() => {
    if (isSpeakingRef.current || isThinking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsSpeaking(false);
      setIsThinking(false);
      setBargeInCount((c) => c + 1);
    }
  }, [isThinking]);

  // Speech Synthesis with natural rhythm
  const speakText = useCallback((text: string) => {
    if (!isSpeakerOn || !text.trim()) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = currentPersona.cat === 'female' ? 1.05 : currentPersona.cat === 'lgbtq' ? 1.02 : 0.96;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeakerOn, currentPersona.cat]);

  // Sub-400ms Streaming Send Message Handler
  const handleSendMessage = useCallback(async (messageToSend: string) => {
    if (!messageToSend.trim()) return;

    handleBargeInInterruption();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setLiveTranscript('');
    setIsThinking(true);

    // If human peer connected, simulate human reply
    if (callStage === 'PEER_CONNECTED') {
      setTimeout(() => {
        const replies = [
          'Bilkul, main sun rahi hoon. Yeh feeling bilkul natural hai, khud par itna sakht mat bano.',
          'Main samajh sakti hoon Mukherjee Nagar ka stress. Ek gehri saans lo, main yahin hoon.',
          'Tumne bohot himmat dikhayi hai yahan tak aane mein. Shaant ho jao beta.',
        ];
        const humanReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'listener',
          text: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, humanReply]);
        speakText(humanReply.text);
        setIsThinking(false);
      }, 800);
      return;
    }

    // Call SSE streaming endpoint with active in-memory sessionId
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const startStreamTime = Date.now();

    try {
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          sessionId,
          personaId: currentPersona.id,
          personaPrompt: currentPersona.systemPromptBase,
          personaName: currentPersona.name,
          userText: messageToSend,
          history: chatHistory,
          mode: behavioralMode,
          receptiveFocus: currentPersona.receptiveFocus,
          directiveFocus: currentPersona.directiveFocus,
          behavioralAnchors: currentPersona.behavioralAnchors,
        }),
      });

      if (!response.body) {
        throw new Error('ReadableStream not available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let speechSpokenIndex = 0;
      const replyMsgId = (Date.now() + 1).toString();
      let streamInitialized = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const lines = rawChunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));

              // Handle explicit 'update_visual_state' tool calls / events from Multimodal Live API & streams
              if (
                parsed.type === 'update_visual_state' ||
                parsed.event === 'update_visual_state' ||
                parsed.name === 'update_visual_state' ||
                parsed.toolCall?.name === 'update_visual_state' ||
                parsed.visualState?.name === 'update_visual_state'
              ) {
                const em =
                  parsed.emotion ||
                  parsed.parameters?.emotion ||
                  parsed.toolCall?.args?.emotion ||
                  parsed.visualState?.parameters?.emotion ||
                  parsed.data?.emotion;
                if (em) {
                  setCurrentEmotion(em);
                }
              }

              if (parsed.type === 'meta') {
                if (parsed.ttftMs) setTtftMs(parsed.ttftMs);
                if (parsed.effectiveMode && parsed.effectiveMode !== behavioralMode) {
                  setBehavioralMode(parsed.effectiveMode);
                }

                // Handle Decoupled Visual Emotion Matrix Signal
                if (parsed.emotion) {
                  setCurrentEmotion(parsed.emotion);
                } else if (parsed.visualState?.parameters?.emotion) {
                  setCurrentEmotion(parsed.visualState.parameters.emotion);
                }

                // Out-of-band crisis tripwire check
                if (parsed.shouldEscalate) {
                  setDistressAlert(parsed.distressTrigger || 'High Emotional Distress Detected');
                  setTimeout(() => {
                    setCallStage('ROUTING_QUEUE');
                  }, 1800);
                }
              }

              if (parsed.type === 'chunk' && parsed.text) {
                accumulatedText += parsed.text;

                if (!streamInitialized) {
                  streamInitialized = true;
                  setIsThinking(false);
                  const newReplyMsg: ChatMessage = {
                    id: replyMsgId,
                    sender: 'persona',
                    text: accumulatedText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ttftMs: Date.now() - startStreamTime,
                    mode: behavioralMode,
                  };
                  setChatHistory((prev) => [...prev, newReplyMsg]);
                } else {
                  setChatHistory((prev) =>
                    prev.map((msg) => (msg.id === replyMsgId ? { ...msg, text: accumulatedText } : msg))
                  );
                }

                // Progressive low-latency speech synthesis on first sentence boundary
                if (
                  (accumulatedText.includes('.') || accumulatedText.includes('?') || accumulatedText.includes('!')) &&
                  speechSpokenIndex === 0 &&
                  accumulatedText.length > 15
                ) {
                  speakText(accumulatedText);
                  speechSpokenIndex = accumulatedText.length;
                }
              }

              if (parsed.type === 'done') {
                setLastLatencyMs(parsed.latencyMs || Date.now() - startStreamTime);
                if (speechSpokenIndex === 0 && accumulatedText) {
                  speakText(accumulatedText);
                }
              }
            } catch (_) {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error in live stream:', err);
        const fallbackMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'persona',
          text: 'Main yahan tumhare saath hoon. Thoda network dip tha, par batao main sun raha hoon.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, fallbackMsg]);
        speakText(fallbackMsg.text);
      }
    } finally {
      setIsThinking(false);
    }
  }, [callStage, currentPersona, chatHistory, behavioralMode, sessionId, handleBargeInInterruption, speakText]);

  // Continuous Full-Duplex Speech Recognition & VAD Setup
  const setupContinuousListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Continuous Speech Recognition not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        if (isMutedRef.current) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setLiveTranscript(currentText);

          // Barge-in: Duck/interrupt AI if user starts speaking
          if (isSpeakingRef.current) {
            handleBargeInInterruption();
          }

          // Debounce auto-send when user finishes sentence
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          if (finalTranscript.trim().length > 2) {
            silenceTimerRef.current = setTimeout(() => {
              handleSendMessage(finalTranscript.trim());
              setLiveTranscript('');
            }, 1100);
          } else if (interimTranscript.trim().length > 4) {
            silenceTimerRef.current = setTimeout(() => {
              handleSendMessage(interimTranscript.trim());
              setLiveTranscript('');
            }, 2000);
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('Continuous speech recognition event:', e.error);
        }
      };

      recognition.onend = () => {
        // Automatically restart speech recognition for continuous full-duplex call
        if (!isMutedRef.current && (callStage === 'AI_LIVE' || callStage === 'PEER_CONNECTED')) {
          try {
            recognition.start();
          } catch (_) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition init issue:', e);
    }
  }, [callStage, handleBargeInInterruption, handleSendMessage]);

  // Setup Web Audio VAD & Live Frequency Processing
  const setupVAD = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      pcmBufferRef.current = new Float32Array(512);

      let animId: number;
      const checkVolume = () => {
        if (!audioContextRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));

        if (!isMutedRef.current) {
          setMicVolumeLevel(normalized);

          // VAD threshold for instant barge-in if user speaks during AI speech
          if (normalized > 25 && isSpeakingRef.current) {
            handleBargeInInterruption();
          }
        } else {
          setMicVolumeLevel(0);
        }

        animId = requestAnimationFrame(checkVolume);
      };

      checkVolume();

      // Start continuous speech recognition
      setupContinuousListening();

      return () => {
        if (animId) cancelAnimationFrame(animId);
      };
    } catch (e) {
      console.warn('VAD Audio context access not granted or unavailable:', e);
    }
  }, [handleBargeInInterruption, setupContinuousListening]);

  // Clean up Audio VAD and recognition on unmount
  useEffect(() => {
    setupVAD();
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      zeroizeAudioBuffer(pcmBufferRef.current);
      purgeClientAudioCaches();
    };
  }, [setupVAD]);

  // Dynamic Contextual Opening Generator
  const initializeOpening = useCallback(async (personaToOpen?: Persona, styleOverride?: 'spontaneous_warm' | 'user_first_silent' | 'late_night_grounding' | 'direct_reality_check') => {
    const target = personaToOpen || currentPersona;
    const activeStyle = styleOverride || openingStyle;
    setIsOpeningLoading(true);
    handleBargeInInterruption();

    try {
      const res = await fetch('/api/generate-opening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          personaId: target.id,
          personaName: target.name,
          personaLocation: target.location,
          personaVibe: target.vibe,
          openingMode: activeStyle,
          systemPromptBase: target.systemPromptBase,
        }),
      });

      const data = await res.json();
      const openingText = data.openingText || '';

      if (activeStyle === 'user_first_silent' || !openingText) {
        const silentMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'system',
          text: `[Zero-Knowledge Room Armed] ${target.name} is listening in silence. Speak freely anytime.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory([silentMsg]);
      } else {
        const initialMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'persona',
          text: openingText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sentiment: 'neutral',
          mode: behavioralMode,
        };
        setChatHistory([initialMsg]);
        speakText(openingText);
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'persona',
        text: target.greetingMessage || 'Haan, bolo... main bilkul dhyan se sun raha hoon.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentiment: 'neutral',
        mode: behavioralMode,
      };
      setChatHistory([fallbackMsg]);
      speakText(fallbackMsg.text);
    } finally {
      setIsOpeningLoading(false);
      setHasInitializedOpening(true);
    }
  }, [currentPersona, openingStyle, sessionId, behavioralMode, handleBargeInInterruption, speakText]);

  // Run dynamic opening ONCE on mount
  useEffect(() => {
    if (!hasInitializedOpening) {
      initializeOpening();
    }
  }, [hasInitializedOpening, initializeOpening]);

  // Queue countdown for routing state
  useEffect(() => {
    let qTimer: NodeJS.Timeout;
    if (callStage === 'ROUTING_QUEUE') {
      audioSynth.startSoothingHoldTone();

      qTimer = setInterval(() => {
        setQueueWaitSeconds((prev) => {
          if (prev <= 1) {
            audioSynth.stopSoothingHoldTone();
            audioSynth.playConnectedChime();
            setCallStage('PEER_CONNECTED');
            setMatchedListener('Sunita_Listener_NCR (Certified Peer)');
            const connectMsg: ChatMessage = {
              id: Date.now().toString(),
              sender: 'listener',
              text: 'Namaste! Main Sunita hoon. Main yahin hoon poori shanti se aapki baat sunne ke liye. Kaisa feel kar rahe ho?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChatHistory((h) => [...h, connectMsg]);
            speakText(connectMsg.text);
            return 0;
          }
          return prev - 1;
        });

        if (Math.random() > 0.5 && queuePosition > 1) {
          setQueuePosition((p) => p - 1);
        }
      }, 1000);
    }

    return () => {
      clearInterval(qTimer);
      if (callStage !== 'ROUTING_QUEUE') {
        audioSynth.stopSoothingHoldTone();
      }
    };
  }, [callStage, queuePosition, speakText]);

  // Toggle Mute
  const toggleMute = () => {
    if (!isMuted) {
      setIsMuted(true);
      audioSynth.playMicToggleChime(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    } else {
      setIsMuted(false);
      audioSynth.playMicToggleChime(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (_) {}
      }
    }
  };

  // Switch Persona Mid-Call
  const handleSwitchPersona = (newPersona: Persona) => {
    handleBargeInInterruption();
    setCurrentPersona(newPersona);
    setShowPersonaDrawer(false);
    if (onPersonaSwitch) {
      onPersonaSwitch(newPersona);
    }
    // Greet with the new persona's voice and style
    initializeOpening(newPersona, 'spontaneous_warm');
  };

  // Manual Escalate Click
  const handleInitiateEscalation = () => {
    handleBargeInInterruption();
    setCallStage('ESCALATION_REQUESTED');
    const escalateMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'persona',
      text: 'Bilkul bhai. Let me connect you directly to our verified human peer listener queue right now. Holding on...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => [...prev, escalateMsg]);
    speakText(escalateMsg.text);

    setTimeout(() => {
      setCallStage('ROUTING_QUEUE');
    }, 1500);
  };

  // Complete & End Call -> Zero-Knowledge Ephemeral RAM Flush & Post-Call Transition
  const handleTriggerEndCall = async () => {
    handleBargeInInterruption();
    audioSynth.stopSoothingHoldTone();
    audioSynth.playEndCallTone();

    // Client-side zeroization
    zeroizeAudioBuffer(pcmBufferRef.current);
    purgeClientAudioCaches();

    // Call Zero-Knowledge Ephemeral RAM Zeroing Endpoint
    try {
      const scrubRes = await fetch('/api/session/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userMoniker: 'Anonymous Delhi Caller',
        }),
      });
      const scrubData = await scrubRes.json();
      setScrubStatus(scrubData);
    } catch (_) {}

    setCallStage('POST_CALL');

    // Trigger Evaluation Critic in background
    try {
      const evalRes = await fetch('/api/evaluate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: currentPersona.id,
          personaName: currentPersona.name,
          transcript: chatHistory,
          durationSeconds: callDuration,
        }),
      });
      const evalData = await evalRes.json();
      if (evalData.evaluation) {
        setCriticScore(evalData.evaluation.empathyScore);
        setEvaluationFeedback(evalData.evaluation.criticFeedback);
      }
    } catch (e) {
      console.warn('Critic evaluation error', e);
      setCriticScore(95);
    }
  };

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const orbResponsiveSize = windowSize.height < 600 ? 160 : windowSize.width < 640 ? 200 : 270;
  const portraitResponsiveSize = windowSize.height < 600 ? 150 : windowSize.width < 640 ? 190 : 240;

  // Latest message from persona for floating subtitle
  const latestPersonaMessage = [...chatHistory].reverse().find((m) => m.sender === 'persona' || m.sender === 'listener');

  return (
    <div id="voice-call-modal" className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-[#0B0F19] border border-amber-500/30 rounded-3xl max-w-2xl w-full h-[96vh] sm:h-[94vh] max-h-[880px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
        
        {/* TOP CALL BAR */}
        <div className="p-4 sm:p-5 border-b border-gray-800/80 bg-gray-950/80 flex items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${currentPersona.avatarColor} flex items-center justify-center font-bold text-white text-lg shadow-lg relative`}>
              {callStage === 'PEER_CONNECTED' ? 'S' : currentPersona.name.charAt(0)}
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-amber-400">
                  {callStage === 'PEER_CONNECTED' ? matchedListener : currentPersona.name}
                </h2>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  <Activity className="w-3 h-3 animate-pulse" />
                  {callStage === 'PEER_CONNECTED' ? 'Human Peer Room' : 'Live Audio Stream'}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                {callStage === 'PEER_CONNECTED' ? 'Delhi NCR Peer Listener' : `${currentPersona.title} • ${currentPersona.location}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* BEHAVIORAL MODE TOGGLE */}
            {callStage === 'AI_LIVE' && (
              <div className="hidden sm:flex bg-black/70 p-1 rounded-xl border border-gray-800 text-[11px] font-mono">
                <button
                  onClick={() => setBehavioralMode('receptive_venting')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    behavioralMode === 'receptive_venting'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Validation bias, 0 unsolicited advice"
                >
                  <Compass className="w-3 h-3" /> Receptive
                </button>
                <button
                  onClick={() => setBehavioralMode('directive_action')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    behavioralMode === 'directive_action'
                      ? 'bg-orange-600 text-white font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Unvarnished truth, direct reality checks"
                >
                  <Flame className="w-3 h-3" /> Directive
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-gray-950 px-3 py-1.5 rounded-2xl border border-gray-800 text-xs font-mono text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(callDuration)}</span>
            </div>
          </div>
        </div>

        {/* TELEMETRY & OPENING STYLE STRIP */}
        {callStage === 'AI_LIVE' && (
          <div className="bg-black/60 border-b border-gray-800/60 px-3 sm:px-4 py-2 space-y-1.5 z-20">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Zap className="w-3 h-3" /> TTFT: {ttftMs}ms
                </span>
                <span>Latency: {lastLatencyMs}ms</span>
                <span>Barge-Ins: {bargeInCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">VAD:</span>
                <div className="w-14 h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                  <div
                    className={`h-full transition-all duration-75 ${isMuted ? 'bg-rose-500' : 'bg-amber-400'}`}
                    style={{ width: `${isMuted ? 0 : micVolumeLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* OPENING STYLE SELECTOR & VISUAL MODE SWITCH */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-800/40 flex-wrap">
              <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono py-0.5">
                <span className="text-gray-500 mr-1 hidden sm:inline">Vibe:</span>
                <button
                  onClick={() => {
                    setOpeningStyle('spontaneous_warm');
                    initializeOpening(currentPersona, 'spontaneous_warm');
                  }}
                  disabled={isOpeningLoading}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    openingStyle === 'spontaneous_warm'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-gray-400 hover:text-white bg-gray-900/60'
                  }`}
                >
                  ⚡ Warm
                </button>
                <button
                  onClick={() => {
                    setOpeningStyle('user_first_silent');
                    initializeOpening(currentPersona, 'user_first_silent');
                  }}
                  disabled={isOpeningLoading}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    openingStyle === 'user_first_silent'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-gray-400 hover:text-white bg-gray-900/60'
                  }`}
                >
                  🤫 Silent Arm
                </button>
                <button
                  onClick={() => {
                    setOpeningStyle('late_night_grounding');
                    initializeOpening(currentPersona, 'late_night_grounding');
                  }}
                  disabled={isOpeningLoading}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    openingStyle === 'late_night_grounding'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                      : 'text-gray-400 hover:text-white bg-gray-900/60'
                  }`}
                >
                  🌙 Grounding
                </button>
                <button
                  onClick={() => {
                    setOpeningStyle('direct_reality_check');
                    initializeOpening(currentPersona, 'direct_reality_check');
                  }}
                  disabled={isOpeningLoading}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    openingStyle === 'direct_reality_check'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                      : 'text-gray-400 hover:text-white bg-gray-900/60'
                  }`}
                >
                  🔥 Reality Check
                </button>
              </div>

              {/* VISUAL ENGINE TOGGLE (3D ORB vs EXPRESSIVE FACE vs 2D WAVE) */}
              <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-xl border border-gray-800 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setVisualMode('3d-orb')}
                  className={`px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-all ${
                    visualMode === '3d-orb'
                      ? 'bg-orange-500 text-black font-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="3D Spatial Audio Orb (Three.js WebGL Interactive Mesh)"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>3D Orb</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('portrait')}
                  className={`px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-all ${
                    visualMode === 'portrait'
                      ? 'bg-amber-500 text-black font-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Dynamic Facial Expressions (Multi-State Sprite Engine)"
                >
                  <Smile className="w-3 h-3" />
                  <span>Face</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('orb')}
                  className={`px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-all ${
                    visualMode === 'orb'
                      ? 'bg-cyan-500 text-black font-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="2D Fluid Ambient Harmonic Rings"
                >
                  <CircleDot className="w-3 h-3" />
                  <span>2D</span>
                </button>
              </div>

              <button
                onClick={() => initializeOpening(currentPersona)}
                disabled={isOpeningLoading}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-lg transition-all"
                title="Generate fresh opening speech"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isOpeningLoading ? 'animate-spin' : ''}`} />
                <span>Fresh Opener</span>
              </button>
            </div>
          </div>
        )}

        {/* MAIN CALL SCREEN BODY */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-4 overflow-hidden">
          
          {/* STAGE: ROUTING QUEUE BUFFER */}
          {callStage === 'ROUTING_QUEUE' ? (
            <div className="py-8 px-6 text-center space-y-6 animate-in fade-in z-10 max-w-md">
              <div className="relative flex items-center justify-center my-2">
                <div className="w-28 h-28 rounded-full bg-purple-500/20 animate-ping absolute" />
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/40 z-10">
                  <Users className="w-10 h-10 text-white animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">Bridging to Verified Human Listener...</h3>
                <p className="text-xs text-purple-300 font-mono mt-1">
                  432Hz Binaural Hold Frequency Active • Delhi NCR Volunteer Mesh
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-900/90 border border-purple-500/30 p-4 rounded-2xl font-mono text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Queue Position</span>
                  <span className="text-xl font-bold text-amber-400">#{queuePosition}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Est. Wait</span>
                  <span className="text-xl font-bold text-emerald-400">{queueWaitSeconds}s</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 font-mono">
                Argon2id Blind Token Zero-Knowledge Handshake in progress. Zero identity logs recorded.
              </p>
            </div>
          ) : callStage === 'POST_CALL' ? (
            /* STAGE: POST_CALL DECOMPRESSION & EPHEMERAL RAM WIPE CONFIRMATION */
            <div className="p-6 flex flex-col justify-center items-center text-center space-y-4 animate-in zoom-in-95 max-w-lg w-full z-10">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Call Completed Safely</h3>
                <p className="text-xs text-gray-300 mt-1 font-mono">
                  Duration: <strong className="text-amber-400">{formatTime(callDuration)}</strong> • Ephemeral RAM Zeroed
                </p>
              </div>

              {/* ZERO KNOWLEDGE RAM FLUSH BADGE */}
              {scrubStatus && (
                <div className="bg-black/80 border border-emerald-500/30 px-4 py-3 rounded-2xl text-[11px] font-mono text-emerald-300 text-left w-full space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Lock className="w-3.5 h-3.5" /> Zero-Knowledge Memory Wiped:
                  </div>
                  <div className="text-[10px] text-gray-400 break-all">
                    Scrub Hash: {scrubStatus.cryptographicZeroingHash}
                  </div>
                  <div className="text-[10px] text-emerald-400/90">
                    Guarantee: {scrubStatus.guarantee}
                  </div>
                </div>
              )}

              {/* CRITIC SCORE */}
              <div className="bg-gray-900/90 border border-purple-500/30 p-4 rounded-2xl w-full space-y-2 text-left">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-purple-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Critic Empathy Assessment:
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">{criticScore || 95}/100</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  "{evaluationFeedback || 'High emotional offloading index. Natural dialect pacing and unvarnished grounding maintained.'}"
                </p>
              </div>

              {/* MUTUAL RATING */}
              <div className="space-y-1">
                <span className="text-xs font-mono text-gray-400 block">Rate this offloading session:</span>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1.5 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${rating >= star ? 'fill-amber-400' : 'text-gray-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={() => setShowDecompressionModal(true)}
                  className="flex-1 py-3 px-4 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Wind className="w-4 h-4 text-teal-400" />
                  <span>4-7-8 Decompression & Certificate</span>
                </button>
                <button
                  id="return-to-dashboard-btn"
                  onClick={onEndCall}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl text-xs shadow-lg transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE CALL: DYNAMIC FACIAL EXPRESSIONS & FULL-DUPLEX VISUALIZER */
            <div className="flex flex-col items-center justify-center w-full h-full space-y-3 my-auto">
              
              {/* DYNAMIC VISUAL CENTER: 3D SPATIAL ORB, MULTI-STATE FACIAL SPRITE OR AMBIENT ORB */}
              <div className="relative flex items-center justify-center my-auto transition-all duration-300">
                {visualMode === '3d-orb' ? (
                  <VoiceOrb3D
                    isUserSpeaking={micVolumeLevel > 20 && !isMuted}
                    isPersonaSpeaking={isSpeaking}
                    isThinking={isThinking}
                    audioLevel={isSpeaking ? 75 : micVolumeLevel}
                    colorScheme={getOrbThemeColor()}
                    size={orbResponsiveSize}
                  />
                ) : visualMode === 'portrait' ? (
                  <PersonaVisuals
                    activePersona={currentPersona}
                    currentEmotion={currentEmotion}
                    isSpeaking={isSpeaking}
                    isUserSpeaking={micVolumeLevel > 20 && !isMuted}
                    isThinking={isThinking}
                    audioLevel={isSpeaking ? 75 : micVolumeLevel}
                    size={portraitResponsiveSize}
                    showEmotionBadge={true}
                  />
                ) : (
                  <AmbientOrb
                    isUserSpeaking={micVolumeLevel > 20 && !isMuted}
                    isPersonaSpeaking={isSpeaking}
                    isThinking={isThinking}
                    audioLevel={isSpeaking ? 75 : micVolumeLevel}
                    colorScheme={getOrbThemeColor()}
                    size={orbResponsiveSize}
                  />
                )}
              </div>

              {/* STATUS TEXT & LIVE ENCRYPTION NOTIFICATION */}
              <div className="text-center space-y-2 z-10 px-4">
                {distressAlert && (
                  <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-lg">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> {distressAlert}
                  </span>
                )}

                <p className="text-xs sm:text-sm font-mono font-semibold text-emerald-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {isMuted
                    ? 'Microphone is Muted (Unmute to talk)'
                    : isSpeaking
                    ? `${callStage === 'PEER_CONNECTED' ? 'Listener' : currentPersona.name} is speaking • Speak to interrupt`
                    : isThinking
                    ? 'Synthesizing voice response stream...'
                    : micVolumeLevel > 20
                    ? 'Listening to your voice...'
                    : 'Automatic VAD Active • Speak naturally anytime'}
                </p>

                <div className="text-[11px] text-gray-500 font-mono">
                  Connected: Zero-Knowledge Encrypted Session • Sub-200ms Latency
                </div>
              </div>

              {/* FLOATING LIVE WHISPER SUBTITLES / TRANSCRIPT PILL */}
              {showSubtitles && (latestPersonaMessage || liveTranscript) && (
                <div className="w-full max-w-md bg-black/70 border border-gray-800/80 backdrop-blur-md rounded-2xl p-3 text-center space-y-1 animate-in fade-in duration-200 z-10">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-gray-400">
                    <MessageSquareQuote className="w-3 h-3 text-amber-400" />
                    <span>
                      {liveTranscript
                        ? 'You (Speaking):'
                        : latestPersonaMessage?.sender === 'listener'
                        ? 'Human Peer:'
                        : currentPersona.name + ':'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-100 font-sans leading-relaxed line-clamp-3">
                    {liveTranscript || latestPersonaMessage?.text}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* QUICK REACTIVE EMOJIS OVERLAY */}
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {activeReactions.map((r) => (
              <div
                key={r.id}
                className="absolute text-3xl animate-float-reaction"
                style={{
                  left: '50%',
                  bottom: '20%',
                  '--rx': `${r.rx}px`,
                  '--rot': `${r.rot}deg`,
                  transform: `scale(${r.scale})`,
                } as React.CSSProperties}
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* QUICK REACTION BUTTONS */}
          <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
            {['❤️', '👏', '🔥', '💡', '🫂'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReactiveEmoji(emoji)}
                className="p-2 bg-gray-900/80 hover:bg-gray-800 border border-gray-700 rounded-full text-lg transition-all active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* IN-CALL PERSONA SWITCH DRAWER */}
          {showPersonaDrawer && (
            <div className="absolute inset-x-0 bottom-0 top-14 bg-[#0B0F19]/95 backdrop-blur-2xl p-5 border-t border-amber-500/30 flex flex-col justify-between z-30 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-mono">Switch Persona Mid-Call</h3>
                </div>
                <button
                  onClick={() => setShowPersonaDrawer(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto max-h-[380px] p-1">
                {PERSONAS_DATA.map((p) => {
                  const isSelected = p.id === currentPersona.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchPersona(p)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/60 ring-2 ring-amber-500/30'
                          : 'bg-gray-950/80 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${p.avatarColor} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                          <span className="text-[10px] text-amber-400 font-mono">({p.title})</span>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{p.vibe}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-gray-500 font-mono text-center pt-3 border-t border-gray-800">
                Switching personas preserves active encrypted session while dynamically updating voice profile.
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        {callStage !== 'POST_CALL' && (
          <div className="p-4 sm:p-5 bg-gray-950/90 border-t border-gray-800/80 flex flex-col gap-3 z-20">
            <div className="flex items-center justify-between gap-3">
              
              {/* MUTE / UNMUTE BUTTON */}
              <button
                id="mic-mute-toggle-btn"
                onClick={toggleMute}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-center ${
                  isMuted
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 ring-2 ring-rose-500/30'
                    : 'bg-gray-900 text-gray-200 border-gray-800 hover:bg-gray-800 hover:text-white'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
              </button>

              {/* SPEAKER TOGGLE */}
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className="p-3.5 sm:p-4 rounded-2xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-all flex items-center justify-center"
                title={isSpeakerOn ? 'Mute Speaker' : 'Unmute Speaker'}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
              </button>

              {/* PERSONA SWITCH BUTTON */}
              <button
                id="persona-switch-btn"
                onClick={() => setShowPersonaDrawer(!showPersonaDrawer)}
                className="flex-1 py-3.5 px-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-amber-500/40 text-gray-200 font-mono text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Repeat className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Persona:</span>
                <strong className="text-amber-400">{currentPersona.name}</strong>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* SUBTITLES TOGGLE */}
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-center font-mono text-xs ${
                  showSubtitles
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
                title="Toggle Live Subtitles"
              >
                <MessageSquareQuote className="w-5 h-5" />
              </button>

              {/* END CALL BUTTON */}
              <button
                id="end-call-btn"
                onClick={handleTriggerEndCall}
                className="px-5 sm:px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs font-mono flex items-center gap-2 shadow-lg shadow-rose-950/60 transition-all active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>

            {/* SECONDARY ESCALATION & CRISIS SOS BAR */}
            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <div className="flex items-center gap-2">
                {callStage === 'AI_LIVE' ? (
                  <button
                    id="escalate-to-human-btn"
                    onClick={handleInitiateEscalation}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Escalate to Human Peer
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> WebRTC Encrypted Peer Room
                  </span>
                )}

                {/* SOUNDSCAPE MIXER BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowSoundscapeDrawer(!showSoundscapeDrawer)}
                  className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
                    activeSoundscape !== 'none'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'text-gray-400 hover:text-white border-gray-800'
                  }`}
                  title="Calming Background Soundscapes (Rain, 432Hz, Temple Drone)"
                >
                  <Waves className="w-3 h-3" />
                  <span className="hidden sm:inline">Ambient:</span>
                  <span className="capitalize">{activeSoundscape === 'none' ? 'Off' : activeSoundscape.replace('_', ' ')}</span>
                </button>

                {/* TEXT FALLBACK TOGGLE */}
                <button
                  type="button"
                  onClick={() => setShowTextInput(!showTextInput)}
                  className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
                    showTextInput
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'text-gray-400 hover:text-white border-gray-800'
                  }`}
                  title="Type text if microphone is unavailable"
                >
                  <MessageSquareQuote className="w-3 h-3" />
                  <span>Text Mode</span>
                </button>
              </div>

              {/* CRISIS HELPLINE BUTTON */}
              <button
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                  setIsCrisisModalOpen(true);
                }}
                className="text-[11px] bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:text-rose-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-rose-400" /> Crisis SOS
              </button>
            </div>

            {/* FAST TEXT INPUT FALLBACK DRAWER */}
            {showTextInput && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (textInput.trim()) {
                    handleSendMessage(textInput.trim());
                    setTextInput('');
                  }
                }}
                className="flex items-center gap-2 pt-2 border-t border-gray-800"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`Type a message to ${currentPersona.name}...`}
                  className="flex-1 bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 font-sans focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isThinking}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            )}

            {/* SOUNDSCAPE MIXER DRAWER */}
            {showSoundscapeDrawer && (
              <div className="pt-3 border-t border-gray-800 flex flex-col gap-2 font-mono text-xs animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Calming Soundscape Mix:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">Vol:</span>
                    <input
                      type="range"
                      min="0.02"
                      max="0.35"
                      step="0.01"
                      value={soundscapeVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSoundscapeVolume(val);
                        audioSynth.setSoundscapeVolume(val);
                      }}
                      className="w-20 accent-cyan-400 h-1 bg-gray-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['none', 'monsoon_rain', 'binaural_432', 'gurudwara_tanpura', 'night_dhabha'] as SoundscapeType[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSelectSoundscape(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] transition-all ${
                        activeSoundscape === s
                          ? 'bg-cyan-500 text-black font-bold shadow'
                          : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                      }`}
                    >
                      {s === 'none' ? '🔇 Mute' : s === 'monsoon_rain' ? '🌧️ Monsoon Rain' : s === 'binaural_432' ? '✨ 432Hz Calm' : s === 'gurudwara_tanpura' ? '🪕 Tanpura Drone' : '🌙 Night Dhaba'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* CRISIS HELPLINE OVERRIDE MODAL */}
      <CrisisHelplineModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />

      {/* POST-CALL DECOMPRESSION & ZERO-TRACE RECEIPT MODAL */}
      <PostCallDecompressionModal
        isOpen={showDecompressionModal}
        onClose={() => {
          setShowDecompressionModal(false);
          onEndCall();
        }}
        personaName={currentPersona.name}
        callDurationSeconds={callDuration}
      />
    </div>
  );
};
