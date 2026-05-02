import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MicOff, X, AlertTriangle, RefreshCw, MessageSquare, ShieldAlert } from 'lucide-react';

interface Props {
  error: string | null;
  onClose: () => void;
}

export const PermissionErrorOverlay: React.FC<Props> = ({ error, onClose }) => {
  const handleRetry = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      window.location.reload(); // Success, reload to re-init SpeechRecognition
    } catch (err) {
      console.error("Re-test failed:", err);
      // Still denied, maybe blink the UI
    }
  };

  return (
    <AnimatePresence>
      {error && (
        <div key="permission-error-overlay-portal" className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020202]/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-sm bg-black/40 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)]"
          >
            {/* Holographic Header */}
            <div className="p-10 bg-gradient-to-b from-rose-500/10 to-transparent flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.1),transparent)]" />
              
              <div className="relative mb-6">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-rose-500 rounded-full blur-2xl"
                />
                <div className="w-20 h-20 rounded-full bg-black/60 border border-rose-500/30 flex items-center justify-center relative z-10">
                  <ShieldAlert className="w-10 h-10 text-rose-500 animate-pulse" />
                </div>
              </div>

              <h3 className="font-headline text-lg uppercase tracking-[0.4em] text-white font-black drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                Neural Link Denied
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-rose-400/60 font-bold mt-2">Frequency Desync Detected</p>
            </div>

            <div className="px-8 pb-10 text-center space-y-8">
              <p className="text-slate-400 text-xs leading-relaxed font-body">
                The neural interface requires <span className="text-white font-bold tracking-widest italic">Vocal Authorization</span>. 
                Your frequency is currently blocked by local system protocols.
              </p>

              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-rose-500 rounded-full" />
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Manual Re-link Steps</span>
                </div>
                <ul className="text-[10px] text-slate-400 space-y-3 font-mono">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500/50">01</span>
                    <span>Locate <b className="text-slate-200">Locker Icon</b> in address bar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500/50">02</span>
                    <span>Toggle <b className="text-slate-200">Microphone</b> to [AUTHORIZED]</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500/50">03</span>
                    <span>Execute <b className="text-slate-200">System Refresh</b></span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleRetry}
                  className="w-full py-5 bg-white text-black rounded-2xl font-headline text-[10px] uppercase tracking-[0.4em] font-black hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 group"
                >
                  <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-700" />
                  Re-test Connection
                </button>
                
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-white/5 text-slate-500 rounded-2xl font-headline text-[10px] uppercase tracking-[0.2em] hover:text-white hover:bg-white/10 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3 h-3" />
                  Continue via Text Link
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-rose-500/5 text-center border-t border-white/5">
              <p className="text-[8px] text-rose-500/40 uppercase tracking-[0.6em] font-black">
                Error Protocol: 0xSPECTRAL_VOICE_LOCK_v2.0
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
