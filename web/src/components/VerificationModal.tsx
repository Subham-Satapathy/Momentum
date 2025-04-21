'use client';

import { useState, useEffect } from 'react';
import { Todo } from '../types/todo';
import { completeTask } from '../services/blockchain';
import { updateTask } from '../services/api';

interface VerificationModalProps {
  task: Todo;
  onClose: () => void;
  onVerified: (updatedTask: Todo) => void;
}

export default function VerificationModal({ task, onClose, onVerified }: VerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {

    const timer = setTimeout(() => setAnimateIn(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);

    try {

      if (!task.taskHash) {
        throw new Error('Task hash is missing. Cannot verify task.');
      }

      const result = await completeTask(task.taskHash);

      await updateTask(task.id, { verified: true, txHash: result.txHash });

      const verifiedTask: Todo = {
        ...task,
        verified: true,
        txHash: result.txHash
      };

      onVerified(verifiedTask);

      onClose();
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

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out ${
        animateIn ? 'backdrop-blur-md bg-black/70' : 'backdrop-blur-none bg-black/0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-md transform transition-all duration-300 ease-out ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="absolute -left-16 -top-16 w-32 h-32 bg-purple-600/30 rounded-full blur-xl"></div>
        <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute right-20 top-0 w-16 h-16 bg-pink-500/20 rounded-full blur-lg"></div>
        
        {}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {}
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500"></div>
          
          <div className="p-7">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Verify Task</span>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors duration-200"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Do you want to verify the completion of this task on the blockchain?
              </p>
              
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-1">{task.content}</h4>
                <p className="text-gray-400 text-sm mb-3">
                  This is an assignment given by cluster protocol
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-3">Created: {formatDate(task.createdAt)}</span>
                  {task.dueDate && (
                    <span>Due: {formatDate(task.dueDate)}</span>
                  )}
                </div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-white/10 hover:bg-white/10 text-white transition-colors"
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-colors"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Verify on Blockchain'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 