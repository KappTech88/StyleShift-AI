import React, { useState } from 'react';
import { Wand2, RefreshCcw, Move, Sparkles, Cpu } from 'lucide-react';
import { PhotoType } from '../types';
import { Button } from './Button';

interface EditorProps {
  photoType: PhotoType;
  imageSrc: string;
  onGenerate: (prompt: string) => Promise<void>;
  isProcessing: boolean;
  onReset: () => void;
  onComplete?: () => void;
  isResult?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ 
  photoType, 
  imageSrc, 
  onGenerate, 
  isProcessing,
  onReset,
  isResult = false
}) => {
  const [prompt, setPrompt] = useState('');

  const headshotPresets = [
    "Add vintage film grain filter",
    "Change hair color to platinum blonde",
    "Apply soft glam makeup",
    "Add futuristic cyberpunk glasses",
    "Studio lighting enhancement",
    "Change background to a blurry city street",
    "Change background to a solid blue studio backdrop"
  ];

  const fullBodyPresets = [
    "Change outfit to a navy blue business suit",
    "Wear a leather jacket and jeans",
    "Change into a red evening dress",
    "Add a gold necklace and watch",
    "Change background to a busy coffee shop",
    "Change background to a sunny beach",
    "Cyberpunk fashion outfit"
  ];

  const dancePresets = [
    "Performing a dab dance move",
    "Doing the moonwalk",
    "Waving hello enthusiastically",
    "Pointing fingers like disco",
    "Crossing arms confidently",
    "Taking a bow"
  ];

  const presets = isResult 
    ? dancePresets 
    : (photoType === PhotoType.HEADSHOT ? headshotPresets : fullBodyPresets);

  const placeholder = isResult
    ? "Describe a dance move or gesture to perform..."
    : (photoType === PhotoType.HEADSHOT ? "e.g., Change hair to red, add glasses..." : "e.g., Change outfit to a tuxedo...");

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    // Enrich prompt based on context
    let finalPrompt = prompt;
    if (isResult) {
      finalPrompt = `Keep the character and outfit exactly the same, but change the pose to: ${prompt}. High quality photorealistic.`;
    } else {
      finalPrompt = `Edit this photo: ${prompt}. Maintain facial identity and high quality photorealism.`;
    }
    
    onGenerate(finalPrompt);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      {/* Image Preview Area */}
      <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-700 p-4 flex items-center justify-center relative overflow-hidden group">
        
        {/* Main Image */}
        <img 
          src={imageSrc} 
          alt="Preview" 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl relative z-10 transition-all duration-500"
          style={{ filter: isProcessing ? 'blur(2px) grayscale(0.5)' : 'none' }}
        />

        {/* Loading Overlay with Scanner Effect */}
        {isProcessing && (
          <>
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 z-20 backdrop-blur-sm rounded-2xl" />
            
            {/* Scanner Line */}
            <div className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] z-30 animate-scan" />
            
            {/* Center Processing Status */}
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse-ring opacity-75"></div>
                <div className="relative bg-slate-900 p-4 rounded-full border border-indigo-500/50 shadow-2xl shadow-indigo-500/20">
                  <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
              </div>
              
              <div className="mt-6 space-y-1 text-center">
                <h3 className="text-xl font-bold text-white tracking-widest uppercase">Processing</h3>
                <p className="text-indigo-300 text-xs font-mono">AI Model: Gemini 2.5 Flash Image</p>
                <div className="flex gap-1 justify-center mt-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-0"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button 
                onClick={onReset}
                className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                title="Start Over"
            >
                <RefreshCcw className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Controls Area */}
      <div className="w-full lg:w-96 flex flex-col gap-6 bg-slate-800 rounded-2xl p-6 border border-slate-700 overflow-y-auto">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            {isResult ? <><Move className="text-teal-400" /> Perform Moves</> : <><Wand2 className="text-indigo-400" /> AI Editor</>}
          </h3>
          <p className="text-slate-400 text-sm">
            {isResult 
              ? "Select a gesture or dance move to animate your character into a new pose." 
              : `Customize your ${photoType === PhotoType.HEADSHOT ? 'headshot' : 'full body'} photo.`}
          </p>
        </div>

        {/* Text Input */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-24"
          />
          <Button 
            onClick={handleGenerate} 
            disabled={!prompt.trim() || isProcessing} 
            isLoading={isProcessing}
            className="w-full"
            variant={isResult ? "secondary" : "primary"}
          >
            {isResult ? "Generate Pose" : "Generate Edit"}
          </Button>
        </div>

        {/* Presets */}
        <div className="space-y-3 flex-1">
           <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
             <Sparkles className="w-3 h-3" /> 
             {isResult ? "Popular Moves" : "Quick Ideas"}
           </label>
           <div className="grid grid-cols-1 gap-2">
             {presets.map((preset, idx) => (
               <button
                 key={idx}
                 onClick={() => setPrompt(preset)}
                 className="text-left text-sm p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 hover:text-white text-slate-300 transition-colors border border-transparent hover:border-slate-600"
               >
                 {preset}
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};
