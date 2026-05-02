import React from 'react';
import { motion } from 'motion/react';

export const RiyaLogo = ({ size = 120, color = 'currentColor' }: { size?: number, color?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex items-center justify-center pt-2"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
      >
        {/* Glowing Outer Ring Segment */}
        <motion.path
          d="M100 20 C 144 20, 180 56, 180 100 C 180 144, 144 180, 100 180 C 56 180, 20 144, 20 100"
          stroke="url(#riya-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {/* "R" with Girl Silhouette Style */}
        <path
          d="M60 140V60H110C132.091 60 150 77.9086 150 100C150 109.43 146.732 118.106 141.272 124.93L155 140H135L123.5 125H80V140H60ZM80 80V105H110C112.761 105 115 102.761 115 100C115 97.2386 112.761 95 110 95H80V80Z"
          fill="url(#riya-gradient)"
          className="opacity-90"
        />
        
        {/* Girl Profile integration (Simplified style) */}
        <path
          d="M105 70C105 70 85 85 85 110C85 135 105 150 105 150C105 150 115 140 115 110C115 80 105 70 105 70Z"
          fill="url(#riya-gradient)"
          className="opacity-40 blur-[1px]"
        />
        
        <defs>
          <linearGradient id="riya-gradient" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Sparkles */}
      <motion.div
        animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-300 blur-[2px]"
      />
    </motion.div>
  );
};
