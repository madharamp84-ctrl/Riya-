import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Phone, Music, Youtube, Camera, Grid } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HolographicLauncher: React.FC<Props> = ({ isOpen, onClose }) => {
  const apps = [
    { name: 'WhatsApp', icon: MessageSquare, color: '#25D366', action: () => window.open('https://wa.me/', '_blank') },
    { name: 'Phone', icon: Phone, color: '#38bdf8', action: () => window.open('tel:', '_self') },
    { name: 'Music', icon: Music, color: '#a855f7', action: () => {}, active: true },
    { name: 'YouTube', icon: Youtube, color: '#FF0000', action: () => window.open('https://youtube.com/', '_blank') },
    { name: 'Camera', icon: Camera, color: '#94a3b8', action: () => {} },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="holographic-launcher-portal" className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Launcher Grid */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: 20 }}
            className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-[3rem] p-10 shadow-2xl backdrop-blur-2xl overflow-hidden preserve-3d"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <Grid className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                   <h3 className="text-gray-900 font-display font-bold text-xl uppercase tracking-widest">Neural Launcher</h3>
                   <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Voice-active holographic access</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {apps.map((app, i) => (
                <motion.button
                  key={app.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={app.action}
                  className="group relative aspect-square rounded-[2rem] bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-white transition-all duration-500 overflow-hidden shadow-xs hover:shadow-lg"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm bg-white"
                    >
                      <app.icon className="w-8 h-8" style={{ color: app.color }} />
                    </div>
                    <span className="text-gray-900 font-display text-xs font-bold tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity">
                      {app.name}
                    </span>
                  </div>

                  {app.active && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Bottom Glow Overlay */}
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/5 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
