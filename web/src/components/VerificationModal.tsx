'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { Todo } from '../types/todo';
import { verifyTaskOnBlockchain, computeTaskHash } from '../services/blockchain';
import { verifyTaskCompletion } from '../services/api';
import { useWallet } from '../contexts/WalletContext';

interface VerificationModalProps {
  task: Todo;
  onClose: () => void;
  onVerified: (updatedTask: Todo) => void;
}

export default function VerificationModal({ task, onClose, onVerified }: VerificationModalProps) {
  const { address } = useWallet();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionLink, setTransactionLink] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      // Get the provider and signer
      if (!window.ethereum) {
        throw new Error('No Ethereum provider detected. Please install MetaMask.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Make sure we have the task hash, compute it if needed
      let hash = task.taskHash;
      if (!hash) {
        // Ensure address is included when computing the hash
        const taskWithAddress = {
          ...task,
          userAddress: address || ''
        };
        hash = computeTaskHash(taskWithAddress);
      }

      // Send transaction to verify task on blockchain
      const { txHash } = await verifyTaskOnBlockchain(hash, signer);

      // Set transaction link for user to view on explorer
      // Using Sepolia testnet explorer
      setTransactionLink(`https://sepolia.etherscan.io/tx/${txHash}`);

      // Update the backend with verification details
      const verifiedTask = await verifyTaskCompletion(task.id, hash, txHash);

      // Pass the updated task back to the parent
      onVerified(verifiedTask);
    } catch (err) {
      console.error('Error verifying task on blockchain:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify task on blockchain');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 p-4">
      <div className="bg-dark-800 rounded-lg shadow-lg w-full max-w-md border border-dark-600">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Verify Task Completion</h3>
          
          <p className="text-gray-300 mb-4">
            Do you want to verify the completion of this task on the blockchain?
          </p>
          
          <div className="bg-dark-700 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-white mb-1">{task.content}</h4>
            {task.description && (
              <p className="text-gray-400 text-sm mb-2">{task.description}</p>
            )}
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-2">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              {task.dueDate && (
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          {transactionLink && (
            <div className="bg-green-900/20 border border-green-800 text-green-400 px-4 py-2 rounded-lg mb-4 text-sm">
              <p className="mb-2">Transaction submitted successfully!</p>
              <a 
                href={transactionLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent-400 hover:underline break-all"
              >
                View on Etherscan
              </a>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isVerifying}
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              className="btn-primary"
              disabled={isVerifying || !!transactionLink}
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : transactionLink ? 'Verified' : 'Verify on Blockchain'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 