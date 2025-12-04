import React from 'react';
import { User, UserCheck, Accessibility } from 'lucide-react';
import { PhotoType } from '../types';

interface PhotoTypeSelectionProps {
  onSelect: (type: PhotoType) => void;
}

export const PhotoTypeSelection: React.FC<PhotoTypeSelectionProps> = ({ onSelect }) => {
  const options = [
    {
      type: PhotoType.HEADSHOT,
      icon: User,
      title: "Headshot",
      desc: "Focus on face details, makeup, hair, and filters.",
      color: "from-pink-500 to-rose-500"
    },
    {
      type: PhotoType.MID_BODY,
      icon: UserCheck,
      title: "Mid Body",
      desc: "Great for changing tops, jackets, and accessories.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      type: PhotoType.FULL_BODY,
      icon: Accessibility, // Closest metaphor for full body stance
      title: "Full Body",
      desc: "Best for full outfit changes and mixing clothes. (Recommended)",
      color: "from-violet-500 to-purple-600",
      recommended: true
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">What kind of photo is this?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className="group relative flex flex-col items-center p-6 bg-slate-800 border border-slate-700 rounded-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 text-left"
          >
            {opt.recommended && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                RECOMMENDED
              </span>
            )}
            
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${opt.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-indigo-500/25`}>
              <opt.icon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">{opt.title}</h3>
            <p className="text-sm text-slate-400 text-center">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};