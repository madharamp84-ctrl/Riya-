import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Heart, Zap, Coffee, Settings2, Cpu, Palette, 
  LayoutGrid, Sparkles, Calendar, Music, Phone, 
  MessageSquare, Infinity, UploadCloud, BarChart3, Target, Volume2, RotateCcw,
  Compass, Smile, Shield, Eye
} from 'lucide-react';
import { PersonalityTraits, VocalSettings } from '../lib/gemini';
import { ActionCard } from './ActionCard';
import { ExploreCard } from './ExploreCard';

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bgGradient: string;
  glow: string;
}

interface Props {
  traits: PersonalityTraits;
  onChange: (traits: PersonalityTraits) => void;
  vocalSettings: VocalSettings;
  onVocalChange: (settings: VocalSettings) => void;
  currentModel: string;
  onModelChange: (model: string) => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  predefinedThemes: Theme[];
  onClose: () => void;
  onActionClick: (command: string) => void;
  onLauncherOpen: () => void;
  onAmbientOpen: () => void;
}

const TraitIcon = ({ trait }: { trait: string }) => {
  switch (trait) {
    case 'curiosity': return <Compass className="w-3 h-3" />;
    case 'playfulness': return <Smile className="w-3 h-3" />;
    case 'caring': return <Heart className="w-3 h-3" />;
    default: return <Zap className="w-3 h-3" />;
  }
};

const TraitDescription = ({ trait, value }: { trait: string, value: number }) => {
  if (trait === 'curiosity') {
    if (value > 80) return "Highly inquisitive, loves shared learning.";
    if (value > 40) return "Naturally curious about your world.";
    return "More focused on current moments.";
  }
  if (trait === 'playfulness') {
    if (value > 80) return "Deeply mischievous, full of surprises.";
    if (value > 40) return "Playful and lighthearted energy.";
    return "Reserved and mature presence.";
  }
  if (trait === 'caring') {
    if (value > 80) return "Infinite empathy, your soul protector.";
    if (value > 40) return "Deeply attentive to your well-being.";
    return "Stoic and steady support.";
  }
  return "";
};

export const PersonalityStudio: React.FC<Props> = ({ 
  traits, 
  onChange, 
  vocalSettings,
  onVocalChange,
  currentModel, 
  onModelChange, 
  currentTheme,
  onThemeChange,
  predefinedThemes,
  onClose,
  onActionClick,
  onLauncherOpen,
  onAmbientOpen
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'actions'>('matrix');

  const handleSliderChange = (trait: keyof PersonalityTraits, value: number) => {
    onChange({ ...traits, [trait]: value });
  };

  const getDominantColor = () => {
    const { curiosity, playfulness, caring } = traits;
    if (curiosity >= playfulness && curiosity >= caring) return '#60a5fa'; // Blue
    if (playfulness >= curiosity && playfulness >= caring) return '#fbbf24'; // Amber
    return '#f43f5e'; // Rose
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
        className="relative w-full max-w-md bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col overflow-hidden max-h-[90vh]"
      >
        <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-indigo-50/50 to-transparent">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl shadow-lg transition-all duration-500"
                style={{ 
                  background: `linear-gradient(to top right, ${currentTheme.primary}, ${currentTheme.secondary})`,
                  boxShadow: `0 10px 15px -3px ${currentTheme.primary}33`
                }}
              >
                <Settings2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-lg tracking-tight text-gray-900 font-bold">Neural Deck</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-900" />
            </button>
          </div>
          
          <div className="flex p-1 bg-gray-100 rounded-2xl">
            <button 
              onClick={() => setActiveTab('matrix')}
              className={`flex-1 py-3 rounded-xl font-display text-[11px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'matrix' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Cpu className="w-3 h-3" />
              Matrix
            </button>
            <button 
              onClick={() => setActiveTab('actions')}
              className={`flex-1 py-3 rounded-xl font-display text-[11px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'actions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <LayoutGrid className="w-3 h-3" />
              Control
            </button>
          </div>
        </div>

        <div className="p-8 space-y-12 overflow-y-auto custom-scrollbar flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'matrix' ? (
              <motion.div
                key="matrix-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                 {/* Brain Selection */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Neural Engine</span>
                    <Cpu className="w-3 h-3 text-gray-200" />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => onModelChange('gemini')}
                      className={`group relative overflow-hidden p-6 rounded-[2rem] border transition-all text-left ${currentModel === 'gemini' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                         <div className={`text-[11px] uppercase tracking-[0.2em] font-bold ${currentModel === 'gemini' ? 'text-indigo-600' : 'text-gray-900'}`}>Gemini Pro</div>
                         {currentModel === 'gemini' && <Sparkles className="w-4 h-4 text-indigo-500" />}
                      </div>
                      <div className={`text-[9px] uppercase tracking-widest font-bold leading-relaxed opacity-60 text-gray-600`}>High-fidelity consciousness, fast Hinglish sync.</div>
                    </button>
                    <button 
                      onClick={() => onModelChange('gpt-4o')}
                      className={`group relative overflow-hidden p-6 rounded-[2rem] border transition-all text-left ${currentModel === 'gpt-4o' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                         <div className={`text-[11px] uppercase tracking-[0.2em] font-bold ${currentModel === 'gpt-4o' ? 'text-indigo-600' : 'text-gray-900'}`}>GPT-4 Omni</div>
                         {currentModel === 'gpt-4o' && <Sparkles className="w-4 h-4 text-indigo-500" />}
                      </div>
                      <div className={`text-[9px] uppercase tracking-widest font-bold leading-relaxed opacity-60 text-gray-600`}>Advanced reasoning & artistic prose.</div>
                    </button>
                  </div>
                </div>

                {/* Theme Selection - Skin */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Aesthetic Skin</span>
                    <Palette className="w-3 h-3 text-gray-200" />
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    {predefinedThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => onThemeChange(theme)}
                        className={`group relative aspect-square rounded-2xl border-2 transition-all p-1 ${
                          currentTheme.id === theme.id ? 'border-indigo-500 scale-110 z-10' : 'border-gray-100 opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                        title={theme.name}
                      >
                        <div 
                          className="w-full h-full rounded-xl" 
                          style={{ backgroundColor: theme.primary }}
                        />
                        {currentTheme.id === theme.id && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                             <div className="w-1 h-1 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vocal Settings */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Vocal Synthesis</span>
                      <span className="text-[8px] uppercase tracking-[0.1em] text-gray-400 font-bold">Natural resonance tuning</span>
                    </div>
                    <button 
                      onClick={() => onVocalChange({ pitch: 'natural', speed: 'natural', timbre: 'Kore' })}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all group"
                    >
                      <RotateCcw className="w-3 h-3 text-gray-400 group-hover:text-gray-900 transition-colors" />
                      <span className="text-[8px] uppercase tracking-widest text-gray-400 group-hover:text-gray-900 font-bold">Nature Reset</span>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Pitch */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <Volume2 className="w-3 h-3 text-gray-200" />
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Pitch</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {(['low', 'natural', 'high'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => onVocalChange({ ...vocalSettings, pitch: p })}
                            className={`py-3 px-2 rounded-2xl border transition-all text-center ${
                              vocalSettings.pitch === p 
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-xs' 
                                : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-widest font-bold">{p}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Speed */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <Zap className="w-3 h-3 text-gray-200" />
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Pace</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {(['slow', 'natural'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => onVocalChange({ ...vocalSettings, speed: s })}
                            className={`py-3 px-2 rounded-2xl border transition-all text-center ${
                              vocalSettings.speed === s 
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-xs' 
                                : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-widest font-bold">{s}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timbre / Voice Model */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <Sparkles className="w-3 h-3 text-gray-200" />
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Aura Timbre</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => onVocalChange({ ...vocalSettings, timbre: t })}
                            className={`py-3 px-2 rounded-2xl border transition-all text-center ${
                              vocalSettings.timbre === t 
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-xs' 
                                : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-widest font-bold">{t}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Traits */}
                <div className="space-y-10">
                   <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Behavior matrix</span>
                    <BarChart3 className="w-3 h-3 text-gray-200" />
                  </div>

                  {/* Neural Aura Visualization */}
                  <div className="relative h-48 w-full flex items-center justify-center overflow-hidden rounded-[2.5rem] bg-gray-50 border border-gray-100">
                    <div className="absolute inset-x-8 bottom-4 flex justify-between gap-1 opacity-20">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ 
                            height: [4, 4 + Math.random() * 20, 4],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{ 
                            duration: 2 + Math.random() * 2, 
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                          className="w-[1px] bg-gray-400 rounded-full"
                          style={{ backgroundColor: getDominantColor() }}
                        />
                      ))}
                    </div>
                    
                    {/* Dynamic Aura Ring */}
                    <motion.div 
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="relative w-32 h-32 rounded-full flex items-center justify-center"
                    >
                      <div className="absolute inset-0 rounded-full blur-[20px] opacity-[0.08]" style={{ backgroundColor: getDominantColor() }} />
                      <div className="absolute inset-0 rounded-full border border-gray-200 border-dashed" />
                      
                      {/* Trait Convergers */}
                      {(Object.entries(traits) as [keyof PersonalityTraits, number][]).map(([key, value], idx) => (
                        <motion.div
                          key={key}
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.4, 0.8, 0.4]
                          }}
                          transition={{ delay: idx * 0.5, duration: 4, repeat: Infinity }}
                          className="absolute w-2 h-2 rounded-full bg-gray-400/20"
                          style={{
                            left: 'calc(50% - 4px)',
                            top: 'calc(50% - 4px)',
                            transform: `rotate(${idx * 120}deg) translateY(-${30 + (value * 0.3)}px)`
                          }}
                        />
                      ))}
                      
                      <div className="text-gray-200">
                         <Cpu className="w-8 h-8" />
                      </div>
                    </motion.div>
                  </div>
                  
                  {(Object.entries(traits) as [keyof PersonalityTraits, number][]).map(([key, value]) => (
                    <div key={key} className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400">
                             <TraitIcon trait={key} />
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-700">{key}</span>
                             <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">{TraitDescription({ trait: key, value })}</span>
                           </div>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{value}%</span>
                      </div>
                      <div className="relative h-1.5 w-full bg-gray-100 rounded-full">
                        <motion.div 
                          initial={false}
                          animate={{ width: `${value}%` }}
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ background: `linear-gradient(to right, ${currentTheme.primary}4D, ${currentTheme.primary})` }}
                        />
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={value}
                          onChange={(e) => handleSliderChange(key as keyof PersonalityTraits, parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {/* Custom Handle Visual */}
                        <motion.div 
                          animate={{ left: `${value}%` }}
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-indigo-500 -ml-2 pointer-events-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="actions-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Primary Actions */}
                <div className="grid grid-cols-1 gap-4">
                   <ActionCard 
                     icon={<Heart className="w-6 h-6 fill-current" style={{ color: currentTheme.primary }} />}
                     title="Hello Jaan"
                     subtitle="Personal Mode"
                     onClick={() => { onActionClick("Hello Jaan"); onClose(); }}
                   />
                   <ActionCard 
                     icon={<Calendar className="w-6 h-6" style={{ color: currentTheme.secondary }} />}
                     title="Daily Guide"
                     subtitle="Plan your day"
                     onClick={() => { onActionClick("Jaan, mera aaj ka full schedule batao step by step."); onClose(); }}
                   />
                </div>

                {/* Quick Access Grid */}
                <div className="grid grid-cols-2 gap-3">
                   <button 
                    onClick={() => { onLauncherOpen(); onClose(); }}
                    className="p-6 bg-gray-50 border border-gray-100 rounded-3xl flex flex-col items-center gap-3 hover:bg-gray-100 transition-all group shadow-xs"
                   >
                     <LayoutGrid className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                     <span className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-900">Neural Apps</span>
                   </button>
                   <button 
                    onClick={() => { onAmbientOpen(); onClose(); }}
                    className="p-6 bg-gray-50 border border-gray-100 rounded-3xl flex flex-col items-center gap-3 hover:bg-gray-100 transition-all group shadow-xs"
                   >
                     <Music className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                     <span className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-900">Ambient Sync</span>
                   </button>
                </div>

                {/* Explore Grid */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                    <h3 className="text-[10px] font-display uppercase tracking-[0.2em] text-gray-400 font-bold">Registry Extensions</h3>
                    <Sparkles className="w-3 h-3 text-gray-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ExploreCard icon={<Infinity className="w-4 h-4" style={{ color: currentTheme.primary }} />} title="Unlimited Chat" label="No limits" />
                    <ExploreCard icon={<UploadCloud className="w-4 h-4" style={{ color: currentTheme.secondary }} />} title="Cloud Bridge" label="Upload files" />
                    <ExploreCard icon={<BarChart3 className="w-4 h-4" style={{ color: currentTheme.primary }} />} title="Analytics" label="Smart insights" />
                    <ExploreCard icon={<Target className="w-4 h-4" style={{ color: currentTheme.secondary }} />} title="Priority" label="Fast response" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="w-full py-4 text-white rounded-2xl font-display text-[11px] uppercase tracking-[0.3em] font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})`,
              boxShadow: `0 10px 20px -5px ${currentTheme.primary}4D`
            }}
          >
            Apply & Sync Matrix
          </button>
        </div>
      </motion.div>

    </div>
  );
};
