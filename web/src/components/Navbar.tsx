'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import LogoIcon from './LogoIcon';
import TaskModal from './TaskModal';

export default function Navbar() {
  const { isConnected, address, disconnect } = useWallet();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  
  const isLandingPage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  if (isLandingPage) {
    return null;
  }

  const handleAddTodo = () => {

    setIsTaskModalOpen(false);
    window.location.reload(); // Temporary solution to refresh the page to show new task
  };

  return (
    <>
      <motion.header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'backdrop-blur-xl bg-gradient-to-r from-gray-900/90 via-purple-900/80 to-gray-900/90 shadow-lg' 
            : 'backdrop-blur-md bg-gradient-to-r from-gray-900/70 via-purple-900/60 to-gray-900/70'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="group flex items-center relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-30 blur-md group-hover:opacity-40 transition duration-200"></div>
              <div className="relative">
                <LogoIcon size={32} animate className="mr-2" />
              </div>
              <span className="relative font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                Momentum
              </span>
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className={`relative px-4 py-2 text-sm transition-all duration-200 rounded-xl ${
                  pathname === '/dashboard' 
                    ? 'text-white font-medium bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 shadow-lg shadow-purple-900/10' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="relative z-10">Dashboard</span>
              </Link>
              
              {isConnected && (
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center shadow-lg shadow-purple-600/20 hover:shadow-xl transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Task
                  </motion.button>
                  
                  <motion.div 
                    className="backdrop-blur-md bg-white/5 border border-white/10 py-2 px-4 rounded-xl shadow-lg flex items-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-400 mr-2 relative">
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-70" style={{ animationDuration: '2s' }}></div>
                      </div>
                      <span className="text-gray-100 font-mono text-sm">{formatAddress(address!)}</span>
                    </div>
                  </motion.div>
                  
                  <motion.button 
                    onClick={disconnect}
                    className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Disconnect
                  </motion.button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </motion.header>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAddTodo={handleAddTodo}
      />
    </>
  );
} 