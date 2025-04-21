'use client';

import { useState, useEffect } from 'react';
import { Todo } from '../types/todo';
import { completeTask } from '../services/blockchain';
import { updateTask, updateUserTokenBalance } from '../services/api';
import { rewardUserServerSide, REWARD_AMOUNTS } from '../services/tokenService';
import { useWallet } from '../contexts/WalletContext';
import BlockchainConfirmation from './BlockchainConfirmation';

interface VerificationModalProps {
  isOpen: boolean;
  todo: Todo;
  onClose: () => void;
  onVerified: (updatedTask: Todo) => void;
}

export default function VerificationModal({ isOpen, todo, onClose, onVerified }: VerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [tokenReward, setTokenReward] = useState<number | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'initial' | 'verified' | 'rewarded'>('initial');
  const { address: walletAddress } = useWallet();
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      setVerificationStatus('initial');
    }
  }, [isOpen]);

  const handleClose = () => {
    if (verificationStatus === 'rewarded') {
      window.dispatchEvent(new CustomEvent('refresh-token-balance'));
    }
    onClose();
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      if (!todo.taskHash) {
        throw new Error('Task hash is missing. Cannot verify task.');
      }

      const result = await completeTask(todo.taskHash);
      
      const partialVerifiedTask: Todo = {
        ...todo,
        verified: true,
        txHash: result.txHash,
        status: todo.status || 'completed'
      };
      
      onVerified(partialVerifiedTask);
      
      setVerificationStatus('verified');
      
      await updateTask(todo.id, { 
        verified: true, 
        txHash: result.txHash,
        status: todo.status
      });

      let rewardTxHash = '';
      
      const addressToReward = todo.userAddress || walletAddress;
      
      if (!addressToReward) {
        console.warn('User address is missing and no wallet connected, cannot reward tokens');
      } else {
        const taskTypeKey = (todo.taskType || 'other') as keyof typeof REWARD_AMOUNTS;
        const priorityKey = (todo.priority || 'medium') as keyof typeof REWARD_AMOUNTS[keyof typeof REWARD_AMOUNTS];
        const rewardAmount = REWARD_AMOUNTS[taskTypeKey]?.[priorityKey] || 5;
        
        const rewardResult = await rewardUserServerSide(
          addressToReward,
          todo.taskType || 'other',
          todo.priority || 'medium'
        );
        rewardTxHash = rewardResult.txHash;
        
        window.dispatchEvent(new CustomEvent('refresh-token-balance'));
        
        await updateUserTokenBalance(rewardAmount);
        
        setTokenReward(rewardAmount);
        
        setVerificationStatus('rewarded');
        
        const completeVerifiedTask: Todo = {
          ...partialVerifiedTask,
          rewardTxHash: rewardTxHash
        };
        
        onVerified(completeVerifiedTask);
        
        await updateTask(todo.id, {
          rewardTxHash: rewardTxHash,
          userAddress: todo.userAddress || walletAddress || undefined
        });
      }

    } catch (err) {
      console.error('Error verifying task on blockchain:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify task on blockchain');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out ${
        animateIn ? 'backdrop-blur-md bg-black/70' : 'backdrop-blur-none bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-md transform transition-all duration-300 ease-out ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -left-16 -top-16 w-32 h-32 bg-purple-600/30 rounded-full blur-xl"></div>
        <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute right-20 top-0 w-16 h-16 bg-pink-500/20 rounded-full blur-lg"></div>
        
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500"></div>
          
          <div className="p-4 sm:p-7">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Verify Task</span>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </h3>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors duration-200"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {tokenReward !== null ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Task Verified!</h3>
                <p className="text-gray-300 text-center mb-2">
                  You earned <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">{tokenReward} MOM</span> tokens as reward
                </p>
                <p className="text-gray-400 text-xs text-center mb-6">Rewards have been added to your balance</p>
                
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            ) : verificationStatus === 'verified' ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Task Verified!</h3>
                <p className="text-gray-300 text-center mb-2">Processing your reward...</p>
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : isVerifying ? (
              <BlockchainConfirmation message="Verifying on Blockchain..." />
            ) : (
              <>
                <div className="mb-4 sm:mb-6">
                  <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">
                    Do you want to verify the completion of this task on the blockchain?
                  </p>
                  
                  <div className="bg-white/5 p-3 sm:p-4 rounded-lg border border-white/10">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-1">{todo.content}</h4>
                    <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
                      {todo.description || "No description provided"}
                    </p>
                    <div className="flex flex-wrap items-center text-xs text-gray-500">
                      <span className="mr-3 mb-1">Created: {formatDate(todo.createdAt)}</span>
                      {todo.dueDate && (
                        <span className="mb-1">Due: {formatDate(todo.dueDate)}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-900/20 border border-red-800 text-red-400 px-3 sm:px-4 py-2 rounded-lg mb-4 text-xs sm:text-sm">
                    {error}
                  </div>
                )}
                
                <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm transition-colors"
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Task'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}