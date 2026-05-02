import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Smile, Frown, Meh, Loader2 } from 'lucide-react';

interface Props {
  isActive: boolean;
  onEmotionDetected: (emotion: string) => void;
}

export const EmotionLens: React.FC<Props> = ({ isActive, onEmotionDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("EmotionLens: Camera failed", err));
    } else if (!isActive && videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  }, [isActive]);

  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, 200, 150);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      
      try {
        const response = await fetch('/api/vision/emotion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        });
        
        if (response.ok) {
          const { emotion } = await response.json();
          setCurrentEmotion(emotion);
          onEmotionDetected(emotion);
        }
      } catch (e) {
        console.error("Emotion analysis failed", e);
      }
    }
    setIsAnalyzing(false);
  };

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(analyzeFrame, 5000); // Analyze every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-32 left-8 z-[60] group">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card rounded-2xl p-2 border-white/10 overflow-hidden shadow-2xl"
      >
        <div className="relative w-32 h-24 rounded-xl overflow-hidden bg-black/40">
           <video 
             ref={videoRef} 
             autoPlay 
             muted 
             playsInline 
             className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
           <canvas ref={canvasRef} width="200" height="150" className="hidden" />
           
           <div className="absolute bottom-2 left-2 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-[8px] text-white/60 uppercase tracking-[0.2em] font-headline">Emotion Sync</span>
           </div>
           
           {isAnalyzing && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
               <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
             </div>
           )}
        </div>
        
        <AnimatePresence>
          {currentEmotion && (
            <motion.div 
              key={`emotion-pill-${currentEmotion}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/5"
            >
              {currentEmotion === 'happy' && <Smile className="w-4 h-4 text-green-400" />}
              {currentEmotion === 'sad' && <Frown className="w-4 h-4 text-sky-400" />}
              {currentEmotion === 'neutral' && <Meh className="w-4 h-4 text-slate-400" />}
              <span className="text-[10px] text-white/80 font-headline capitalize">{currentEmotion}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
