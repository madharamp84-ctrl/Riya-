import React from 'react';
import { motion } from 'motion/react';

interface Props {
  isPlaying: boolean;
  volume: number;
  count?: number;
  color?: string;
}

export const MusicVisualizer: React.FC<Props> = ({ 
  isPlaying, 
  volume, 
  count = 20, 
  color = 'var(--theme-primary)' 
}) => {
  return (
    <div className="flex items-end justify-center gap-1 h-full w-full px-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={isPlaying ? {
            height: [
              `${20 + Math.random() * 30 * volume}%`,
              `${40 + Math.random() * 60 * volume}%`,
              `${20 + Math.random() * 30 * volume}%`
            ]
          } : {
            height: '15%'
          }}
          transition={{
            duration: 0.4 + Math.random() * 0.4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex-1 rounded-full min-w-[2px]"
          style={{ 
            backgroundColor: color,
            opacity: 0.4 + (i / count) * 0.6,
            boxShadow: isPlaying ? `0 0 15px ${color}66` : 'none'
          }}
        />
      ))}
    </div>
  );
};
