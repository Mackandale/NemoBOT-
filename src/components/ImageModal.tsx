import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Maximize2 } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 flex items-center gap-4">
              <button 
                onClick={() => window.open(imageUrl, '_blank')}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
                title="Plein Écran"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button 
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
                title="Télécharger"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <img 
              src={imageUrl} 
              alt="Generated" 
              className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl shadow-violet-500/20"
              referrerPolicy="no-referrer"
            />

            <div className="flex items-center gap-6">
              <button className="flex items-center gap-3 px-8 py-4 bg-violet-500 hover:bg-violet-600 rounded-2xl text-white font-bold transition-all shadow-xl shadow-violet-500/20">
                <Share2 className="w-5 h-5" />
                Partager l'œuvre
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
