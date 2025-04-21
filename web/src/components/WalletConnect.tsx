'use client';

import { useWallet } from '../contexts/WalletContext';
import { motion } from 'framer-motion';

export default function WalletConnect() {
  const { isConnected, address, isConnecting, connect, disconnect, error } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="flex flex-col items-center">
      {!isConnected ? (
        <motion.button
          onClick={connect}
          disabled={isConnecting}
          className="btn-primary py-3 px-6 min-w-[200px] shadow-lg hover:shadow-accent-500/20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isConnecting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </div>
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Connect Wallet
            </div>
          )}
        </motion.button>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <motion.div 
            className="bg-dark-700 py-2 px-4 rounded-lg flex items-center border border-dark-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-white">{formatAddress(address!)}</span>
          </motion.div>
          
          <motion.button
            onClick={disconnect}
            className="text-sm text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Disconnect
          </motion.button>
        </div>
      )}

      {error && (
        <motion.div 
          className="mt-4 text-red-400 text-sm max-w-md text-center p-2 bg-red-500/10 border border-red-500/20 rounded-md"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error.message}
        </motion.div>
      )}
    </div>
  );
} 