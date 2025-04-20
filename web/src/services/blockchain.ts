import { ethers } from 'ethers';
import TaskContractAbi from '../configs/abi/taskContractAbi.json';

// Define the TaskStatus interface
export interface TaskStatus {
  exists: boolean;
  completed: boolean;
  hash: string;
  timestamp: number;
}

// Get contract address from environment variables
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xcD177D4704A85879D5E8Fc78a6981246Ce10f830';

export const computeTaskHash = (task: { 
  content: string;
  description?: string;
  createdAt?: string;
  userAddress?: string;
}): string => {
  // Ensure we have all necessary data
  if (!task || !task.content) {
    throw new Error('Task data is incomplete');
  }
  
  // Create a consistent string representation of the task
  const hashData = `${task.content}${task.description || ''}${task.createdAt || new Date().toISOString()}${task.userAddress || ''}`;
  
  // The contract expects a string type for the hash, not bytes32
  // We'll return the hash as a hex string for simplicity and readability
  return ethers.keccak256(ethers.toUtf8Bytes(hashData));
};

// Task Registration - Add a task to the blockchain
export const addTask = async (
  taskHash: string,
): Promise<{ txHash: string}> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Ethereum provider not available');
    }

    // Get provider and signer properly
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, TaskContractAbi, signer);
    
    // Send transaction to add the task
    const tx = await contract.addTask(taskHash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error adding task to blockchain:', error);
    throw error;
  }
};

// Verify task hash against what's stored on blockchain
export const verifyTaskHash = async (
  taskId: string,
  providedHash: string,
  provider: ethers.BrowserProvider
): Promise<boolean> => {
  try {
    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, TaskContractAbi, provider);
    
    // Get the task details
    const taskStatus = await contract.getTaskStatus(taskId);
    
    // Check if task exists and hash matches
    return taskStatus.exists && taskStatus.hash === providedHash;
  } catch (error) {
    console.error('Error verifying task hash:', error);
    return false;
  }
};

// Verify and update task on blockchain
export const verifyTaskOnBlockchain = async (
  taskHash: string,
  signer: ethers.JsonRpcSigner
): Promise<{ txHash: string }> => {
  try {
    // Create the contract with minimal interface
    const contract = new ethers.Contract(contractAddress, TaskContractAbi, signer);
    
    // Call the contract function with actual parameters
    const tx = await contract.verifyTask(taskHash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Return the hash
    return { txHash: receipt.hash };
  } catch (error) {
    console.error('Blockchain error:', error);
    throw error;
  }
};

// Get task details from blockchain
export const getTask = async (
  taskId: string,
  provider: ethers.BrowserProvider
): Promise<TaskStatus | null> => {
  try {
    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, TaskContractAbi, provider);
    
    // Get task details
    const taskStatus = await contract.getTaskStatus(taskId);
    
    if (!taskStatus.exists) {
      return null;
    }
    
    return {
      exists: taskStatus.exists,
      completed: taskStatus.completed,
      hash: taskStatus.hash,
      timestamp: Number(taskStatus.timestamp)
    };
  } catch (error) {
    console.error('Error getting task details:', error);
    return null;
  }
};

// Get all tasks for a user
export const getUserTasks = async (
  userAddress: string,
  provider: ethers.BrowserProvider
): Promise<string[]> => {
  try {
    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, TaskContractAbi, provider);
    
    // Get user tasks if the contract has a method for it
    try {
      const tasks = await contract.getUserTasks(userAddress);
      return tasks;
    } catch (error) {
      console.warn('getUserTasks method not available in contract:', error);
      return [];
    }
  } catch (error) {
    console.error('Error getting user tasks:', error);
    return [];
  }
};

// Get task count for a user
export const getTaskCount = async (
  address: string,
  provider: ethers.BrowserProvider
): Promise<number> => {
  try {
    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, TaskContractAbi, provider);
    
    try {
      // Try to call the contract to get the task count directly
      const count = await contract.getUserTaskCount(address);
      return Number(count);
    } catch (methodError) {
      console.warn('getUserTaskCount method not available in contract, falling back to getUserTasks');
      
      // Fallback to getting all tasks and counting them
      try {
        const tasks = await contract.getUserTasks(address);
        return tasks ? tasks.length : 0;
      } catch (fallbackError) {
        console.error('Error getting tasks for counting:', fallbackError);
        return 0;
      }
    }
  } catch (error) {
    console.error('Error getting task count:', error);
    return 0;
  }
};

// Check if a task is verified on the blockchain
export const isTaskVerified = async (
  taskId: string,
  provider: ethers.BrowserProvider
): Promise<boolean> => {
  try {
    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, TaskContractAbi, provider);
    
    // Call the contract to get task status
    const taskStatus = await contract.getTaskStatus(taskId);
    
    return taskStatus.exists && taskStatus.completed;
  } catch (error) {
    console.error('Error checking if task is verified:', error);
    return false;
  }
}; 