import React from 'react';
import { motion } from 'motion/react';

interface ParticleProps {
  mood: 'caring' | 'playful' | 'curiosity' | 'normal';
  color: string;
}

export const MoodParticles: React.FC<ParticleProps> = ({ mood, color }) => {
  const particleCount = mood === 'playful' ? 50 : mood === 'curiosity' ? 40 : 30;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
      {[...Array(particleCount)].map((_, i) => (
        <Particle key={i} index={i} mood={mood} color={color} />
      ))}
    </div>
  );
};

const Particle: React.FC<{ index: number; mood: string; color: string }> = ({ index, mood, color }) => {
  const isCaring = mood === 'caring';
  const isPlayful = mood === 'playful';
  const isCurious = mood === 'curiosity';

  const initialX = Math.random() * 100;
  const initialY = Math.random() * 100;
  
  const variants = {
    caring: {
      y: [0, -40, -80, -40, 0],
      x: [0, Math.sin(index) * 20, Math.cos(index) * 20, 0],
      opacity: [0, 0.4, 0.6, 0.4, 0],
      scale: [0.3, 1.5, 2, 1.5, 0.3],
      filter: ["blur(4px)", "blur(8px)", "blur(12px)", "blur(8px)", "blur(4px)"],
      transition: {
        duration: 12 + Math.random() * 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.3
      }
    },
    playful: {
      scale: [0, 1.5, 0],
      opacity: [0, 1, 0],
      rotate: [0, 360],
      x: [0, (Math.random() - 0.5) * 100],
      y: [0, (Math.random() - 0.5) * 100],
      transition: {
        duration: 1 + Math.random() * 2,
        repeat: Infinity,
        ease: "backOut",
        delay: index * 0.05
      }
    },
    curiosity: {
      y: [120, -50],
      opacity: [0, 0.8, 0],
      scale: [0.1, 1, 0.1],
      height: ["2px", "20px", "2px"],
      transition: {
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        ease: "linear",
        delay: index * 0.1
      }
    },
    normal: {
      opacity: [0, 0.2, 0],
      scale: [0.5, 1, 0.5],
      transition: {
        duration: 5 + Math.random() * 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.2
      }
    }
  };

  const getAnimation = () => {
    if (isCaring) return variants.caring;
    if (isPlayful) return variants.playful;
    if (isCurious) return variants.curiosity;
    return variants.normal;
  };

  return (
    <motion.div
      initial={{ x: `${initialX}%`, y: `${initialY}%`, opacity: 0 }}
      animate={getAnimation()}
      className="absolute pointer-events-none"
      style={{
        width: isPlayful ? '3px' : isCurious ? '1px' : '10px',
        height: isPlayful ? '3px' : isCurious ? '15px' : '10px',
        borderRadius: isCurious ? '0' : '50%',
        backgroundColor: color,
        boxShadow: `0 0 15px ${color}`,
        border: isCaring ? `1px solid rgba(255,255,255,0.3)` : 'none'
      }}
    />
  );
};
