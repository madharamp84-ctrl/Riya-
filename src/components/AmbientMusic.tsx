import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Music, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { MusicVisualizer } from './MusicVisualizer';

interface Track {
  id: string;
  name: string;
  url: string;
  type: 'lofi' | 'ambient' | 'nature' | 'cyberpunk';
}

interface Props {
  onClose: () => void;
  tracks: Track[];
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

export const AmbientMusic: React.FC<Props> = ({ 
  onClose, 
  tracks, 
  currentTrackIndex, 
  setCurrentTrackIndex, 
  isPlaying, 
  setIsPlaying, 
  volume, 
  setVolume 
}) => {
  const currentTrack = tracks[currentTrackIndex];

  const handleNext = () => {
    setCurrentTrackIndex((currentTrackIndex + 1) % tracks.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((currentTrackIndex - 1 + tracks.length) % tracks.length);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-[#0a0b1e] rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-sky-500/10 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-sky-600 to-indigo-500 rounded-xl shadow-lg shadow-sky-500/20">
                <Music className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-headline text-lg uppercase tracking-widest text-white font-bold">Soundscape</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500 hover:text-white" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Ambient frequencies for resonance</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Now Playing Info */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center relative overflow-hidden group">
             <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-sky-500/20 to-transparent pointer-events-none" />
             <div className="w-full h-16 flex items-center justify-center mx-auto mb-4 relative z-10">
                <MusicVisualizer isPlaying={isPlaying} volume={volume} count={32} color="var(--theme-secondary)" />
             </div>
             <h4 className="font-headline text-sm uppercase tracking-widest text-white font-bold relative z-10">{currentTrack.name}</h4>
             <p className="text-[9px] text-sky-400 uppercase tracking-[0.2em] mt-1 relative z-10">{currentTrack.type}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={handlePrev}
              className="p-3 text-slate-400 hover:text-white transition-all hover:scale-110"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            <button 
              onClick={handleTogglePlay}
              className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 border border-white/10 group"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-white" />
              ) : (
                <Play className="w-8 h-8 fill-white ml-1" />
              )}
            </button>
            <button 
              onClick={handleNext}
              className="p-3 text-slate-400 hover:text-white transition-all hover:scale-110"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Volume */}
          <div className="space-y-4 pt-4">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                   {volume === 0 ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
                   <span className="font-headline text-[10px] uppercase tracking-widest text-white/50">Volume Intensity</span>
                </div>
                <span className="text-xs font-bold font-headline text-sky-400">{Math.round(volume * 100)}%</span>
             </div>
             <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {tracks.map((track, idx) => (
              <button
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(idx);
                  setIsPlaying(true);
                }}
                className={`py-3 px-4 rounded-xl text-[9px] uppercase tracking-widest transition-all border ${
                  currentTrackIndex === idx 
                    ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20' 
                    : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                }`}
              >
                {track.name}
              </button>
            ))}
          </div>
           <p className="text-[8px] text-slate-600 uppercase text-center tracking-widest italic pt-2">Environment persistence active in this link</p>
        </div>
      </motion.div>
    </div>
  );
};
