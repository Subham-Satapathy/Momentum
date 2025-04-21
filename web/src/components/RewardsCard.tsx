'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getTokenBalance } from '../services/tokenService';
import { getUserTokenBalance } from '../services/api';

interface RewardsCardProps {
  address: string | null;
}

export default function RewardsCard({ address }: RewardsCardProps) {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      try {
        const dbTokenBalance = await getUserTokenBalance();
        setBalance(dbTokenBalance.toString());
      } catch (dbError) {
        console.error('Error fetching token balance from database:', dbError);
      }
      
      const tokenBalance = await getTokenBalance(address);
      
      setBalance(prev => tokenBalance !== prev ? tokenBalance : prev);
    } catch (err) {
      console.error('Error fetching token balance:', err);
      setError('Could not load your rewards at this time');
      
      if (retryCount < 3) {
        const retryTimer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
        
        return () => clearTimeout(retryTimer);
      }
    } finally {
      setIsLoading(false);
    }
  }, [address, retryCount]);

  useEffect(() => {
    fetchBalance();
    
    const handleRefreshBalance = () => {
      fetchBalance();
    };
    
    window.addEventListener('refresh-token-balance', handleRefreshBalance);
    
    return () => {
      window.removeEventListener('refresh-token-balance', handleRefreshBalance);
    };
  }, [address, retryCount, fetchBalance]);

  const handleRetry = () => {
    setRetryCount(0);
    setIsLoading(true);
  };

  return (
    <motion.div
      className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">My Rewards</h3>
          <p className="text-gray-400 text-sm">Tokens earned for completed tasks</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
          <p className="mb-2">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-red-800/30 hover:bg-red-800/50 text-red-300 px-3 py-1 rounded-md text-xs transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <p className="text-gray-300">$MOM Tokens</p>
          
          <div className="mt-6 py-3 px-4 bg-white/5 rounded-xl border border-white/10">
            <h4 className="font-medium text-white mb-1">How to earn more?</h4>
            <p className="text-sm text-gray-400">Complete tasks and verify them on the blockchain to earn MOM tokens.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
} 