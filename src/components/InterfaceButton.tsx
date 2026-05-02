import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap } from 'lucide-react';

interface InterfaceButtonProps {
  label: string;
  onClick: () => void;
  active?: boolean;
}

export const InterfaceButton: React.FC<InterfaceButtonProps> = ({ label, onClick, active }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative group overflow-hidden px-8 py-4 rounded-2xl border transition-all duration-500 ${
        active 
          ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
          : 'bg-white/[0.02] border-white/10 hover:border-purple-500/40'
      }`}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Scanning Line Animation */}
      <motion.div 
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-40"
      />

      <div className="relative flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-purple-500 text-white' : 'bg-white/5 text-purple-400 group-hover:bg-purple-500/20'}`}>
          <Cpu className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex flex-col items-start translate-y-0.5">
          <span className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-colors ${active ? 'text-purple-300' : 'text-white/40'}`}>System</span>
          <span className="text-sm font-bold text-white tracking-tight">{label}</span>
        </div>
        <Zap className={`w-3 h-3 ml-2 transition-opacity ${active ? 'opacity-100 text-yellow-400' : 'opacity-0'}`} />
      </div>

      {/* Border Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/50 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/50 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/50 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/50 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
};
