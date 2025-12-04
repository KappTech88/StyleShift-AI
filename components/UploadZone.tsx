import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (base64: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageSelected(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`relative w-full max-w-xl mx-auto border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group
        ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-400 hover:bg-slate-800/50'}
      `}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept="image/*"
      />
      
      <div className="bg-slate-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-xl">
        <Upload className="w-8 h-8 text-indigo-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">Upload your photo</h3>
      <p className="text-slate-400 mb-6 max-w-xs">
        Drag & drop or click to browse. We recommend high-quality lighting for best results.
      </p>

      <div className="flex gap-4 text-xs text-slate-500 uppercase tracking-wider font-semibold">
        <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> JPG</span>
        <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> PNG</span>
        <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> WEBP</span>
      </div>
    </div>
  );
};