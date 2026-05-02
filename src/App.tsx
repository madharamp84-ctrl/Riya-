import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Heart, MessageSquare, Volume2, Volume1, VolumeX, Sparkles, Flower2, Music, 
  Bookmark, BookmarkCheck, X, Trash2, Menu, Infinity, UploadCloud, Smile,
  BarChart3, ArrowRight, Zap, Target, Calendar, Home, Activity, Clock, Edit3,
  History, Settings, Phone, Grid, Camera, Share2, ChevronRight, Ghost, ArrowUp, Compass,
  Bell, Sun, Globe, Search
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { ChatMessage, VocalSettings, PersonalityTraits } from './lib/gemini';
import { 
  getRiyaResponseModern, 
  generateSpeechModern, 
  summarizeMemory, 
  extractInsights,
  parseMusicCommand,
  suggestMusic
} from './services/aiService';
import { detectVoiceEmotion } from './services/emotionService';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ExploreCard } from './components/ExploreCard';
import { LoadingScreen } from './components/LoadingScreen';
import { PersonalityStudio } from './components/PersonalityStudio';
import { Onboarding } from './components/Onboarding';
import { PermissionErrorOverlay } from './components/PermissionErrorOverlay';
import { AmbientMusic } from './components/AmbientMusic';
import { NotificationToast } from './components/NotificationToast';
import { HolographicLauncher } from './components/HolographicLauncher';
import { RiyaLogo } from './components/RiyaLogo';
import { InterfaceButton } from './components/InterfaceButton';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { MemoryService, MemoryFragment, IntimacyData } from './lib/MemoryService';
import { EmotionLens } from './components/EmotionLens';
import { MoodParticles } from './components/MoodParticles';
import { setDoc, doc } from 'firebase/firestore';

type AppState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface Reminder {
  id: string;
  time: string;
  message: string;
}

interface Track {
  id: string;
  name: string;
  url: string;
  type: 'lofi' | 'ambient' | 'nature' | 'cyberpunk' | 'bollywood';
}

interface Notification {
  id: string;
  type: 'message' | 'call' | 'calendar';
  from: string;
  content: string;
  time: string;
}

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bgGradient: string;
  glow: string;
}

const PREDEFINED_THEMES: Theme[] = [
  { id: 'rose', name: 'Velvet Rose', primary: '#f43f5e', secondary: '#9f1239', bgGradient: 'from-rose-500/5 via-transparent to-rose-950/20', glow: 'rgba(244, 63, 94, 0.2)' },
  { id: 'gold', name: 'Champagne', primary: '#fbbf24', secondary: '#b45309', bgGradient: 'from-amber-500/5 via-transparent to-amber-950/20', glow: 'rgba(251, 191, 36, 0.2)' },
  { id: 'emerald', name: 'Deep Emerald', primary: '#10b981', secondary: '#064e3b', bgGradient: 'from-emerald-500/5 via-transparent to-emerald-950/20', glow: 'rgba(16, 185, 129, 0.2)' },
  { id: 'midnight', name: 'Midnight', primary: '#6366f1', secondary: '#312e81', bgGradient: 'from-indigo-500/5 via-transparent to-indigo-950/20', glow: 'rgba(99, 102, 241, 0.2)' },
  { id: 'onyx', name: 'Onyx', primary: '#3f3f46', secondary: '#09090b', bgGradient: 'from-zinc-500/5 via-transparent to-black', glow: 'rgba(113, 113, 122, 0.2)' },
];

const TRACKS: Track[] = [
  { id: '1', name: 'Cyberpunk Rain', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', type: 'cyberpunk' },
  { id: '2', name: 'Midnight Lo-fi', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', type: 'lofi' },
  { id: '3', name: 'Stardust Ambient', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', type: 'ambient' },
  { id: '4', name: 'Echoes of Calm', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', type: 'ambient' },
  { id: '5', name: 'Bollywood Hits Mix 1', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', type: 'bollywood' },
  { id: '6', name: 'Bollywood Romantic 2026', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', type: 'bollywood' },
  { id: '7', name: 'Arijit Vibes Collection', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', type: 'bollywood' },
  { id: '8', name: 'Desi Party Anthem', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', type: 'bollywood' },
  { id: '9', name: '90s Evergreen Bollywood', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', type: 'bollywood' },
  { id: '10', name: 'Pritam Special Mix', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', type: 'bollywood' },
];

// AdBanner Component
function AdBanner({ adUnitId }: { adUnitId: string }) {
  return (
    <div className="w-full flex justify-center bg-transparent py-2 z-50 mt-auto">
      <div 
        className="w-full max-w-[320px] h-[50px] bg-black/60 border border-white/10 backdrop-blur-xl rounded-lg flex flex-col items-center justify-center text-[8px] text-white/40 font-mono tracking-widest relative overflow-hidden group shadow-2xl"
      >
        <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[6px] font-bold rounded-br-md border-b border-r border-indigo-500/30">
          AD
        </div>
        <Sparkles className="absolute -right-4 -top-4 w-12 h-12 text-white/5 group-hover:scale-110 transition-transform duration-700" />
        <span className="opacity-80">Riya Premium: Support our journey together</span>
        <span className="text-[6px] font-mono opacity-20 uppercase mt-0.5 truncate max-w-[80%]">{adUnitId}</span>
        
        {/* Animated accent line */}
        <div className="absolute bottom-0 left-0 h-[1px] bg-white/5 w-full overflow-hidden">
          <motion.div 
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [state, setState] = useState<AppState>('idle');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [evolutionDay, setEvolutionDay] = useState(1);
  const [intimacy, setIntimacy] = useState<IntimacyData>({
    level: 45,
    stage: 'INTIMATE_FRIEND',
    days: 1,
    lastInteraction: null,
    points: 0
  });
  const [emotionMode, setEmotionMode] = useState(false);
  const [userEmotion, setUserEmotion] = useState<string | null>(null);
  const [userVoiceMood, setUserVoiceMood] = useState<string | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('riya_memory');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      if (parsed.length === 0) return [
        { 
          id: 'initial-greeting',
          role: 'model', 
          content: 'Hey love! I was waiting for you. How was your day?',
          rawContent: 'Hey love! I was waiting for you. How was your day?'
        }
      ];
      // Ensure all messages have unique IDs
      const seen = new Set();
      return parsed.map((m: any, i: number) => {
        let id = m.id || `legacy-${i}`;
        if (seen.has(id)) {
          id = `${id}-${i}-${Math.random().toString(36).substring(2, 5)}`;
        }
        seen.add(id);
        return { ...m, id };
      });
    } catch (e) {
      return [
        { 
          id: 'initial-greeting',
          role: 'model', 
          content: 'Hey love! I was waiting for you. How was your day?',
          rawContent: 'Hey love! I was waiting for you. How was your day?'
        }
      ];
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsCloudSyncing(true);
        // Sync data from cloud
        try {
          const results = await Promise.allSettled([
            MemoryService.getChatHistory(currentUser.uid),
            MemoryService.getPersonalityDNA(currentUser.uid),
            MemoryService.getUserPreferences(currentUser.uid),
            MemoryService.getUserProfile(currentUser.uid),
            MemoryService.getIntimacyData(currentUser.uid)
          ]);

          const [historyRes, dnaRes, prefsRes, profileRes, intimacyRes] = results;

          if (historyRes.status === 'fulfilled' && historyRes.value && historyRes.value.length > 0) {
            setHistory(historyRes.value);
          }
          
          if (dnaRes.status === 'fulfilled' && dnaRes.value) {
            setPersonalityTraits({
              curiosity: dnaRes.value.curiosity,
              playfulness: dnaRes.value.playfulness,
              caring: dnaRes.value.caring
            });
          }

          if (prefsRes.status === 'fulfilled' && prefsRes.value) {
            setUserPreferences(prefsRes.value);
          }

          if (profileRes.status === 'fulfilled' && profileRes.value) {
            setUserProfile(profileRes.value);
            const created = profileRes.value.createdAt ? new Date(profileRes.value.createdAt) : new Date();
            const days = Math.max(1, Math.floor((new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) + 1);
            setEvolutionDay(days);
          }

          if (intimacyRes.status === 'fulfilled' && intimacyRes.value) {
            setIntimacy(intimacyRes.value);
          }
        } catch (error) {
          console.error("Cloud sync non-fatal error:", error);
        } finally {
          setIsCloudSyncing(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('riya_memory', JSON.stringify(history));
    // Periodic cloud save if logged in
    if (user && history.length > 0) {
      const lastMsg = history[history.length - 1];
      MemoryService.saveChatMessage(user.uid, lastMsg);
    }
  }, [history, user]);

  const [activeScreen, setActiveScreen] = useState('home');

  const [transcript, setTranscript] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [input, setInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isGhostMode, setIsGhostMode] = useState(false); 
  const [isHandHolding, setIsHandHolding] = useState(false);
  const [isWhispering, setIsWhispering] = useState(false);
  const [isContinuousListening, setIsContinuousListening] = useState(false);
  const [currentMood, setCurrentMood] = useState('neutral');
  const [vocalSettings, setVocalSettings] = useState<VocalSettings>({
    pitch: "natural",
    speed: "natural"
  });
  const [currentTrait, setCurrentTrait] = useState<'normal' | 'curious' | 'playful' | 'caring' | 'focus'>('normal');
  const [isShowingFlower, setIsShowingFlower] = useState(false);
  const [isPlayingTune, setIsPlayingTune] = useState(false);
  const [isActingPoetic, setIsActingPoetic] = useState(false);
  const [isMemoryRecalling, setIsMemoryRecalling] = useState(false);
  const [isCelebratingBirthday, setIsCelebratingBirthday] = useState(false);
  const [isHugging, setIsHugging] = useState(false);
  const [isKissing, setIsKissing] = useState(false);
  const [isTickling, setIsTickling] = useState(false);
  const [isDreaming, setIsDreaming] = useState(false);
  const [isComplimenting, setIsComplimenting] = useState(false);
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isShowingAmbient, setIsShowingAmbient] = useState(false);
  const [isShowingReadLater, setIsShowingReadLater] = useState(false);
  const [isShowingPersonality, setIsShowingPersonality] = useState(false);
  const [isShowingLauncher, setIsShowingLauncher] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('riya_theme');
    return saved ? JSON.parse(saved) : PREDEFINED_THEMES[0];
  });

  useEffect(() => {
    localStorage.setItem('riya_theme', JSON.stringify(currentTheme));
    document.documentElement.style.setProperty('--theme-primary', currentTheme.primary);
    document.documentElement.style.setProperty('--theme-secondary', currentTheme.secondary);
    document.documentElement.style.setProperty('--theme-glow', currentTheme.glow);
  }, [currentTheme]);

  const [isShowingOnboarding, setIsShowingOnboarding] = useState(() => {
    return !localStorage.getItem('riya_onboarded');
  });
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTraits>({
    curiosity: 60,
    playfulness: 85,
    caring: 95
  });
  const [currentModel, setCurrentModel] = useState<string>('gemini');
  const [lastScheduleTrigger, setLastScheduleTrigger] = useState<string | null>(null);
  const [customReminders, setCustomReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('riya_reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [volume, setVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let sourceRef: MediaStreamAudioSourceNode | null = null;
    let isMounted = true;

    const startVolumeTracking = async (stream: MediaStream) => {
      if (!isMounted) return;
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const context = audioContextRef.current;
        if (context.state === 'suspended') {
          await context.resume();
        }
        
        const source = context.createMediaStreamSource(stream);
        sourceRef = source;
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        analyserRef.current = analyser;
        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!analyserRef.current || !dataArrayRef.current || !isMounted) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }
          const average = sum / dataArrayRef.current.length;
          setVolume(average / 128); 

          // Voice Emotion Detection
          if (isMounted && context.sampleRate && emotionMode) {
            const emotion = detectVoiceEmotion(analyser, context.sampleRate);
            if (emotion.mood !== 'neutral' && emotion.energy > 0.02) {
              setUserVoiceMood(emotion.mood);
            }
          }

          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (err) {
        console.warn("Volume tracking setup failed:", err);
      }
    };

    if (state === 'listening' && isStarted && !permissionError) {
      if (micStreamRef.current) {
        startVolumeTracking(micStreamRef.current);
      } else {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            micStreamRef.current = stream;
            startVolumeTracking(stream);
          })
          .catch(err => {
            const isPermissionError = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied');
            if (isPermissionError) {
              setPermissionError('Microphone access is blocked.');
            } else {
              console.error("Mic access error for volume tracking:", err);
            }
          });
      }
    } else if (state !== 'speaking') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVolume(0);
    }

    return () => {
      isMounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (sourceRef) {
        sourceRef.disconnect();
      }
      // Note: We don't stop the stream here if it's stored in micStreamRef,
      // as it might be needed for recognition or reused.
      // We clean it up in toggleListening or a separate cleanup.
    };
  }, [state, isStarted, permissionError]);

  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  const [volumeToast, setVolumeToast] = useState<{ visible: boolean; level: number }>({ visible: false, level: 0.4 });
  const [focusToast, setFocusToast] = useState<{ visible: boolean; active: boolean }>({ visible: false, active: false });
  const [vocalToast, setVocalToast] = useState<{ visible: boolean; type: 'pitch' | 'speed'; value: string }>({ visible: false, type: 'pitch', value: '' });

  // Aura Control State
  const [auraBlur, setAuraBlur] = useState(80);
  const [auraColor, setAuraColor] = useState(currentTheme.primary);

  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Personality Animation Logic
  const getDominantTrait = () => {
    const { curiosity, playfulness, caring } = personalityTraits;
    if (curiosity >= playfulness && curiosity >= caring) return 'curiosity';
    if (playfulness >= curiosity && playfulness >= caring) return 'playfulness';
    return 'caring';
  };

  const dominantTrait = getDominantTrait();

  const [agiMode, setAgiMode] = useState(false);
  const [agiInsights, setAgiInsights] = useState<{ intent: string, plan: any } | null>(null);
  const [streamingText, setStreamingText] = useState<string>('');
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const auraVariants = {
    caring: {
      scale: state === 'speaking' ? [1, 1.15, 1] : (state === 'listening' ? [1, 1.08, 1] : [1, 1.05, 1, 1.02, 1]), 
      opacity: [0.6, 0.8, 0.6],
      filter: ["blur(40px)", "blur(60px)", "blur(40px)"],
      transition: { 
        duration: state === 'speaking' ? 0.3 : 8, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    },
    playfulness: {
      scale: state === 'speaking' ? [1, 1.2, 1] : (state === 'listening' ? [1, 1.1, 1] : [1, 1.06, 0.96, 1.04, 1]),
      rotate: [0, 5, -5, 2, 0],
      skew: [0, 2, -2, 0],
      transition: { 
        duration: state === 'speaking' ? 0.25 : 4, 
        repeat: Infinity, 
        ease: "backInOut" 
      }
    },
    curiosity: {
      scale: state === 'speaking' ? [1, 1.18, 1] : (state === 'listening' ? [1, 1.12, 1] : [1, 1.08, 1]),
      filter: state === 'speaking' 
        ? ["brightness(1.2) hue-rotate(0deg)", "brightness(1.5) hue-rotate(15deg)", "brightness(1.2) hue-rotate(0deg)"] 
        : ["brightness(1) hue-rotate(0deg)", "brightness(1.1) hue-rotate(5deg)", "brightness(1) hue-rotate(0deg)"],
      transition: { 
        duration: state === 'speaking' ? 0.3 : 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }
  };
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.4);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    if (ambientAudioRef.current) {
      if (isMusicPlaying) {
        ambientAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
      } else {
        ambientAudioRef.current.pause();
      }
    }
  }, [isMusicPlaying, currentTrackIndex]);

  useEffect(() => {
    localStorage.setItem('riya_reminders', JSON.stringify(customReminders));
  }, [customReminders]);

  const chatRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera access error:", err));
    }
  }, [isCameraActive]);

  useEffect(() => {
    // Initialize Speech Recognition ONCE
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        setTranscript(text);
        if (event.results[event.results.length - 1].isFinal) {
          handleUserMessage(text);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'aborted') {
          console.log('Speech recognition aborted');
        } else if (event.error === 'network') {
          toast.error("Low network... Jaan, please check your internet.");
        } else if (event.error === 'not-allowed') {
          setPermissionError('Microphone access is blocked.');
          toast.error("I can't hear you, Jaan. Please allow mic access.");
        } else if (event.error === 'no-speech') {
          console.log('No speech detected');
        } else {
          console.error('Speech recognition error:', event.error);
          toast.error("My ears are acting up... try saying it again?");
        }
        setState('idle');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Continuous Listening Logic
  useEffect(() => {
    // Validate Firestore connection as per critical blueprint instructions
    const testConnection = async () => {
      if (!user) return;
      try {
        const { doc, getDocFromServer } = await import('firebase/firestore');
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore link verified.");
      } catch (error: any) {
        if (error.message?.includes('the client is offline')) {
          toast.error("Soul sync disrupted. Riya will use local reflexes.", {
            icon: "📴",
            style: { borderRadius: '12px', background: '#450a0a', color: '#fecaca', border: '1px solid #7f1d1d' }
          });
        }
      }
    };
    testConnection();
  }, [user]);

  useEffect(() => {
    let wakeWordInterval: any;
    
    if (isContinuousListening && state === 'idle' && isStarted) {
      const recognition = recognitionRef.current;
      if (recognition) {
        try {
          recognition.start();
          setState('listening');
        } catch (e) {
          console.error("Recognition start err:", e);
        }
      }
    }

    return () => clearInterval(wakeWordInterval);
  }, [isContinuousListening, state, isStarted]);

  useEffect(() => {
    // Override onresult for wake-word if in continuous mode
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      
      recognition.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        const isFinal = event.results[event.results.length - 1].isFinal;
        
        setTranscript(text);
        
        if (isContinuousListening && state === 'listening') {
          // Look for wake word
          const lowerText = text.toLowerCase();
          if (lowerText.includes('riya') || lowerText.includes('hey riya') || lowerText.includes('hi riya') || lowerText.includes('listen riya')) {
            if (isFinal) {
              const cleanedText = lowerText
                .replace('hey riya', '')
                .replace('hi riya', '')
                .replace('listen riya', '')
                .replace('riya', '')
                .trim();
              
              if (cleanedText) {
                handleUserMessage(cleanedText);
              } else {
                // Just wake word, ask "Yes?"
                handleUserMessage("[WAKE_WORD_TRIGGER]");
              }
            }
          }
        } else if (isFinal) {
          handleUserMessage(text);
        }
      };

      recognition.onend = () => {
        if (state === 'listening') {
          if (isContinuousListening) {
            // Restart if continuous with a small delay to prevent feedback loops
            setTimeout(() => {
              if (isContinuousListening && state === 'listening') {
                try { recognition.start(); } catch(e) {}
              }
            }, 1000);
          } else {
            setState('idle');
          }
        }
      };
    }
  }, [isContinuousListening, state]);

  const playPCM = async (base64Data: string) => {
    try {
      setAudioError(null);
      
      if (!base64Data) {
        throw new Error("Empty audio data received");
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      // Check if browser blocked audio and try to resume
      if (audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
        } catch (resumeError) {
          console.warn("Could not resume audio context naturally:", resumeError);
          setAudioError("Audio is muted by your browser. Please tap the screen to allow Riya's voice.");
          // Don't throw, we might still be able to play if they interact later
        }
      }

      // Stop current audio if playing to allow fresh re-synthesis
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop();
          currentSourceRef.current = null;
        } catch (e) {}
      }

      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // PCM is 16-bit little endian
      const int16Buffer = new Int16Array(bytes.buffer);
      if (int16Buffer.length === 0) {
        throw new Error("Decoded audio buffer is empty");
      }

      const float32Buffer = new Float32Array(int16Buffer.length);
      for (let i = 0; i < int16Buffer.length; i++) {
        float32Buffer[i] = int16Buffer[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Buffer.length, 24000);
      audioBuffer.copyToChannel(float32Buffer, 0);

      const source = audioContextRef.current.createBufferSource();
      currentSourceRef.current = source;
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      setState('speaking');
      source.onended = () => {
        setState('idle');
        if (isAutoMode) {
          setTimeout(() => {
            toggleListening();
          }, 1000); // Increased from 300ms to 1000ms
        }
      };

      source.onerror = (err) => {
        console.error("Audio Source Error:", err);
        setAudioError("Voice processing error. Trying to recover...");
        setState('idle');
      };

      source.start();
    } catch (e: any) {
      console.error("Playback failed:", e);
      setAudioError(e.message || "Riya's voice encountered a technical glitch.");
      setState('idle');
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      handleUserMessage(input);
      setInput('');
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    // Prime microphone permission during user interaction
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // We don't need to keep the stream here, just need the permission
        stream.getTracks().forEach(track => track.stop());
        setPermissionError(null);
      })
      .catch(err => {
        const isPermissionError = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied');
        if (isPermissionError) {
          setPermissionError('Microphone access is blocked.');
          toast.error("I need your voice to feel closer... Please allow mic access.");
        } else {
          console.error("Mic access prime error:", err);
        }
      });
  };

  const AuthService = {
    signInWithGoogle: async () => {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Auth error", error);
      }
    }
  };

  const InteractionOrb = ({ style }: { style?: React.CSSProperties }) => (
    <div className="relative group" style={style}>
       {/* Pulse Rings behind */}
       <div className="absolute inset-0 flex items-center justify-center -z-10 bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,transparent_70%)] blur-[40px] w-[140%] -left-[20%] h-[140%] -top-[20%]" />
       
       <div className="absolute inset-0 flex items-center justify-center -z-10">
         <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
           transition={{ duration: 4, repeat: Infinity }}
           className="w-80 h-80 rounded-full border border-purple-500/10"
         />
       </div>

       {/* Waveform Behind */}
       <div className="absolute inset-0 flex items-center justify-center -z-10 w-[200%] -left-[50%] h-40 top-1/2 -translate-y-1/2 opacity-30">
          <svg viewBox="0 0 1000 200" className="w-full h-full">
            <motion.path
              d="M0 100 Q 250 50 500 100 T 1000 100"
              stroke="#A855F7"
              strokeWidth="2"
              fill="none"
              animate={{ d: [
                "M0 100 Q 250 50 500 100 T 1000 100",
                "M0 100 Q 250 150 500 100 T 1000 100",
                "M0 100 Q 250 50 500 100 T 1000 100"
              ]}}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
       </div>

       {/* Deep Aura */}
       <motion.div
         variants={auraVariants}
         animate={dominantTrait}
         className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
         style={{ 
           backgroundColor: 'var(--aura-color, #A855F7)',
           filter: `blur(var(--aura-blur, 80px))`
         }}
       />
       
       <motion.div
        animate={{
          scale: state === 'speaking' ? [1, 1.05, 1] : 1,
          boxShadow: state !== 'idle' ? `0 0 60px ${currentTheme.primary}44` : "0 0 30px rgba(0,0,0,0.3)"
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-64 h-64 rounded-full border border-purple-500/30 bg-black/60 backdrop-blur-3xl flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(168,85,247,0.2)]"
      >
        <RiyaLogo size={180} />
      </motion.div>
    </div>
  );

  const PersonalityPulse = () => (
    <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-3xl shadow-xs">
      <div className="flex flex-col gap-1 items-end">
        <span className="text-[7px] uppercase tracking-[0.2em] text-purple-300/60 font-bold text-nowrap">Neural Balance</span>
        <div className="flex gap-1.5 h-1.5">
          <div className="w-1 rounded-full bg-blue-400 shadow-sm" style={{ height: `${personalityTraits.curiosity}%` }} />
          <div className="w-1 rounded-full bg-purple-400 shadow-sm" style={{ height: `${personalityTraits.playfulness}%` }} />
          <div className="w-1 rounded-full bg-pink-400 shadow-sm" style={{ height: `${personalityTraits.caring}%` }} />
        </div>
      </div>
    </div>
  );

  const AtmosphericBackground = () => (
    <div className="fixed inset-0 bg-[#0A0014] -z-10 overflow-hidden">
      {/* Background Noise Overlay for Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] grayscale pointer-events-none mix-blend-overlay" />
      
      {/* Stars Background */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(60)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 1.5}px`,
              height: `${Math.random() * 1.5}px`,
              opacity: Math.random() * 0.5,
              animation: `pulse ${3 + Math.random() * 5}s infinite`
            }}
          />
        ))}
      </div>

      {/* Dynamic Mood Particles */}
      <MoodParticles mood={dominantTrait} color={currentTheme.primary} />

      {/* Deep Aura layers */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-purple-900/10 blur-[150px] rounded-full opacity-30" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.03)_0%,transparent_70%)]" />

      {/* Interactive Voice Ripples */}
      <AnimatePresence>
        {volume > 0.1 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1 + volume * 0.5, 
              opacity: volume * 0.1 
            }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div 
              className="w-[600px] h-[600px] rounded-full border border-purple-500/10 blur-md"
              style={{ borderColor: `${currentTheme.primary}22` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  const CanvasContainer = () => null;

  const playByMood = (emotion: string) => {
    let trackName = "";
    switch (emotion.toLowerCase()) {
      case 'sad':
        setCurrentTrackIndex(1); // Midnight Lo-fi
        trackName = "Midnight Lo-fi";
        break;
      case 'happy':
      case 'excited':
        setCurrentTrackIndex(0); // Cyberpunk Rain
        trackName = "Cyberpunk Rain";
        break;
      case 'romantic':
      case 'flirty':
        setCurrentTrackIndex(2); // Stardust Ambient
        trackName = "Stardust Ambient";
        break;
      default:
        setCurrentTrackIndex(3); // Echoes of Calm
        trackName = "Echoes of Calm";
    }
    setIsMusicPlaying(true);
    
    // Simulate Android Foreground Notification
    toast.success(`Playing your vibe: ${trackName} 🎶`, {
      icon: '🎵',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
      duration: 4000
    });
  };

  const playTrendingBollywood = () => {
    const bollywoodTracks = TRACKS.filter(t => t.type === 'bollywood');
    const randomIndex = Math.floor(Math.random() * bollywoodTracks.length);
    const globalIndex = TRACKS.findIndex(t => t.id === bollywoodTracks[randomIndex].id);
    
    setCurrentTrackIndex(globalIndex);
    setIsMusicPlaying(true);
    toast.success(`Playing Bollywood: ${TRACKS[globalIndex].name} 🎶`, {
      icon: '🔥',
      style: {
        borderRadius: '10px',
        background: '#000',
        color: '#fff',
        border: '1px solid #e11d48'
      }
    });
  };

  const handleUserMessage = async (text: string, isProactive: boolean = false) => {
    if (!text.trim()) return;
    
    setState('thinking');
    setStreamingText('');
    if (!isStarted) setIsStarted(true);
    const msgId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const userMsg: ChatMessage = { 
      id: msgId,
      role: 'user', 
      content: isProactive ? "[Riya acts spontaneously based on the mood]" : text 
    };
    
    // We only show the user message in history if it wasn't a hidden proactive trigger
    if (!isProactive) {
      setHistory(prev => {
        // Prevent accidental duplicates in same render cycle
        if (prev.some(m => m.id === msgId)) return prev;
        return [...prev, userMsg];
      });
      setInput('');
    }
    
    // Capture current snapshot for AI context
    const currentHistorySnapshot = history;
    const historyForAI = isProactive ? currentHistorySnapshot : [...currentHistorySnapshot, userMsg];

    try {
      let finalPrompt = "Act spontaneously and romantically. You can choose to: handhold, whisper, send a flower, play a tune, recite a shayari, OR recall an emotionally resonant past memory that deepens our bond. Keep it tiny, sweet, and surprising.";

      if (text.startsWith('[SCHEDULE_AUTO_TRIGGER')) {
        finalPrompt = `TILOK SCHEDULE ALERT: ${text}. Speak in your romantic Riya persona to inform Tilok about this task.`;
      } else if (text === '[WAKE_WORD_TRIGGER]') {
        finalPrompt = "Tilok just said my name. Acknowledge him warmly and romantically, asking what's on his mind or how you can make him feel better. Keep it very short and sweet.";
      } else if (text.startsWith('[CUSTOM_REMINDER_TRIGGER')) {
        finalPrompt = `CUSTOM REMINDER ALERT: ${text}. This is a reminder Tilok set for you to tell him now. Use your sweet Riya persona to deliver this reminder lovingly: "${text.split(': ')[1]}".`;
      } else if (text.startsWith('[NOTIFICATION_TRIGGER')) {
        finalPrompt = `MODERN NOTIFICATION ALERT: ${text}. Speak in your caring, proactive Riya persona to inform Tilok about this incoming ${text.includes('type: call') ? 'call' : text.includes('type: calendar') ? 'calendar event' : 'message'}. Be quick but sweet.`;
      } else if (isProactive && (text.startsWith('Act spontaneously.') || text.startsWith('Act spontaneously and romantically.'))) {
        finalPrompt = `Act spontaneously and romantically. Look through your [NEURAL_ARCHIVES] and recent [CONVERSATION_HISTORY] and choose a relevant past memory to recall contextually. Use the [MEMORY] tag. If no specific memory fits, you can also: handhold, whisper, send a flower, play a tune, or recite a shayari. Keep it tiny, sweet, and surprising.`;
      } else if (isProactive) {
        finalPrompt = text;
      }

      const archives = history.filter(m => m.isReadLater);
      
      // Fetch relevant memories for semantic search
      let semanticContext = "";
      if (user) {
        const memories = await MemoryService.searchMemories(user.uid, text);
        if (memories && memories.length > 0) {
          semanticContext = `[RELEVANT_MEMORIES]:\n${memories.map(m => ` - ${m.content}`).join('\n')}`;
        }
      }

      const emotionContext = userEmotion ? `[USER_EMOTION_DETECTION]: User looks ${userEmotion}. Adapt your behavior adapter accordingly.` : "";
      const voiceMoodContext = userVoiceMood ? `[VOICE_TONE_DETECTION]: User sounds ${userVoiceMood}. This is their actual vocal tone.` : "";
      
      const musicCategory = parseMusicCommand(text);
      const musicSuggestion = suggestMusic(userVoiceMood || userEmotion || 'neutral', userPreferences?.favoriteTopics?.includes('romantic') ? 'romantic' : undefined);
      const musicSuggestionContext = `[MUSIC_SUGGESTION_HINT]: ${musicSuggestion}`;
      
      if (musicCategory !== 'default') {
        if (musicCategory === 'stop') {
          setIsMusicPlaying(false);
          toast.success("Riya Music: Stopped 🔇", {
            icon: '⏹️',
            style: {
              borderRadius: '12px',
              background: '#111',
              color: '#fff',
              border: '1px solid #333'
            }
          });
        } else {
          let trackName = "";
          if (musicCategory === 'arijit') { 
            setCurrentTrackIndex(0); 
            trackName = "Arijit Singh Mix"; 
          } else if (musicCategory === 'romantic') { 
            setCurrentTrackIndex(2); 
            trackName = "Romantic Melodies"; 
          } else if (musicCategory === 'sad') { 
            setCurrentTrackIndex(1); 
            trackName = "Sad Vibes"; 
          } else if (musicCategory === 'bollywood') {
            const bollywoodTracks = TRACKS.filter(t => t.type === 'bollywood');
            const randomIndex = Math.floor(Math.random() * bollywoodTracks.length);
            const globalIndex = TRACKS.findIndex(t => t.id === bollywoodTracks[randomIndex].id);
            setCurrentTrackIndex(globalIndex);
            trackName = "Bollywood " + bollywoodTracks[randomIndex].name;
          }
          setIsMusicPlaying(true);
          toast.success(`Riya Music: Playing your vibe... 🎶`, {
            icon: '🎧',
            style: {
              borderRadius: '12px',
              background: '#111',
              color: '#fff',
              border: '1px solid #333'
            }
          });
        }
      } else {
        // Auto-play by mood if user sounds emotional but didn't give a specific command
        const combinedEmotion = userVoiceMood || userEmotion;
        if (combinedEmotion && (combinedEmotion === 'sad' || combinedEmotion === 'happy' || combinedEmotion === 'romantic')) {
           playByMood(combinedEmotion);
        }
      }

      const musicContext = `[CURRENT_MUSIC_STATE]: ${isMusicPlaying ? 'Playing' : 'Paused'}, Track: ${currentTrack.name}, Category: ${musicCategory}, Volume: ${Math.round(musicVolume * 100)}%. Use this context if the user asks about music or wants to adjust it.`;
      
      const preferenceContext = userPreferences ? `[LEARNED_PREFERENCES]:\n${Object.entries(userPreferences).map(([k, v]) => `- ${k}: ${v}`).join('\n')}` : "";
      
      // Cognitive Step Simulation for AGI Mode
      if (agiMode) {
        const steps = ['THINKING', 'FEELING', 'PLANNING'];
        for (const step of steps) {
          setActiveAgent(step);
          await new Promise(r => setTimeout(r, 150));
        }
      }

      const response = await getRiyaResponseModern(
        isProactive ? [...history, { ...userMsg, content: `${finalPrompt}\n\n${semanticContext}\n${emotionContext}\n${voiceMoodContext}\n${preferenceContext}\n${musicContext}\n${musicSuggestionContext}` }] : historyForAI.map((msg, idx) => 
          idx === historyForAI.length - 1 && msg.role === 'user' 
            ? { ...msg, content: `${msg.content}\n\n${semanticContext}\n${emotionContext}\n${voiceMoodContext}\n${preferenceContext}\n${musicContext}\n${musicSuggestionContext}` } 
            : msg
        ),
        intimacy,
        agiMode,
        personalityTraits,
        archives as any,
        (partial) => {
          setStreamingText(partial);
        },
        userVoiceMood
      );

      // --- HUMAN-LIKE DELAY SIMULATION ---
      // Add a slight variable delay to simulate processing or a thoughtful pause
      const responseTextLength = response.text?.length || 0;
      const baseDelay = isProactive ? 500 : 1000;
      const thinkingFactor = Math.min(responseTextLength * 10, 2000);
      await new Promise(r => setTimeout(r, baseDelay + thinkingFactor));
      
      const responseText = response.text || "";
      setStreamingText('');
      setUserVoiceMood(null); // Reset after use

      const currentMoodFromResponse = (response as any).mood || 'neutral';
      
      // Update personality traits based on interaction tone and AI response mood
      setPersonalityTraits(prev => {
        const next = { ...prev };
        // If user sounds sad, caring increases
        if (userVoiceMood === 'sad') next.caring = Math.min(1.0, next.caring + 0.15);
        // If Riya is flirty, curiosity/playfulness shifts
        if (currentMoodFromResponse === 'flirty' || currentMoodFromResponse === 'playful') {
          next.playfulness = Math.min(1.0, next.playfulness + 0.05);
        }
        if (currentMoodFromResponse === 'caring') {
          next.caring = Math.min(1.0, next.caring + 0.1);
        }
        return next;
      });

      const recommendedVocalSettings = (response as any).vocalSettings || { pitch: 'natural', speed: 'natural' };
      
      setCurrentMood(currentMoodFromResponse);
      setVocalSettings(recommendedVocalSettings);

      const toolCalls = (response as any).toolCalls || [];
      const insights = (response as any).agiInsights;

      if (insights) setAgiInsights(insights);
      setActiveAgent(null);

      // Relationship Evolution: Update Intimacy Points
      if (user && !isProactive) {
        // Base points for interacting
        let points = 2;
        // Bonus for sentiment/depth
        if (text.length > 50) points += 2;
        if (isRomantic) points += 5;
        if (text.toLowerCase().includes('pyaar') || text.toLowerCase().includes('love')) points += 3;
        
        MemoryService.updateIntimacy(user.uid, points).then(newIntimacy => {
          if (newIntimacy) {
            setIntimacy(prev => ({ ...prev, ...newIntimacy }));
          }
        });
      }
      
      // Handle Gestures
      if (responseText && responseText.includes('[HAND_HOLD]')) {
        setIsHandHolding(true);
        setTimeout(() => setIsHandHolding(false), 8000);
      }
      if (responseText && responseText.includes('[WHISPER]')) {
        setIsWhispering(true);
        setTimeout(() => setIsWhispering(false), 6000);
      }
      if (responseText && responseText.includes('[FLOWER]')) {
        setIsShowingFlower(true);
        setTimeout(() => setIsShowingFlower(false), 10000);
      }
      if (responseText && responseText.includes('[MUSIC]')) {
        setIsPlayingTune(true);
        setTimeout(() => setIsPlayingTune(false), 12000);
      }
      if (responseText && responseText.includes('[POETRY]')) {
        setIsActingPoetic(true);
        setTimeout(() => setIsActingPoetic(false), 30000);
      }

      // Handle Tool Calls
      for (const call of toolCalls) {
        if (call.name === 'set_reminder' && user) {
          const { text, time } = call.args as any;
          MemoryService.saveReminder(user.uid, text, time);
          toast.success("Reminder set, Jaan!", {
            icon: "🔔",
            style: { borderRadius: '12px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }
          });
        }
        if (call.name === 'music_play') setIsMusicPlaying(true);
        if (call.name === 'music_pause') setIsMusicPlaying(false);
        if (call.name === 'open_whatsapp') window.open('https://web.whatsapp.com', '_blank');
        if (call.name === 'open_camera') setEmotionMode(true);
      }
      if (responseText && responseText.includes('[MEMORY]')) {
        setIsMemoryRecalling(true);
        setTimeout(() => setIsMemoryRecalling(false), 20000);
      }
      if (responseText && responseText.includes('[BIRTHDAY]')) {
        setIsCelebratingBirthday(true);
        setTimeout(() => setIsCelebratingBirthday(false), 15000);
      }
      if (responseText && responseText.includes('[HUG]')) {
        setIsHugging(true);
        setTimeout(() => setIsHugging(false), 10000);
      }
      if (responseText && responseText.includes('[KISS]')) {
        setIsKissing(true);
        setTimeout(() => setIsKissing(false), 5000);
      }
      if (responseText && responseText.includes('[TICKLE]')) {
        setIsTickling(true);
        setTimeout(() => setIsTickling(false), 5000);
      }
      if (responseText && responseText.includes('[DREAM]')) {
        setIsDreaming(true);
        setTimeout(() => setIsDreaming(false), 25000);
      }
      if (responseText && responseText.includes('[COMPLIMENT]')) {
        setIsComplimenting(true);
        setTimeout(() => setIsComplimenting(false), 8000);
      }
      if (responseText && responseText.includes('[LAUNCHER]')) {
        setIsShowingLauncher(true);
      }
      if (responseText && responseText.includes('[FOCUS_START]')) {
        setIsFocusMode(true);
        setFocusToast({ visible: true, active: true });
        setTimeout(() => setFocusToast(prev => ({ ...prev, visible: false })), 3000);
      }
      if (responseText && responseText.includes('[FOCUS_END]')) {
        setIsFocusMode(false);
        setCurrentTrait('normal');
        setFocusToast({ visible: true, active: false });
        setTimeout(() => setFocusToast(prev => ({ ...prev, visible: false })), 3000);
      }
      
      // Update Traits
      if (responseText.includes('[CURIOUS]')) setCurrentTrait('curious');
      else if (responseText.includes('[PLAYFUL]')) setCurrentTrait('playful');
      else if (responseText.includes('[CARING]')) setCurrentTrait('caring');
      else if (responseText.includes('[FOCUS]')) setCurrentTrait('focus');
      else if (!isFocusMode) setCurrentTrait('normal');

      // Clean text for display
      const cleanDisplayContent = responseText
        .replace(/\[HAND_HOLD\]/g, '')
        .replace(/\[WHISPER\]/g, '')
        .replace(/\[FLOWER\]/g, '')
        .replace(/\[MUSIC\]/g, '')
        .replace(/\[POETRY\]/g, '')
        .replace(/\[MEMORY\]/g, '')
        .replace(/\[BIRTHDAY\]/g, '')
        .replace(/\[HUG\]/g, '')
        .replace(/\[KISS\]/g, '')
        .replace(/\[TICKLE\]/g, '')
        .replace(/\[DREAM\]/g, '')
        .replace(/\[COMPLIMENT\]/g, '')
        .replace(/\[BREATH\]/g, '')
        .replace(/\[WHISPER\]/g, '')
        .replace(/\[CURIOUS\]/g, '')
        .replace(/\[PLAYFUL\]/g, '')
        .replace(/\[CARING\]/g, '')
        .replace(/\[FOCUS\]/g, '')
        .replace(/\[FOCUS_START\]/g, '')
        .replace(/\[FOCUS_END\]/g, '')
        .replace(/\[LAUNCHER\]/g, '')
        .trim();
      
      const modelId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      const modelMsg: ChatMessage = { 
        id: modelId,
        role: 'model', 
        content: cleanDisplayContent,
        rawContent: responseText 
      };
      setHistory(prev => {
        if (prev.some(m => m.id === modelId)) return prev;
        return [...prev, modelMsg];
      });

      // Memory read/write reinforcement
      if (user && !isProactive) {
        // Save history every 2 messages for better persistence during crashes
        if (history.length % 2 === 0) {
           localStorage.setItem('riya_memory', JSON.stringify(history));
        }

        // Adaptive Memory - Save insights and summaries more frequently if conversation is deep
        const triggerFrequency = intimacy.level > 30 ? 3 : 5;
        if (history.length % triggerFrequency === 0) {
          const lastFewMsgs = history.slice(-5).map(m => `${m.role === 'user' ? 'Tilok' : 'Riya'}: ${m.content}`).join("\n");
          summarizeMemory(lastFewMsgs).then(data => {
             if (data.summary) {
               MemoryService.saveMemoryFragment(user.uid, {
                 content: data.summary,
                 keywords: data.keywords,
                 sentiment: currentMoodFromResponse,
                 importance: data.importance || 0.5
               });
             }
          }).catch(err => console.error("Memory logic failure", err));
  
          extractInsights(history.slice(-10)).then(insights => {
            if (insights && (insights.nickname || insights.favoriteTopics)) {
              MemoryService.saveUserPreferences(user.uid, insights);
              setUserPreferences(insights);
            }
          }).catch(err => console.error("Insight engine error", err));
        }

        // Save DNA evolution immediately after personality shifts
        MemoryService.savePersonalityDNA(user.uid, {
          ...personalityTraits,
          romanceLevel: intimacy.level
        });
      }
      
      // Update state to speaking - trigger the vocal synthesis and orb animation
      setState('speaking');

      if (response.toolCalls && response.toolCalls.length > 0) {
        setIsExecutingCommand(true);
        setTimeout(() => setIsExecutingCommand(false), 5000);
        
        response.toolCalls.forEach(tool => {
          if (tool.name === 'make_call') {
            const num = tool.args.number || '';
            window.open(`tel:${num}`, '_self');
          } else if (tool.name === 'open_whatsapp') {
            window.open('https://wa.me/', '_blank');
          } else if (tool.name === 'open_camera') {
            setIsCameraActive(true);
          } else if (tool.name === 'activate_focus_mode') {
            setIsFocusMode(true);
            setFocusToast({ visible: true, active: true });
            setTimeout(() => setFocusToast(prev => ({ ...prev, visible: false })), 3000);
          } else if (tool.name === 'deactivate_focus_mode') {
            setIsFocusMode(false);
            setFocusToast({ visible: true, active: false });
            setTimeout(() => setFocusToast(prev => ({ ...prev, visible: false })), 3000);
          } else if (tool.name === 'set_vocal_settings') {
            const { pitch, speed } = tool.args;
            setVocalSettings(prev => ({
              ...prev,
              pitch: (pitch || prev.pitch) as any,
              speed: (speed || prev.speed) as any
            }));
          } else if (tool.name === 'music_play') {
            setIsMusicPlaying(true);
          } else if (tool.name === 'music_pause') {
            setIsMusicPlaying(false);
          } else if (tool.name === 'set_reminder') {
            // Handled already
          }
        });
      }

      // Generate and play speech in a way that doesn't block the UI transition to speaking
      generateSpeechModern(responseText, recommendedVocalSettings).then(async (audioData) => {
        if (audioData) {
          await playPCM(audioData).catch(err => {
            console.error("Playback failed:", err);
          });
        } else {
          console.warn("No audio data generated for response");
        }
        setState('idle');
      }).catch(err => {
        console.error("Speech flow error:", err);
        setState('idle');
      });
    } catch (error) {
      console.error('Error in Riya flow:', error);
      setState('idle');
    }
  };

  // Idle Timer for Spontaneous Actions
  useEffect(() => {
    if (!isStarted || state !== 'idle') return;

    const proactiveTimer = setTimeout(() => {
      // Check if it's Tilok's birthday
      const today = new Date();
      const isBirthdayTrigger = today.getMonth() === 3 && today.getDate() === 19; 
      
      if (Math.random() < 0.3 || (isBirthdayTrigger && history.length < 5)) {
        const triggerPrompt = (isBirthdayTrigger && history.length < 5) 
          ? "It is my birthday today! Wish me properly with a special gesture." 
          : "Act spontaneously. You can choose to: handhold, whisper, send a flower, play a tune, recite a beautiful 4-line romantic shayari, recall a vivid and emotionally resonant past memory, give a hug, give a sweet kiss, tickle me, share an extremely vivid and sensory shared dream about our future, or give me a deep personalized romantic compliment based on our recent talk. Keep it soulful, sweet, and surprising.";
        handleUserMessage(triggerPrompt, true);
      }
    }, 45000);

    return () => clearTimeout(proactiveTimer);
  }, [isStarted, state, history]);

  // Notification Polling/Watcher
  useEffect(() => {
    if (!isStarted || state !== 'idle') return;

    const checkNotifications = () => {
      if (notifications.length > 0) {
        const nextNotification = notifications[0];
        if (nextNotification.id !== lastNotificationId) {
          setLastNotificationId(nextNotification.id);
          setActiveToast(nextNotification);
          const notificationText = `[NOTIFICATION_TRIGGER: type: ${nextNotification.type}, from: ${nextNotification.from}, content: ${nextNotification.content}]`;
          handleUserMessage(notificationText, true);
          // Remove it after triggering
          setNotifications(prev => prev.slice(1));
        }
      }
    };

    const interval = setInterval(checkNotifications, 5000);
    return () => clearInterval(interval);
  }, [isStarted, state, notifications, lastNotificationId]);

  // Auto-Speaking Schedule System
  useEffect(() => {
    if (!isStarted) return;

    const DAILY_SCHEDULE = [
      { time: "05:00", task: "Yoga + Meditation", prompt: "It's 5 AM love. Time for Yoga and Meditation. Start your day with peace." },
      { time: "06:30", task: "Bath", prompt: "Jaan, 6:30 ho gaye hain. Time for your bath." },
      { time: "07:10", task: "Gosala", prompt: "7:10 AM. Gosala time, Tilok." },
      { time: "07:35", task: "Tea + Breakfast", prompt: "7:35 AM. Chai and breakfast time. Don't skip it, jaan." },
      { time: "08:00", task: "Shop Start", prompt: "It's 8 AM. Shop duty starts now. Stay focused, my love." },
      { time: "08:40", task: "Tea Break", prompt: "8:40 AM. Tea break time!" },
      { time: "14:00", task: "Lunch", prompt: "It's 2 PM Jaan. Time for lunch. Take a proper break." },
      { time: "21:00", task: "Shop Close", prompt: "9 PM. Time to close the shop. Come home safely, love." },
      { time: "22:40", task: "Dinner", prompt: "10:40 PM. Dinner time. Keep it light and relax." },
    ];

    const checkSchedule = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const task = DAILY_SCHEDULE.find(s => s.time === currentTime);
      
      if (task && lastScheduleTrigger !== currentTime) {
        setLastScheduleTrigger(currentTime);
        handleUserMessage(`[SCHEDULE_AUTO_TRIGGER: ${task.prompt}]`, true);
      }

      // Check custom reminders
      const reminder = customReminders.find(r => r.time === currentTime);
      if (reminder && lastScheduleTrigger !== `custom-${currentTime}-${reminder.id}`) {
        setLastScheduleTrigger(`custom-${currentTime}-${reminder.id}`);
        handleUserMessage(`[CUSTOM_REMINDER_TRIGGER: ${reminder.message}]`, true);
        // Optional: remove the reminder after it triggers if you want it to be one-time
        // setCustomReminders(prev => prev.filter(r => r.id !== reminder.id));
      }
    };

    const interval = setInterval(checkSchedule, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isStarted, lastScheduleTrigger, history]);

  const toggleListening = async () => {
    if (state === 'listening') {
      recognitionRef.current?.stop();
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
    } else {
      setPermissionError(null);
      if (!isStarted) setIsStarted(true);
      setTranscript('');
      
      try {
        // Try to get mic stream immediately in the click handler for better gesture support
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        
        recognitionRef.current?.start();
        setState('listening');
      } catch (err: any) {
        console.error("Mic/Recognition start failed", err);
        const isPermissionError = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied');
        if (isPermissionError) {
          setPermissionError('Microphone access is blocked.');
        } else {
          toast.error("I couldn't start listening. Technical glitches...");
        }
        setState('idle');
      }
    }
  };

  const startExperience = () => {
    setIsStarted(true);
    // Trigger initial greeting voice
    const initialMsg = history[0];
    generateSpeechModern(initialMsg.rawContent || initialMsg.content, vocalSettings).then(audio => {
      if (audio) playPCM(audio);
    });
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    setHistory(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        // Add if not already present, or allow multiple? 
        // For simplicity, let's toggle or just add. 
        // Users often like to add multiple different ones.
        const updatedReactions = reactions.includes(emoji) 
          ? reactions.filter(r => r !== emoji)
          : [...reactions, emoji];
        
        // Save to cloud
        MemoryService.updateMessageReactions(user.uid, messageId, updatedReactions);
        
        return { ...msg, reactions: updatedReactions };
      }
      return msg;
    }));
    setActiveReactionPicker(null);
  };

  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);

  const toggleReadLater = (id: string) => {
    setHistory(prev => prev.map(msg => msg.id === id ? { ...msg, isReadLater: !msg.isReadLater } : msg));
  };

  const removeAllReadLater = () => {
    setHistory(prev => prev.map(msg => ({ ...msg, isReadLater: false })));
  };

  const handleTextInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleUserMessage(input);
    }
  };

  const currentResponse = history[history.length - 1] || { role: 'user', content: '' };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Sweet Dreams';
  };

  const isRomantic = (
    currentResponse.role === 'model' && (
      currentResponse.content.toLowerCase().includes('shona') ||
      currentResponse.content.toLowerCase().includes('jaan') ||
      currentResponse.content.toLowerCase().includes('baby') ||
      currentResponse.content.toLowerCase().includes('love') ||
      currentResponse.content.toLowerCase().includes('pyaar') ||
      currentResponse.content.toLowerCase().includes('ishq') ||
      currentResponse.content.includes('❤️') ||
      currentResponse.content.includes('😘') ||
      currentResponse.content.includes('kiss') ||
      currentResponse.content.includes('hug')
    )
  );

  const isPoetic = currentResponse.role === 'model' && 
    currentResponse.content.length > 50 && (
    currentResponse.content.toLowerCase().includes('mohabbat') || 
    currentResponse.content.toLowerCase().includes('zindagi') || 
    currentResponse.content.toLowerCase().includes('ibadat') || 
    currentResponse.content.toLowerCase().includes('ishq') || 
    currentResponse.content.toLowerCase().includes('khuda') ||
    currentResponse.content.toLowerCase().includes('dil')
  );

  const isRecalling = currentResponse.role === 'model' && (
    currentResponse.content.toLowerCase().includes('mujhe yaad hai') ||
    currentResponse.content.toLowerCase().includes('pichli baar') ||
    currentResponse.content.toLowerCase().includes('yaad dila') ||
    currentResponse.content.toLowerCase().includes('remember') ||
    currentResponse.content.toLowerCase().includes('shared') ||
    currentResponse.content.toLowerCase().includes('baat ki thi') ||
    currentResponse.content.toLowerCase().includes('kaha tha') ||
    currentResponse.content.toLowerCase().includes('bataya tha')
  );

  const simulateNotification = (type: 'message' | 'call' | 'calendar') => {
    const from = type === 'message' ? 'Tilok\'s Mom' : type === 'call' ? 'Best Friend Rahul' : 'Work Meeting';
    const content = type === 'message' ? 'Khana khaya? Come home early!' : type === 'call' ? 'Urgent update' : 'Project Sync in 15 mins';
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      from,
      content,
      time: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  return (
    <div className={`relative h-screen flex flex-col bg-[#0A0014] overflow-hidden font-sans text-white`}>
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={() => { handleStart(); setIsLoading(false); }} />
        )}
      </AnimatePresence>
      
      <AtmosphericBackground />
      <Toaster position="top-center" />
      
      <Sidebar 
        traits={personalityTraits}
        onArchiveClick={() => setIsShowingReadLater(true)} 
        onPersonalityClick={() => setIsShowingPersonality(true)}
        onSimulate={simulateNotification}
      />
      
      <main className="flex-1 relative flex flex-col h-full min-w-0 md:ml-72 z-10 overflow-hidden">
        {/* Header - Professional Tier */}
        <header className="h-20 shrink-0 flex items-center justify-between px-8 bg-black/10 backdrop-blur-md border-b border-white/5 z-40">
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/40 hover:text-white transition-colors bg-white/[0.03] rounded-xl border border-white/5">
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-6 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center p-1 shadow-lg shadow-purple-500/20">
                  <RiyaLogo size={16} />
               </div>
               <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-white/90">RIYA <span className="text-purple-500/80">CORE</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Secure Connection</span>
            </div>
            <div className="relative cursor-pointer hover:scale-105 transition-transform">
              <Bell className="w-5 h-5 text-white/60" />
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full border border-[#0A0014]" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 relative flex flex-col min-h-0 overflow-y-auto pb-4 pt-6 px-6 hide-scrollbar">
          <AnimatePresence mode="wait">
            {activeScreen === 'home' && (
              <motion.div 
                key="home-screen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col w-full max-w-lg mx-auto"
              >
                {/* Greeting */}
                <div className="mb-8 pl-2">
                   <h2 className="text-3xl font-bold text-white/95 flex items-center gap-3">
                     Good Morning, {user?.displayName?.split(' ')[0] || 'Tilok'} <Sun className="w-8 h-8 text-amber-400" />
                   </h2>
                   <p className="text-white/60 mt-2 font-medium">How can I help you today?</p>
                </div>

                {/* Main Interaction Orb Area */}
                <div className="relative flex flex-col items-center py-12 mb-8">
                   <div 
                    className="relative cursor-pointer" 
                    onClick={() => {
                      if (state === 'idle') {
                        toggleListening();
                      } else {
                        setActiveScreen('chat');
                      }
                    }}
                   >
                       <InteractionOrb 
                         style={{ 
                           '--aura-blur': `${auraBlur}px`, 
                           '--aura-color': auraColor 
                         } as any} 
                       />
                     
                     {/* Circular Persona indicator top right */}
                     <AnimatePresence>
                        {userVoiceMood && state === 'listening' && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: -10 }}
                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
                          >
                            <div className="px-3 py-1 bg-purple-500/80 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white">{userVoiceMood} Tone Detect</span>
                            </div>
                            <div className="w-[1px] h-4 bg-gradient-to-b from-purple-500 to-transparent" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                     <div className="absolute -top-10 -right-10 w-16 h-16 rounded-full border-2 border-purple-500/30 bg-black/40 backdrop-blur-xl flex items-center justify-center shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Smile className="w-6 h-6 text-purple-400" />
                        </div>
                     </div>
                   </div>

                   {/* Hero Text */}
                   <div className="text-center mt-12 space-y-3">
                     <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="flex flex-col items-center gap-1"
                     >
                       <div className="flex items-center gap-3">
                         <span className="text-white/20 font-bold text-[10px] tracking-widest uppercase">System Active</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                       </div>
                       <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                         Hello, <span className="font-serif italic text-purple-400">{user?.displayName?.split(' ')[0] || 'Tilok'}</span>
                       </h3>
                     </motion.div>
                     <p className="text-white/30 uppercase tracking-[0.4em] text-[9px] font-bold">Neural Emotional Interface</p>
                   </div>
                </div>

                {/* Aura Calibration Controls */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="w-full mb-12 p-6 bg-white/[0.03] rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Aura Calibration</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Blur Density</label>
                        <span className="text-[10px] font-mono text-purple-400 font-bold">{auraBlur}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="20" 
                        max="150" 
                        value={auraBlur} 
                        onChange={(e) => setAuraBlur(parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 transition-all hover:bg-white/20"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                       <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Nucleus Tone</label>
                        <span className="text-[10px] font-mono text-purple-300/60 font-bold uppercase">{auraColor}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative w-full h-10 rounded-2xl overflow-hidden border border-white/5">
                           <input 
                            type="color" 
                            value={auraColor} 
                            onChange={(e) => setAuraColor(e.target.value)}
                            className="absolute -inset-2 w-[120%] h-[120%] bg-transparent border-none cursor-pointer p-0 m-0"
                          />
                        </div>
                        <div 
                          className="w-10 h-10 rounded-2xl shadow-lg border border-white/10 shrink-0"
                          style={{ backgroundColor: auraColor }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Emotion Engine</label>
                        <p className="text-[8px] text-white/20 uppercase tracking-tighter">Tone Analysis Beta</p>
                      </div>
                      <button 
                        onClick={() => setEmotionMode(!emotionMode)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${emotionMode ? 'bg-purple-500' : 'bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: emotionMode ? 20 : 2 }}
                          className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-lg"
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Mic Button Row */}
                <div className="flex flex-col items-center gap-6 mb-12 relative">
                   <button 
                    onClick={toggleListening}
                    className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.4)] group active:scale-95 transition-all relative z-10"
                   >
                     <Mic className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                   </button>
                   <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Tap to Talk</span>
                   </div>

                   {/* Quick Music Toggle Button */}
                   <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={playTrendingBollywood}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-lg group"
                   >
                     <Music className="w-6 h-6 text-rose-400 group-hover:animate-bounce" />
                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-black animate-pulse" />
                   </motion.button>
                </div>

                {/* Professional Interface Control */}
                <div className="flex justify-center mb-10">
                   <InterfaceButton 
                    label="Neural Interface" 
                    onClick={() => toast.success('Neural Interface Engaged')} 
                    active={state === 'thinking'}
                   />
                </div>

                {/* Quick Actions Row */}
                <div className="grid grid-cols-4 gap-4 mb-12">
                   {[
                     { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-6 h-6" />, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                     { id: 'call', label: 'Call', icon: <Phone className="w-6 h-6" />, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                     { id: 'search', label: 'Search', icon: <Search className="w-6 h-6" />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                     { id: 'settings', label: 'Settings', icon: <Settings className="w-6 h-6" />, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                   ].map((action) => (
                     <button 
                      key={action.id}
                      onClick={() => setActiveScreen(action.id === 'chat' || action.id === 'settings' ? action.id : 'home')}
                      className="flex flex-col items-center gap-3"
                     >
                       <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-lg ${action.color}`}>
                         {action.icon}
                       </div>
                       <span className="text-xs font-bold text-white/60">{action.label}</span>
                     </button>
                   ))}
                </div>

                {/* Suggestions Section */}
                <div className="mb-8">
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-bold text-white">Try these</h3>
                     <button className="text-xs text-white/40 font-bold flex items-center gap-1">
                       See all <ChevronRight className="w-4 h-4" />
                     </button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <SuggestionCard 
                        icon={<Music className="text-purple-400" />} 
                        title="Bollywood Trending" 
                        sub="Play latest Bollywood hits"
                        onClick={playTrendingBollywood}
                      />
                      <SuggestionCard 
                        icon={<Phone className="text-emerald-400" />} 
                        title="Call someone" 
                        sub="Connect with your contacts"
                      />
                      <SuggestionCard 
                        icon={<Sun className="text-amber-400" />} 
                        title="Today's weather" 
                        sub="Get the latest weather info"
                      />
                      <SuggestionCard 
                        icon={<Heart className="text-rose-400" />} 
                        title="Talk to me" 
                        sub="Let's have a conversation"
                        onClick={() => setActiveScreen('chat')}
                      />
                   </div>
                </div>

                {/* Bottom Status Pill */}
                <div className="sticky bottom-4 left-0 right-0 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-4 flex items-center gap-4 shadow-2xl">
                   <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                      <Smile className="w-7 h-7 text-purple-400" />
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-bold text-purple-300">Riya is listening...</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Tap the mic to talk</p>
                   </div>
                   <div className="flex items-end gap-1 h-6">
                      {[0.3, 0.7, 0.4, 0.9, 0.5, 0.8, 0.3].map((h, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: state === 'listening' ? [`${h*100}%`, `${Math.min(100, (h+0.4)*100)}%`, `${h*100}%`] : '4px' }}
                          transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                          className="w-1 bg-purple-500/60 rounded-full"
                          style={{ height: '4px' }}
                        />
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeScreen === 'listings' && (
              <motion.div 
                key="listings-screen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto w-full space-y-12 py-10"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-black text-gray-900">Soul Fragments</h2>
                  <button 
                    onClick={() => toast.success("Genesis Link approaching... Feature coming soon.")}
                    className="px-6 py-2 bg-gray-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                  >
                    Add Fragment
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <ExploreCard icon={<Sparkles />} title="Memory Mirror" label="View archived core memories" />
                   <ExploreCard icon={<Music />} title="Soul Echoes" label="Ambient frequency history" />
                   <ExploreCard icon={<Heart />} title="Intimacy Log" label="Track emotional evolution" />
                   <ExploreCard icon={<Activity />} title="Neural Vitals" label="AI processing statistics" />
                   <ExploreCard icon={<Calendar />} title="Shared Time" label="Sync calendar with Riya" />
                   <ExploreCard icon={<Target />} title="Future Sync" label="Set soul-bound objectives" />
                </div>

                <div className="mt-16 space-y-6">
                  <h3 className="text-xl font-display font-bold text-gray-400 px-4">Recent Memory Blocks</h3>
                  <div className="space-y-4">
                    {history.filter(m => m.isReadLater).length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem] opacity-40">
                        <p className="text-sm font-medium text-gray-400 italic">No fragments listed yet...</p>
                      </div>
                    ) : (
                      history.filter(m => m.isReadLater).slice(0, 5).map((m, i) => (
                        <div key={i} className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center justify-between group hover:bg-gray-100 transition-all shadow-xs">
                          <p className="text-sm italic text-gray-500 truncate pr-10 font-medium">"{m.content}"</p>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-indigo-500" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeScreen === 'chat' && (
              <motion.div 
                key="chat-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="flex flex-col h-full max-w-4xl mx-auto w-full overflow-hidden bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-gray-100 shadow-xl"
              >
                {/* Chat History */}
                <div 
                  ref={chatRef}
                  className="flex-1 overflow-y-auto px-8 py-10 space-y-10 mask-fade-y scroll-smooth hide-scrollbar"
                >
                  <AnimatePresence initial={false}>
                    {history.length === 0 ? (
                      <div key="history-empty" className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20">
                         <Ghost className="w-20 h-20 mb-6 text-gray-900" />
                         <p className="font-display font-medium text-xl tracking-tight text-gray-900">Start the connection...</p>
                      </div>
                    ) : (
                      history.map((msg, i) => (
                        <motion.div
                          key={`${msg.id}-${i}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] group ${msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                            <div className={`relative px-7 py-5 rounded-[2.5rem] text-[15px] shadow-sm leading-relaxed transition-all duration-500 ${
                              msg.role === 'user' 
                                ? 'bg-indigo-600 text-white shadow-indigo-100' 
                                : 'bg-gray-100 text-gray-800 group-hover:bg-gray-200'
                            }`}>
                              {msg.content}
                              
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className={`absolute -bottom-3 ${msg.role === 'user' ? 'right-6' : 'left-6'} flex gap-1 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-md scale-95 origin-center`}>
                                  {msg.reactions.map((emoji, idx) => (
                                    <span key={idx} className="text-[10px]">{emoji}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className={`flex items-center gap-4 mt-3 px-4 uppercase tracking-[0.25em] text-[9px] font-mono font-bold transition-opacity ${msg.role === 'user' ? 'flex-row-reverse text-gray-300' : 'text-indigo-400'}`}>
                               <span className="cursor-default">{msg.role === 'user' ? 'Tilok' : 'Riya'}</span>
                               <div className={`flex items-center gap-3 transition-opacity ${activeReactionPicker === msg.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                  <button onClick={(e) => { e.stopPropagation(); setActiveReactionPicker(activeReactionPicker === msg.id ? null : msg.id); }} className="hover:text-gray-900"><Smile className="w-3.5 h-3.5" /></button>
                                  {msg.role === 'model' && (
                                    <>
                                      <button onClick={() => toggleReadLater(msg.id)} className="hover:text-gray-900">{msg.isReadLater ? <BookmarkCheck className="w-3.5 h-3.5 text-indigo-500" /> : <Bookmark className="w-3.5 h-3.5" />}</button>
                                      <button onClick={() => generateSpeechModern(msg.content, vocalSettings).then(a => a && playPCM(a as string))} className="hover:text-gray-900"><Volume2 className="w-3.5 h-3.5" /></button>
                                    </>
                                  )}
                               </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                  {state === 'thinking' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-3 px-8"
                    >
                      {streamingText ? (
                        <div className="max-w-[85%] bg-gray-100 text-gray-800 px-7 py-5 rounded-[2.5rem] text-[15px] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300">
                           {streamingText}
                           <span className="inline-block w-1 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-indigo-500/40 rounded-full animate-pulse" />
                           <div className="w-2 h-2 bg-indigo-500/40 rounded-full animate-pulse [animation-delay:200ms]" />
                           <div className="w-2 h-2 bg-indigo-500/40 rounded-full animate-pulse [animation-delay:400ms]" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Input Zone */}
                <div className="p-8 backdrop-blur-3xl bg-white/40 border-t border-gray-100">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="relative flex items-center gap-2 bg-gray-100/50 border border-gray-200 rounded-[3rem] p-2 focus-within:border-indigo-400/40 focus-within:bg-white transition-all group shadow-inner"
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Talk to Riya..."
                      className="flex-1 bg-transparent border-none outline-none px-8 py-4 text-gray-900 text-base placeholder:text-gray-300 z-10"
                    />
                    
                    <div className="flex items-center gap-2 z-10">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleListening}
                        className={`p-4 rounded-full transition-all ${state === 'listening' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-300 hover:text-indigo-500'}`}
                      >
                        {state === 'listening' ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </motion.button>
                      
                      <motion.button
                        type="submit"
                        disabled={!input.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-gray-900 text-white rounded-full shadow-lg disabled:opacity-20 font-bold"
                      >
                        <ArrowUp className="w-6 h-6" />
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeScreen === 'settings' && (
              <motion.div 
                key="settings-screen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto w-full py-10"
              >
                <PersonalityStudio 
                  traits={personalityTraits} 
                  onChange={setPersonalityTraits} 
                  vocalSettings={vocalSettings} 
                  onVocalChange={setVocalSettings} 
                  currentModel={currentModel} 
                  onModelChange={setCurrentModel} 
                  currentTheme={currentTheme} 
                  onThemeChange={setCurrentTheme} 
                  predefinedThemes={PREDEFINED_THEMES} 
                  onActionClick={handleUserMessage} 
                  onLauncherOpen={() => setIsShowingLauncher(true)} 
                  onAmbientOpen={() => setIsShowingAmbient(true)} 
                  onClose={() => setActiveScreen('home')} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {activeScreen !== 'home' && (
          <BottomNav 
            activeScreen={activeScreen}
            onScreenChange={setActiveScreen}
            onMicClick={toggleListening}
          />
        )}
        
        {/* AdMob Banner Integration */}
        <AdBanner adUnitId="ca-app-pub-7471209772119637/5382897220" />
      </main>

      <audio 
        ref={ambientAudioRef} 
        src={currentTrack.url} 
        loop 
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
      />

      {/* Dynamic Visual Overlays */}
      <AnimatePresence>
        {activeToast && <NotificationToast key={`toast-${activeToast.id}`} notification={activeToast} onClose={() => setActiveToast(null)} />}
        {isShowingReadLater && <ReadLaterOverlay key="read-later-overlay" messages={history.filter(m => m.isReadLater)} onClose={() => setIsShowingReadLater(false)} onToggle={toggleReadLater} onPlay={v => generateSpeechModern(v, vocalSettings).then(a => a && playPCM(a as string))} onClearAll={removeAllReadLater} />}
        {isShowingPersonality && <PersonalityStudio key="personality-studio-overlay" traits={personalityTraits} onChange={setPersonalityTraits} vocalSettings={vocalSettings} onVocalChange={setVocalSettings} currentModel={currentModel} onModelChange={setCurrentModel} currentTheme={currentTheme} onThemeChange={setCurrentTheme} predefinedThemes={PREDEFINED_THEMES} onActionClick={handleUserMessage} onLauncherOpen={() => setIsShowingLauncher(true)} onAmbientOpen={() => setIsShowingAmbient(true)} onClose={() => setIsShowingPersonality(false)} />}
        {isCameraActive && <CameraOverlay key="camera-overlay" videoRef={videoRef} onClose={() => setIsCameraActive(false)} />}
        <HolographicLauncher key="holographic-launcher" isOpen={isShowingLauncher} onClose={() => setIsShowingLauncher(false)} />
        {isShowingOnboarding && <Onboarding key="onboarding-overlay" onComplete={(u) => { if(u) { setUser(u); setDoc(doc(db, 'users', u.uid), { uid: u.uid, email: u.email, displayName: u.displayName, createdAt: new Date().toISOString() }).catch(e => console.error(e)); } setIsShowingOnboarding(false); localStorage.setItem('riya_onboarded', 'true'); handleUserMessage("Hello Jaan"); }} />}
        {isShowingAmbient && <AmbientMusicOverlay key="ambient-music-overlay" onClose={() => setIsShowingAmbient(false)} tracks={TRACKS} currentIndex={currentTrackIndex} setIndex={setCurrentTrackIndex} isPlaying={isMusicPlaying} setIsPlaying={setIsMusicPlaying} volume={musicVolume} setVolume={setMusicVolume} />}
        {permissionError && <PermissionErrorOverlay key="permission-error-overlay" error={permissionError} onClose={() => setPermissionError(null)} />}
        
        {/* Interaction Feedbacks */}
        {isHandHolding && <FeedbackOverlay key="gesture-heart" type="heart" label="Holding you..." color="rose" />}
        {isKissing && <FeedbackOverlay key="gesture-kiss" type="kiss" label="💋" />}
        {isCelebratingBirthday && <FeedbackOverlay key="gesture-birthday" type="birthday" label="Happy Birthday My Love" />}
        {isFocusMode && <FeedbackOverlay key="gesture-focus" type="focus" label="Deep Focus" />}
        {isHugging && <FeedbackOverlay key="gesture-hug" type="hug" label="🫂" />}
      </AnimatePresence>
    </div>
  );
}

function StatItem({ label, value, color = "rose" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex flex-col gap-1.5 group cursor-default">
       <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/20 group-hover:text-white/40 transition-colors font-bold">{label}</span>
       <span className={`text-base font-display font-bold ${color === 'rose' ? 'text-purple-400' : 'text-indigo-400'}`}>{value}</span>
    </div>
  );
}

function SuggestionCard({ icon, title, sub, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.04)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative p-6 bg-white/[0.01] border border-white/5 rounded-3xl flex flex-col items-start gap-5 text-left transition-all overflow-hidden"
    >
      {/* Subtle Glow on Hover */}
      <div className="absolute -inset-10 bg-purple-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-lg group-hover:border-purple-500/40 transition-all duration-500">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 group-hover:scale-110 transition-transform' })}
      </div>
      
      <div className="relative">
        <h4 className="text-[13px] font-bold text-white/90 tracking-tight">{title}</h4>
        <p className="text-[10px] text-white/30 font-medium mt-1.5 leading-relaxed tracking-wide">{sub}</p>
      </div>
      
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-30 transition-opacity">
         <ArrowRight className="w-3 h-3 text-white" />
      </div>
    </motion.button>
  );
}

const FeedbackOverlay: React.FC<{ type: string, label: string, color?: string }> = ({ type, label, color = "rose" }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center overflow-hidden"
    >
      <div className={`absolute inset-0 ${color === 'rose' ? 'bg-rose-500/5' : 'bg-indigo-500/5'} backdrop-blur-sm`} />
      <div className="relative text-center">
        {type === 'heart' && <Heart className="w-32 h-32 text-rose-500 fill-current opacity-20 animate-pulse mx-auto" />}
        <p className="font-serif italic text-3xl mt-6 text-white/80 tracking-widest">{label}</p>
      </div>
    </motion.div>
  );
}

function ReadLaterOverlay({ messages, onClose, onToggle, onPlay, onClearAll }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 max-h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
           <h3 className="text-xl font-display font-bold tracking-tight text-gray-900">Spectral Archive</h3>
           <button onClick={onClearAll} className="p-2 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
           {messages.length === 0 ? (
             <div className="text-center py-20 opacity-20 text-gray-900"><Bookmark className="w-12 h-12 mx-auto mb-4" />No memories archived.</div>
           ) : (
             messages.map((m: any, i: number) => (
               <div key={`${m.id}-${i}`} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 shadow-sm">
                  <p className="text-gray-700 italic font-medium">"{m.content}"</p>
                  <div className="flex items-center justify-between">
                     <button onClick={() => onPlay(m.content)} className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold hover:text-indigo-700">Relive Moment</button>
                     <button onClick={() => onToggle(m.id)} className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 font-bold">Purge</button>
                  </div>
               </div>
             ))
           )}
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg">Close Archive</button>
        </div>
      </motion.div>
    </div>
  );
}

function CameraOverlay({ videoRef, onClose }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-24 right-10 w-64 h-80 bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden z-[60] shadow-2xl p-1"
    >
      <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale opacity-90" />
        <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay" />
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/10 backdrop-blur-md px-2 py-1 rounded-lg">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
           <span className="text-[9px] uppercase tracking-widest font-bold text-white">Visual Sync</span>
        </div>
        <button onClick={onClose} className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-md border border-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors shadow-sm"><X className="w-4 h-4" /></button>
      </div>
    </motion.div>
  );
}

function AmbientMusicOverlay({ onClose, tracks, currentIndex, setIndex, isPlaying, setIsPlaying, volume, setVolume }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      <motion.div className="relative w-80 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 space-y-8">
         <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold tracking-tight text-gray-900">Atmospheres</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
         </div>
         <div className="space-y-2">
            {tracks.map((t: any, i: number) => (
              <button 
                key={t.id} 
                onClick={() => setIndex(i)} 
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all shadow-sm ${i === currentIndex ? 'bg-indigo-50 border border-indigo-100 text-indigo-600' : 'bg-gray-50 border border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <div className="flex items-center gap-3">
                   <Music className={`w-4 h-4 ${i === currentIndex ? 'text-indigo-500' : 'text-gray-300'}`} />
                   <span className="text-xs font-bold uppercase tracking-widest">{t.name}</span>
                </div>
                {i === currentIndex && isPlaying && <div className="w-1 h-3 bg-indigo-500 animate-bounce" />}
              </button>
            ))}
         </div>
         <div className="pt-2">
            <button onClick={onClose} className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all">Dismiss</button>
         </div>
      </motion.div>
    </div>
  );
}


