'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface LogoIconProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function LogoIcon({ size = 40, className = '', animate = false }: LogoIconProps) {
  if (animate) {
    return (
      <motion.div
        className={`relative ${className}`}
        style={{ width: size, height: size }}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Image 
          src="/logo.svg" 
          alt="Momentum Logo" 
          width={size} 
          height={size}
          priority
        />
      </motion.div>
    );
  }
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image 
        src="/logo.svg" 
        alt="Momentum Logo" 
        width={size} 
        height={size}
        priority
      />
    </div>
  );
} 