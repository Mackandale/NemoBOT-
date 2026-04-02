import React from 'react';
import { motion } from 'framer-motion';
import { cn, triggerHaptic } from '../lib/utils';

interface ContextMenuItem {
  label: string;
  icon: any;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning';
}

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
  position: { x: number; y: number };
}

export const ContextMenu = ({ 
  isOpen, 
  onClose, 
  items 
}: ContextMenuProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-[280px] bg-[#1A1A1A] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-2 space-y-1">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                triggerHaptic('light');
                item.onClick();
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all active:scale-[0.98] text-sm font-medium",
                item.variant === 'danger' 
                  ? "text-red-400 hover:bg-red-500/10" 
                  : item.variant === 'warning'
                  ? "text-amber-400 hover:bg-amber-500/10"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
