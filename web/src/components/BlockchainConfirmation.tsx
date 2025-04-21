'use client';

import { motion } from 'framer-motion';

interface BlockchainConfirmationProps {
  message?: string;
}

export default function BlockchainConfirmation({ 
  message = 'Confirming on Blockchain...'
}: BlockchainConfirmationProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <motion.div 
          className="w-14 h-14 border-4 border-t-transparent border-b-transparent border-purple-500/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 rounded-full opacity-80 blur-[1px]"></div>
        </div>
      </div>
      <p className="mt-4 text-xl font-medium text-white">{message}</p>
    </motion.div>
  );
} 