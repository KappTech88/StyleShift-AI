import React, { useState } from 'react';
import { Shirt, ChevronRight, AlertCircle, Wand2 } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { InventoryEditor } from './components/InventoryEditor';
import { editImageWithGemini } from './services/geminiService';
import { ProcessingState, SavedLook } from './types';

function App() {
  const [step, setStep] = useState<number>(1);
  const [image, setImage] = useState<string | null>(null);
  
  // History Management
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle' });
  
  // Persistent Wardrobe State
  const [savedItems, setSavedItems] = useState<SavedLook[]>(() => {
    try {
      const saved = localStorage.getItem('styleShift_wardrobe');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load wardrobe:", e);
      return [];
    }
  });

  const addToHistory = (newImage: string) => {
    // If we are in the middle of history and make a new change, discard future
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newImage);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleImageSelected = (base64: string) => {
    setImage(base64);
    setHistory([base64]);
    setHistoryIndex(0);
    setStep(2); // Goes directly to Studio now (previously step 3)
  };

  const handleGenerate = async (prompt: string, aspectRatio?: string) => {
    // Always use the current head of history as the source
    const sourceImage = history[historyIndex];
    if (!sourceImage) return;

    setProcessing({ status: 'processing' });
    try {
      const result = await editImageWithGemini(sourceImage, prompt, aspectRatio);
      addToHistory(result);
      setProcessing({ status: 'success' });
    } catch (error: any) {
      console.error(error);
      setProcessing({ status: 'error', message: error.message || 'Failed to generate image. Please try again.' });
    }
  };

  // Generates variations but DOES NOT apply them to history automatically
  // Returns the generated base64 strings
  const handleGenerateOptions = async (input: string | string[], aspectRatio?: string): Promise<string[]> => {
    const sourceImage = history[historyIndex];
    if (!sourceImage) return [];

    setProcessing({ status: 'processing' });
    
    // Determine prompts array
    const prompts = Array.isArray(input) ? input : [input, input];

    try {
      // Generate variations in parallel
      const promises = prompts.map(p => editImageWithGemini(sourceImage, p, aspectRatio));

      const results = await Promise.allSettled(promises);
      
      const successfulImages: string[] = [];
      results.forEach(res => {
        if (res.status === 'fulfilled') {
          successfulImages.push(res.value);
        }
      });

      if (successfulImages.length === 0) {
        throw new Error("Failed to generate any variations.");
      }

      setProcessing({ status: 'idle' }); // Reset processing so the Review Modal can be interactive
      return successfulImages;
    } catch (error: any) {
      console.error(error);
      setProcessing({ status: 'error', message: error.message || 'Failed to generate options. Please try again.' });
      return [];
    }
  };

  const handleSaveLook = (look: SavedLook) => {
    setSavedItems(prev => {
      const newItems = [look, ...prev];
      try {
        localStorage.setItem('styleShift_wardrobe', JSON.stringify(newItems));
      } catch (e) {
        console.error("LocalStorage quota exceeded or write error:", e);
        alert("Storage full! Item saved for this session only. Delete some old items to save space.");
      }
      return newItems;
    });
  };

  const handleDeleteLook = (lookId: string) => {
    setSavedItems(prev => {
      const newItems = prev.filter(item => item.id !== lookId);
      try {
        localStorage.setItem('styleShift_wardrobe', JSON.stringify(newItems));
      } catch (e) {
        console.error("LocalStorage write error:", e);
      }
      return newItems;
    });
  };

  const handleApplyLook = (imageSrc: string) => {
    addToHistory(imageSrc);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const resetApp = () => {
    setStep(1);
    setImage(null);
    setHistory([]);
    setHistoryIndex(-1);
    setProcessing({ status: 'idle' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              StyleShift AI
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400 hidden md:flex">
            <span className={`${step === 1 ? 'text-indigo-400' : ''}`}>Upload</span>
            <ChevronRight className="w-4 h-4" />
            <span className={`${step === 2 ? 'text-indigo-400' : ''} flex items-center gap-1`}>
              <Wand2 className="w-4 h-4" /> Studio
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {processing.status === 'error' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5" />
            {processing.message}
            <button onClick={() => setProcessing({status: 'idle'})} className="ml-auto hover:text-white">Dismiss</button>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Reinvent Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Style</span>
            </h1>
            <p className="text-lg text-slate-400 text-center max-w-2xl mb-12">
              Upload any photo—Headshot, Full Body, or Selfie—and transform it instantly.
            </p>
            <UploadZone onImageSelected={handleImageSelected} />
          </div>
        )}

        {step === 2 && history[historyIndex] && (
          <div className="animate-fade-in">
            <InventoryEditor
              imageSrc={history[historyIndex]}
              onGenerate={handleGenerate}
              onGenerateOptions={handleGenerateOptions}
              isProcessing={processing.status === 'processing'}
              onReset={resetApp}
              onComplete={() => {}}
              savedItems={savedItems}
              onSaveLook={handleSaveLook}
              onApplyLook={handleApplyLook}
              onDeleteLook={handleDeleteLook}
              onUndo={handleUndo}
              canUndo={historyIndex > 0}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;