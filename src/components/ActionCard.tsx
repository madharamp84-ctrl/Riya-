import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Props {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

export const ActionCard: React.FC<Props> = ({ icon, title, subtitle, onClick }) => (
  <button 
    onClick={onClick}
    className="group relative overflow-hidden bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8 flex items-center justify-between active:scale-[0.98] transition-all text-left w-full hover:bg-gray-100 shadow-sm"
  >
    <div className="flex items-center gap-6">
      <div className="w-16 h-16 rounded-full bg-white shadow-md text-indigo-500 flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-gray-900 font-bold text-base tracking-tight font-sans">{title}</h4>
        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">{subtitle}</p>
      </div>
    </div>
    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-300 group-hover:text-indigo-500 group-hover:border-indigo-500 transition-all">
      <ArrowRight className="w-4 h-4" />
    </div>
  </button>
);
