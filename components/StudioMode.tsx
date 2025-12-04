import React, { useState, useEffect } from 'react';
import { Play, Sparkles, AlertCircle, RotateCcw, ChevronLeft, Film, Key, CheckCircle2, Loader2, Circle, Clock, X, Download, Maximize2 } from 'lucide-react';
import { Button } from './Button';
import { generateVideo } from '../services/geminiService';

interface StudioModeProps {
  imageSrc: string;
  onBack: () => void;
  onReset: () => void;
}

interface MoveOption {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: React.FC<{className?: string}>;
}

// Custom SVG Icons for Moves
const Icons = {
  Wave: ({className}: {className?: string}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 11l2-2a2.828 2.828 0 1 0-4-4l-4 4m0 0l-5 5a2 2 0 0 0 0 2.828l.172.172a2 2 0 0 0 2.828 0l5-5m-3-3l3 3m-2-5l4-4" />
      <path d="M12 22c5.523 0 10-4.477 10-10" className="opacity-30" />
    </svg>
  ),
  Dance: ({className}: {className?: string}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="5" r="3" />
      <path d="M9 12l-2 3-2-1" />
      <path d="M15 12l2 3 2-1" />
      <path d="M12 12v5" />
      <path d="M12 17l-3 4" />
      <path d="M12 17l3 4" />
      <path d="M6 8l6 4 6-4" />
    </svg>
  ),
  Spin: ({className}: {className?: string}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20a8 8 0 1 0-8-8" />
      <path d="M12 4v4l-4-4 4-4" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Bow: ({className}: {className?: string}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="16" cy="5" r="3" />
      <path d="M4 20l2-14 6 5" />
      <path d="M14 17l3 4" />
      <path d="M12 11l6 2" />
    </svg>
  ),
  Dab: ({className}: {className?: string}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
       <circle cx="12" cy="5" r="3" />
       <path d="M4 9l8 3" /> 
       <path d="M12 12l6-4 2 2" />
       <path d="M12 12v6" />
       <path d="M12 18l-3 4" />
       <path d="M12 18l3 4" />
    </svg>
  ),
  Moonwalk: ({className}: {className?: string}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 20l-2-5h4l2 5" />
      <path d="M15 20l-2-5" />
      <path d="M11 15v-5" />
      <circle cx="11" cy="5" r="3" />
      <path d="M6 12l5-2 5 2" />
      <path d="M4 20h6" />
    </svg>
  )
};

const MOVES: MoveOption[] = [
  {
    id: 'wave',
    name: 'Friendly Wave',
    description: 'A warm, enthusiastic greeting.',
    prompt: 'The character smiles warmly and waves their hand in a friendly greeting gesture',
    icon: Icons.Wave
  },
  {
    id: 'spin',
    name: '360 Spin',
    description: 'A stylish full-body spin.',
    prompt: 'The character performs a smooth, stylish 360-degree spin in place, showing off the outfit',
    icon: Icons.Spin
  },
  {
    id: 'dance_disco',
    name: 'Disco Point',
    description: 'Classic retro disco move.',
    prompt: 'The character performs a classic disco dance move, pointing one finger up diagonally',
    icon: Icons.Dance
  },
  {
    id: 'moonwalk',
    name: 'Moonwalk',
    description: 'The iconic gliding backslide.',
    prompt: 'The character performs the moonwalk dance move, gliding backwards smoothly',
    icon: Icons.Moonwalk
  },
  {
    id: 'bow',
    name: 'Gentle Bow',
    description: 'A polite and formal bow.',
    prompt: 'The character performs a polite and elegant bow to the audience',
    icon: Icons.Bow
  },
  {
    id: 'dab',
    name: 'The Dab',
    description: 'A confident celebration pose.',
    prompt: 'The character performs a perfect dab dance move',
    icon: Icons.Dab
  }
];

const PROCESSING_STAGES = [
  { label: "Initializing Veo 3.1", duration: 2000 },
  { label: "Analyzing Character Pose", duration: 4000 },
  { label: "Rigging 3D Skeleton", duration: 5000 },
  { label: "Applying Physics & Dynamics", duration: 6000 },
  { label: "Rendering High-Fidelity Frames", duration: 10000 },
  { label: "Finalizing Output", duration: 3000 }
];

export const StudioMode: React.FC<StudioModeProps> = ({ imageSrc, onBack, onReset }) => {
  const [selectedMove, setSelectedMove] = useState<MoveOption | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true); // Optimistic default
  const [showModal, setShowModal] = useState(false);
  
  // Progress/Stage tracking
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStageIndex(0);
      return;
    }

    // Timer loop to advance stages visually (simulated progress)
    let timeout: ReturnType<typeof setTimeout>;
    const runStage = (index: number) => {
      if (index >= PROCESSING_STAGES.length - 1) return; // Stay on last stage until actual completion
      
      timeout = setTimeout(() => {
        setCurrentStageIndex(index + 1);
        runStage(index + 1);
      }, PROCESSING_STAGES[index].duration);
    };

    runStage(0);

    return () => clearTimeout(timeout);
  }, [isGenerating]);

  // Check API Key
  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Assume success after dialog interaction to avoid race conditions
      setHasApiKey(true);
    }
  };

  const handleGenerate = async (move: MoveOption) => {
    if (!hasApiKey) {
      await handleSelectKey();
      return; 
    }

    setSelectedMove(move);
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setShowModal(false);
    setCurrentStageIndex(0);

    try {
      const url = await generateVideo(imageSrc, move.prompt);
      setVideoUrl(url);
      setShowModal(true); // Auto-open modal on success
    } catch (err: any) {
      console.error("Video Generation Error:", err);
      setError(err.message || "Failed to generate video");
      // Check if it was a permissions error (generic catch)
      if (err.message?.includes("403") || err.message?.includes("not found")) {
         setHasApiKey(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      
      {/* Visual Display Area (Left) */}
      <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden relative flex items-center justify-center group shadow-2xl">
        
        {/* Static Image (Source) */}
        {!videoUrl && !isGenerating && (
          <img 
            src={imageSrc} 
            alt="Character" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        )}

        {/* Video Preview (When generated but modal closed) */}
        {videoUrl && !isGenerating && (
            <div className="relative w-full h-full group">
                <video 
                    src={videoUrl} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                />
                <button 
                    onClick={() => setShowModal(true)}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <div className="bg-slate-900/80 p-4 rounded-full backdrop-blur-md border border-slate-600 shadow-2xl transform group-hover:scale-110 transition-transform">
                        <Maximize2 className="w-8 h-8 text-teal-400" />
                    </div>
                    <span className="mt-4 font-bold text-white tracking-widest text-sm bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm">WATCH PERFORMANCE</span>
                </button>
            </div>
        )}

        {/* Enhanced Loading State */}
        {isGenerating && (
          <div className="absolute inset-0 bg-slate-900 z-20 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                 <div className="relative">
                   <div className="absolute inset-0 bg-teal-500 blur-lg opacity-40 animate-pulse"></div>
                   <Film className="w-8 h-8 text-teal-400 relative z-10 animate-spin-slow" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white">Veo Studio</h3>
                   <p className="text-xs text-teal-300 font-mono">Process ID: {Math.floor(Math.random() * 999999)}</p>
                 </div>
                 <div className="ml-auto flex items-center gap-1 bg-slate-900 px-2 py-1 rounded text-xs font-mono text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="animate-pulse">PROCESSING</span>
                 </div>
              </div>

              {/* Steps Progress */}
              <div className="space-y-3">
                {PROCESSING_STAGES.map((stage, index) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const isPending = index > currentStageIndex;

                  return (
                    <div key={index} className={`flex items-center gap-3 text-sm transition-all duration-300 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                      <div className="shrink-0">
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-teal-500" />}
                        {isCurrent && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
                        {isPending && <Circle className="w-5 h-5 text-slate-600" />}
                      </div>
                      <span className={`${isCurrent ? 'text-white font-medium' : 'text-slate-400'}`}>
                        {stage.label}
                      </span>
                      {isCurrent && <span className="ml-auto text-xs text-indigo-400 animate-pulse">...</span>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                 <p className="text-xs text-slate-500">
                    Generating video with Veo 3.1. This may take up to 30-60 seconds.
                 </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Area (Right) */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-800">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <Sparkles className="text-teal-400" />
             Studio Actions
           </h2>
           <p className="text-slate-400 text-sm mt-1">
             Select a move to animate your character using generative video.
           </p>

           {!hasApiKey && (
             <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/50 rounded-lg text-amber-200 text-xs flex gap-2 items-start">
               <Key className="w-4 h-4 shrink-0 mt-0.5" />
               <div>
                 <p className="font-bold">API Key Required</p>
                 <p className="mt-1">Veo generation requires a paid plan API key.</p>
                 <button onClick={handleSelectKey} className="text-amber-400 underline mt-1 hover:text-white">
                    Select Key
                 </button>
               </div>
             </div>
           )}

           {error && (
             <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-xs flex gap-2 items-start animate-fade-in">
               <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
               <p>{error}</p>
             </div>
           )}
        </div>

        {/* Moves Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
           <div className="grid grid-cols-1 gap-3">
             {MOVES.map((move) => (
               <button
                 key={move.id}
                 onClick={() => handleGenerate(move)}
                 disabled={isGenerating}
                 className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left
                    ${selectedMove?.id === move.id 
                      ? 'bg-teal-500/10 border-teal-500/50' 
                      : 'bg-slate-750 border-slate-700 hover:border-slate-600 hover:bg-slate-700'
                    }
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                 `}
               >
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
                    ${selectedMove?.id === move.id ? 'bg-teal-500 text-white' : 'bg-slate-800 text-teal-400 group-hover:bg-slate-900'}
                 `}>
                    <move.icon className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className={`font-bold transition-colors ${selectedMove?.id === move.id ? 'text-teal-400' : 'text-white'}`}>
                     {move.name}
                   </h3>
                   <p className="text-xs text-slate-400 mt-0.5">{move.description}</p>
                 </div>
                 
                 {selectedMove?.id === move.id && isGenerating && (
                   <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
                   </div>
                 )}
               </button>
             ))}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-700 flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1" disabled={isGenerating}>
             <ChevronLeft className="w-4 h-4 mr-2" /> Back to Edit
          </Button>
          <Button onClick={onReset} variant="ghost" className="px-3" disabled={isGenerating}>
             <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

      </div>

      {/* Video Player Modal */}
      {showModal && videoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedMove?.icon && <selectedMove.icon className="w-5 h-5 text-teal-400" />}
                    {selectedMove?.name || 'Performance'}
                 </h3>
                 <button 
                   onClick={() => setShowModal(false)} 
                   className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>
              
              {/* Modal Body: Video */}
              <div className="flex-1 bg-black relative flex items-center justify-center p-0">
                 <video 
                   src={videoUrl}
                   className="w-full h-auto max-h-[70vh] object-contain"
                   autoPlay
                   loop
                   muted
                   controls // Allow user to unmute and scrub
                   playsInline
                 />
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
                  <a 
                    href={videoUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                     <Download className="w-4 h-4" /> Download Video
                  </a>
                  <Button onClick={() => setShowModal(false)} variant="secondary">
                     Close Player
                  </Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};