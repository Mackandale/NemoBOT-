import React from 'react';
import { motion } from 'motion/react';

export const TypingIndicator = () => (
  <div className="flex gap-1 px-4 py-3 bg-white/5 rounded-2xl w-fit border border-white/5">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        className="w-1.5 h-1.5 bg-violet-400 rounded-full"
      />
    ))}
  </div>
);
