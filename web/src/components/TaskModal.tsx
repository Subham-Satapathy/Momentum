'use client';

import { Todo } from '../types/todo';
import TodoForm from './TodoForm';
import { useEffect, useState } from 'react';
import BlockchainConfirmation from './BlockchainConfirmation';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTodo: (todo: Todo) => void;
}

export default function TaskModal({ isOpen, onClose, onAddTodo }: TaskModalProps) {
  const [animateIn, setAnimateIn] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddTodo = (todo: Todo) => {
    setIsConfirming(true);
    setTimeout(() => {
      onAddTodo(todo);
      setIsConfirming(false);
      onClose();
    }, 1500);
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4 transition-all duration-300 ease-in-out ${
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
        <div className="absolute -left-16 -top-16 w-32 h-32 bg-purple-600/30 rounded-full blur-xl"></div>
        <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute right-20 top-0 w-16 h-16 bg-pink-500/20 rounded-full blur-lg"></div>
        
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500"></div>
          
          <div className="p-4 sm:p-7">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">New Task</span>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </span>
              </h3>
              {!isConfirming && (
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            
            {isConfirming ? (
              <BlockchainConfirmation />
            ) : (
              <TodoForm onAddTodo={handleAddTodo} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 