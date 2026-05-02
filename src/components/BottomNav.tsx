import React from 'react';
import { Home, MessageSquare, History, Settings, Mic, Grid } from 'lucide-react';

export const BottomNav: React.FC<{ 
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  onMicClick?: () => void;
}> = ({ activeScreen, onScreenChange, onMicClick }) => {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-3 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <NavItem 
        icon={<Home className="w-5 h-5" />} 
        label="Core" 
        active={activeScreen === 'home'} 
        onClick={() => onScreenChange('home')}
      />
      
      <NavItem 
        icon={<Grid className="w-5 h-5" />} 
        label="Nerve" 
        active={activeScreen === 'listings'} 
        onClick={() => onScreenChange('listings')}
      />

      <button 
        onClick={onMicClick}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 transition-all shrink-0 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] group"
      >
        <div className="flex gap-1.5 items-center">
          <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s] group-hover:bg-white" />
          <div className="w-1 h-5 bg-white/90 rounded-full animate-bounce [animation-delay:-0.15s] group-hover:bg-white" />
          <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce group-hover:bg-white" />
        </div>
      </button>

      <NavItem 
        icon={<MessageSquare className="w-5 h-5" />} 
        label="Sync" 
        active={activeScreen === 'chat'} 
        onClick={() => onScreenChange('chat')}
      />

      <NavItem 
        icon={<Settings className="w-5 h-5" />} 
        label="Config" 
        active={activeScreen === 'settings'} 
        onClick={() => onScreenChange('settings')}
      />
    </nav>
  );
};

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all outline-none ${active ? 'text-white' : 'text-white/20 hover:text-white/60'}`}
  >
    <div className={`transition-all duration-300 ${active ? 'scale-110 text-purple-400' : ''}`}>
      {icon}
    </div>
    <span className={`text-[8px] uppercase tracking-[0.2em] font-bold transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);
