import React from 'react';

interface Props {
  icon: React.ReactNode;
  title: string;
  label: string;
}

export const ExploreCard: React.FC<Props> = ({ icon, title, label }) => (
  <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 transition-all hover:bg-gray-100 group shadow-xs">
    <div className="w-10 h-10 rounded-full bg-white shadow-sm text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h5 className="text-gray-900 font-bold text-xs tracking-tight mb-1">{title}</h5>
    <p className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">{label}</p>
  </div>
);
