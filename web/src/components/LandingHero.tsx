'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import WalletConnect from './WalletConnect';
import LogoIcon from './LogoIcon';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 100 
    }
  }
};

const featureCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function LandingHero() {
  const router = useRouter();
  const { isConnected } = useWallet();

  useEffect(() => {
    if (isConnected) {
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500 rounded-full filter blur-[120px] opacity-20"></div>
        <div className="absolute bottom-40 right-10 w-72 h-72 bg-blue-500 rounded-full filter blur-[120px] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full filter blur-[140px] opacity-20"></div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto text-center z-10 relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="mb-8 sm:mb-12"
          variants={itemVariants}
        >
          <div className="flex justify-center mb-4 sm:mb-6">
            <LogoIcon size={100} animate />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 px-2">
            Momentum
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light px-4">
            A blockchain-powered task management platform with AI assistance for maximum productivity
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 px-2"
          variants={itemVariants}
        >
          <motion.div 
            className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl px-5 sm:px-8 py-4 sm:py-5 text-center shadow-xl"
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.1)" }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200 mb-1">100%</div>
            <div className="text-xs sm:text-sm text-gray-300">Decentralized</div>
          </motion.div>
          
          <motion.div 
            className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl px-5 sm:px-8 py-4 sm:py-5 text-center shadow-xl"
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.1)" }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 mb-1">AI</div>
            <div className="text-xs sm:text-sm text-gray-300">Powered</div>
          </motion.div>
          
          <motion.div 
            className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl px-5 sm:px-8 py-4 sm:py-5 text-center shadow-xl"
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(168, 85, 247, 0.1)" }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-200 mb-1">Smart</div>
            <div className="text-xs sm:text-sm text-gray-300">Assistance</div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-12 sm:mb-16 px-4">
          <WalletConnect />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.7
              }
            }
          }}
        >
          <motion.div 
            className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group"
            variants={featureCardVariants}
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="text-pink-400 mb-3 sm:mb-4 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 sm:h-10 w-8 sm:w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">Secure & Verified</h3>
            <p className="text-gray-300 text-sm leading-relaxed">All task completions are verified and stored securely on the blockchain</p>
          </motion.div>
          
          <motion.div 
            className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group"
            variants={featureCardVariants}
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="text-blue-400 mb-3 sm:mb-4 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 sm:h-10 w-8 sm:w-10" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">Personal AI Assistant</h3>
            <p className="text-gray-300 text-sm leading-relaxed">Get intelligent task recommendations and reminders from your personal AI</p>
          </motion.div>
          
          <motion.div 
            className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group sm:col-span-2 md:col-span-1"
            variants={featureCardVariants}
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="text-purple-400 mb-3 sm:mb-4 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 sm:h-10 w-8 sm:w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">Reward System</h3>
            <p className="text-gray-300 text-sm leading-relaxed">Earn $MOM tokens by completing tasks and build your productivity streak</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
} 