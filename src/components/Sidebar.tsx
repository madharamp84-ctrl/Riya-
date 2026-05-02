import React from 'react';
import { motion } from 'motion/react';
import { Radio, Archive, Sparkles, BellRing, Compass, Smile, Heart as HeartIcon } from 'lucide-react';
import { PersonalityTraits } from '../lib/gemini';

export const Sidebar: React.FC<{ 
  traits?: PersonalityTraits;
  onArchiveClick?: () => void;
  onPersonalityClick?: () => void;
  onSimulate?: (type: 'message' | 'call' | 'calendar') => void;
}> = ({ traits, onArchiveClick, onPersonalityClick, onSimulate }) => {
  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-72 z-50 py-12 px-8 bg-black/40 backdrop-blur-3xl border-r border-white/5 shadow-2xl">
      <div className="flex flex-col gap-2 mb-16">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center p-1.5 shadow-lg shadow-purple-500/20">
              <Sparkles className="w-full h-full text-white" />
           </div>
           <h2 className="text-xl font-bold text-white tracking-widest uppercase">RIYA <span className="text-purple-500">CORE</span></h2>
        </div>
        <div className="flex items-center gap-2 pl-11 opacity-40">
           <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
           <span className="text-[8px] uppercase tracking-[0.4em] font-mono font-bold text-white">Neural interface v4.0</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-10 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-5">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold px-4">Core Directory</p>
          <ul className="flex flex-col gap-1.5">
            <NavItem icon={<Radio className="w-4 h-4" />} label="Connection" active />
            <NavItem icon={<Archive className="w-4 h-4" />} label="Archive" onClick={onArchiveClick} />
            <NavItem icon={<Sparkles className="w-4 h-4" />} label="Personality" onClick={onPersonalityClick} />
          </ul>
        </div>

        {traits && (
          <div className="space-y-6 pt-6 border-t border-white/5">
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold px-4">Trait Matrix</p>
            <div className="px-1 space-y-5">
              <SidebarTrait label="Curiosity" value={traits.curiosity} icon={<Compass className="w-3.5 h-3.5" />} color="#60a5fa" />
              <SidebarTrait label="Playful" value={traits.playfulness} icon={<Smile className="w-3.5 h-3.5" />} color="#fcd34d" />
              <SidebarTrait label="Caring" value={traits.caring} icon={<HeartIcon className="w-3.5 h-3.5" />} color="#fb7185" />
            </div>
          </div>
        )}

        <div className="space-y-5">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold px-4">Neural Signals</p>
          <ul className="flex flex-col gap-1.5">
            <NavItem icon={<BellRing className="w-4 h-4" />} label="Msg Ping" onClick={() => onSimulate?.('message')} />
            <NavItem icon={<BellRing className="w-4 h-4" />} label="Voice Call" onClick={() => onSimulate?.('call')} />
            <NavItem icon={<BellRing className="w-4 h-4" />} label="Task Sync" onClick={() => onSimulate?.('calendar')} />
          </ul>
        </div>
      </div>

      <div className="mt-auto space-y-8">
        <div className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 space-y-4">
           <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-white/20">
              <span className="font-mono font-bold">Sync Efficiency</span>
              <span className="text-white/80 font-mono">99.8%</span>
           </div>
           <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '99.8%' }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              />
           </div>
        </div>
        
        <div className="flex items-center gap-3 px-4">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
           <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">Secure Uplink Verified</span>
        </div>
      </div>
    </nav>

  );
};

const SidebarTrait: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
       <div className="flex items-center gap-2">
          <div className="opacity-40" style={{ color: value > 50 ? color : undefined }}>{icon}</div>
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold">{label}</span>
       </div>
       <span className="text-[9px] font-mono text-white/40 font-bold">{value}%</span>
    </div>
    <div className="h-[1px] w-full bg-white/5 rounded-full overflow-hidden">
       <motion.div 
         initial={false}
         animate={{ width: `${value}%` }}
         className="h-full shadow-[0_0_8px_rgba(255,255,255,0.1)]"
         style={{ backgroundColor: color }}
       />
    </div>
  </div>
);

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <li>
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 py-3 px-4 transition-all rounded-xl group ${
        active ? 'bg-white/[0.04] text-white font-bold border border-white/5 shadow-lg' : 'text-white/40 hover:bg-white/[0.02] hover:text-white/90'
      }`}
    >
      <div className={`${active ? 'text-purple-400' : 'text-white/20 group-hover:text-white/60'}`}>
        {icon}
      </div>
      <span className="text-[10px] uppercase tracking-[0.3em] flex-1 text-left">{label}</span>
      {active && <div className="w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
    </button>
  </li>
);
