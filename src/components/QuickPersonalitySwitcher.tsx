import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Coffee, Heart, Sparkles } from 'lucide-react';
import { PersonalityTraits } from '../lib/gemini';

interface Props {
  traits: PersonalityTraits;
  onChange: (traits: PersonalityTraits) => void;
  primaryColor: string;
}

export const QuickPersonalitySwitcher: React.FC<Props> = ({ traits, onChange, primaryColor }) => {
  const modes = [
    { 
      id: 'curiosity', 
      name: 'Curious', 
      icon: Zap, 
      color: '#38bdf8', 
      values: { curiosity: 100, playfulness: 30, caring: 30 } 
    },
    { 
      id: 'playfulness', 
      name: 'Playful', 
      icon: Coffee, 
      color: primaryColor, 
      values: { curiosity: 30, playfulness: 100, caring: 30 } 
    },
    { 
      id: 'caring', 
      name: 'Caring', 
      icon: Heart, 
      color: '#f43f5e', 
      values: { curiosity: 30, playfulness: 30, caring: 100 } 
    }
  ];

  const getActiveMode = () => {
    const { curiosity, playfulness, caring } = traits;
    if (curiosity > playfulness && curiosity > caring) return 'curiosity';
    if (playfulness > curiosity && playfulness > caring) return 'playfulness';
    return 'caring';
  };

  const activeModeId = getActiveMode();

  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-full backdrop-blur-xl">
      {modes.map((mode) => {
        const isActive = activeModeId === mode.id;
        const Icon = mode.icon;

        return (
          <motion.button
            key={mode.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(mode.values)}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden ${
              isActive ? 'shadow-lg' : 'hover:bg-white/5'
            }`}
          >
            {isActive && (
              <motion.div 
                layoutId="active-personality-bg"
                className="absolute inset-0 z-0"
                style={{ backgroundColor: `${mode.color}33` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            
            <Icon 
              className={`w-4 h-4 relative z-10 transition-colors duration-500 ${
                isActive ? '' : 'text-slate-500'
              }`}
              style={{ color: isActive ? mode.color : undefined }}
            />

            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full border border-current opacity-20 pointer-events-none"
                style={{ color: mode.color }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
