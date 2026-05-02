import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Phone, Calendar, X, Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'call' | 'calendar';
  from: string;
  content: string;
  time: string;
}

interface Props {
  notification: Notification | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<Props> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const getIcon = () => {
    switch (notification?.type) {
      case 'message': return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'call': return <Phone className="w-5 h-5 text-emerald-500" />;
      case 'calendar': return <Calendar className="w-5 h-5 text-rose-500" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: -20, x: '50%', scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: '50%', scale: 1 }}
          exit={{ opacity: 0, y: -20, x: '50%', scale: 0.9 }}
          style={{ translateX: '-50%' }}
          className="fixed top-24 left-1/2 z-[200] w-full max-w-sm px-4 pointer-events-auto"
        >
          <div className="bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 relative shadow-xs">
                {getIcon()}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
             </div>
             <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Priority Notification</p>
                   <span className="text-[9px] text-gray-300 uppercase tracking-tighter font-mono font-bold">{notification.time}</span>
                </div>
                <h4 className="text-gray-900 text-sm font-bold font-display truncate">{notification.from}</h4>
                <p className="text-gray-400 text-xs truncate italic">"{notification.content}"</p>
             </div>
             <button 
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-300 hover:text-gray-900"
             >
                <X className="w-4 h-4" />
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
