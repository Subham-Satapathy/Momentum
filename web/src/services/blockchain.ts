import { ethers } from 'ethers';
import TaskContractAbi from '../configs/abi/taskContractAbi.json';

export interface TaskStatus {
  exists: boolean;
  completed: boolean;
  hash: string;
  timestamp: number;
}

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xD8Ba451841D4BbA7eB8432Ca8105Fd2BB0824354';

export const computeTaskHash = (task: { 
  content: string;
  description?: string;
  createdAt?: string;
  userAddress?: string;
}): string => {

  if (!task || !task.content) {
    throw new Error('Task data is incomplete');
  }

  const hashData = `${task.content}${task.description || ''}${task.createdAt || new Date().toISOString()}${task.userAddress || ''}`;

  return ethers.keccak256(ethers.toUtf8Bytes(hashData));
};

export const addTask = async (
  taskHash: string,
): Promise<{ txHash: string}> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Ethereum provider not available');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, TaskContractAbi, signer);

    const tx = await contract.createTask(taskHash);

    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error adding task to blockchain:', error);
    throw error;
  }
};

export const completeTask = async (
  taskHash: string,
): Promise<{ txHash: string }> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Ethereum provider not available');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, TaskContractAbi, signer);

    const tx = await contract.completeTask(taskHash);

    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  } catch (error) {
    console.error('Blockchain error:', error);
    throw error;
  }
};