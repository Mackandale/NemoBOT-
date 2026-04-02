import React from 'react';
import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageModal = ({ 
  isOpen, 
  imageUrl, 
  onClose 
}: ImageModalProps) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `nemo-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full flex flex-col items-center gap-6" onClick={e => e.stopPropagation()}>
        <img 
          src={imageUrl} 
          alt="Full screen" 
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-foreground/10" 
          referrerPolicy="no-referrer"
        />
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-full font-bold uppercase tracking-widest text-xs transition-all border border-foreground/10"
          >
            <X className="w-4 h-4" />
            Fermer
          </button>
        </div>
      </div>
    </motion.div>
  );
};
