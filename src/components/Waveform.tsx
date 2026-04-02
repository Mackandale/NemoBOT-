import React from 'react';
import { motion } from 'motion/react';

interface WaveformProps {
  active: boolean;
}

export const Waveform: React.FC<WaveformProps> = ({ active }) => {
  return (
    <div className="flex items-center justify-center h-12 gap-1">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: active ? [10, Math.random() * 40 + 10, 10] : 4
          }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            delay: i * 0.05
          }}
          className="waveform-bar"
        />
      ))}
    </div>
  );
};
