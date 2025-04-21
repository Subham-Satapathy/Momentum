'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLandingPage) {
    return null;
  }

  const handleAddTodo = () => {
    setIsTaskModalOpen(false);
    window.location.reload();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="group flex items-center relative z-20">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-30 blur-md group-hover:opacity-40 transition duration-200"></div>
              <div className="relative">
                <LogoIcon size={32} animate className="mr-2" />
              </div>
              <span className="relative font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                Momentum
              </span>
            </Link>
            
            <button 
              className="md:hidden z-20 p-2 rounded-md text-gray-200 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            
            <nav className="hidden md:flex items-center space-x-4">
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
        
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className="fixed inset-0 z-10 md:hidden bg-gray-900/95 backdrop-blur-lg pt-20 px-4 pb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/dashboard" 
                  className={`relative px-4 py-3 text-base transition-all duration-200 rounded-xl ${
                    pathname === '/dashboard' 
                      ? 'text-white font-medium bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 shadow-lg shadow-purple-900/10' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="relative z-10">Dashboard</span>
                </Link>
                
                {isConnected && (
                  <>
                    <motion.button
                      onClick={() => {
                        setIsTaskModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 rounded-xl text-base font-medium flex items-center justify-center shadow-lg shadow-purple-600/20 hover:shadow-xl transition-all duration-200"
                      whileTap={{ scale: 0.97 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      New Task
                    </motion.button>
                    
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 py-3 px-4 rounded-xl shadow-lg flex items-center justify-center">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-2 relative">
                          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-70" style={{ animationDuration: '2s' }}></div>
                        </div>
                        <span className="text-gray-100 font-mono text-sm">{formatAddress(address!)}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={disconnect}
                      className="text-base text-gray-300 hover:text-white px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 transition-all duration-200 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Disconnect Wallet
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAddTodo={handleAddTodo}
      />
    </>
  );
} 