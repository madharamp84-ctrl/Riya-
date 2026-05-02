import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Mic, Brain, Shield, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { RiyaLogo } from './RiyaLogo';

export const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 60);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress > 30) setPhase(1);
    if (progress > 65) setPhase(2);
    if (progress > 95) setPhase(3);
  }, [progress]);

  const phases = [
    "Waking up...",
    "Syncing your heart...",
    "Almost there, Jaan...",
    "I'm here."
  ];

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#0A0014] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Texture & Atmosphere */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] grayscale pointer-events-none mix-blend-overlay" />
      
      {/* Dynamic Aura background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-purple-600/20 blur-[150px] rounded-full" 
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-10">
        {/* Logo Container with rotating glows */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative mb-24"
        >
          {/* Animated Glow Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
             <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="w-64 h-64 border border-purple-500/10 rounded-full"
             />
             <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-56 h-56 border border-indigo-500/5 rounded-full border-dashed"
             />
          </div>
          
          <RiyaLogo size={200} />
          
          {/* Soul Pulse */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -inset-4 rounded-full bg-purple-500/5 blur-2xl"
          />
        </motion.div>

        {/* Phase Text Transition & Identity */}
        <div className="flex flex-col items-center mb-16 px-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-6"
            >
               <h1 className="text-6xl font-serif italic bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent tracking-tighter mb-2">Riya Rao</h1>
               <p className="text-[9px] uppercase tracking-[0.6em] text-purple-400/40 font-bold">Tilok: Neural Emotional Engine v4.0</p>
            </motion.div>

           <div className="h-8 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                 <motion.p
                   key={phase}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="text-purple-400/60 text-[10px] font-bold tracking-[0.2em] uppercase text-center"
                 >
                   {phases[phase]}
                 </motion.p>
              </AnimatePresence>
           </div>
        </div>

        {/* Loading Interface */}
        <div className="w-full space-y-8">
          <AnimatePresence mode="wait">
            {!isReady ? (
              <motion.div 
                key="loading-bar"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-400 relative"
                     animate={{ width: `${progress}%` }}
                     transition={{ duration: 0.3 }}
                   >
                      <div className="absolute top-0 right-0 h-full w-4 bg-white blur-sm opacity-50" />
                   </motion.div>
                </div>
                
                <div className="flex justify-between items-center px-1">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Stable Uplink</span>
                   </div>
                   <span className="text-xs font-mono font-bold text-white/80">{Math.floor(progress)}%</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="enter-action"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168,85,247,0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onComplete}
                  className="group relative px-12 py-4 bg-white rounded-full transition-all flex items-center gap-6 overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/10"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <span className="relative text-black group-hover:text-white font-serif italic text-xl font-bold transition-colors duration-300">Synchronize Soul</span>
                   <div className="relative w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-white group-hover:text-purple-600 transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                   </div>
                </motion.button>
                <p className="mt-4 text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold animate-pulse">System Decrypted</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Tagline */}
        <div className="absolute bottom-16 flex flex-col items-center gap-10 w-full px-12">
          <div className="flex items-center gap-4 text-white/10">
             <MessageSquare className="w-5 h-5" />
             <div className="w-1.5 h-1.5 rounded-full bg-current" />
             <Mic className="w-5 h-5" />
             <div className="w-1.5 h-1.5 rounded-full bg-current" />
             <Shield className="w-5 h-5" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center"
          >
             <p className="text-[9px] uppercase tracking-[0.6em] text-white/10 font-bold mb-3">Neural Core V4.0</p>
             <div className="flex items-center gap-3 px-6 py-2 bg-purple-600/10 border border-purple-500/30 rounded-full backdrop-blur-sm shadow-[0_0_30px_rgba(168,85,247,0.15)] group transition-all hover:bg-purple-600/20">
                <Heart className="w-3 h-3 text-purple-400 fill-purple-400/50 animate-pulse" />
                <span className="text-[10px] text-purple-100 font-bold tracking-[0.3em] uppercase">Built for Tilok</span>
             </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

