import { ethers } from 'ethers';
import MOMTokenAbi from '../configs/abi/momTokenContractAbi.json';
import dotenv from 'dotenv';
import { updateUserTokenBalance } from './api';

dotenv.config();

const tokenContractAddress = process.env.NEXT_PUBLIC_MOM_TOKEN_ADDRESS;

export interface RewardAmount {
  low: number;
  medium: number;
  high: number;
}

export interface RewardByType {
  personal: RewardAmount;
  work: RewardAmount;
  study: RewardAmount;
  other: RewardAmount;
}

export const REWARD_AMOUNTS: RewardByType = {
  personal: {
    low: 5,
    medium: 10,
    high: 15
  },
  work: {
    low: 10,
    medium: 20,
    high: 30
  },
  study: {
    low: 8,
    medium: 15,
    high: 25
  },
  other: {
    low: 5,
    medium: 10,
    high: 15
  }
};

/**
 * Gets the current ethereum provider safely
 * @returns Provider or null if not available
 */
const getProvider = async () => {
  if (typeof window === 'undefined') return null;
  
  try {
    if (!('ethereum' in window) || !window.ethereum) {
      return null;
    }
    
    if (!window.ethereum.request) {
      return null;
    }
    
    return new ethers.BrowserProvider(window.ethereum);
  } catch (error) {
    return null;
  }
};

/**
 * Rewards a user with MOM tokens
 * @param address - User's wallet address
 * @param taskType - Type of the task
 * @param priority - Priority of the task
 * @returns Transaction hash
 */
export const rewardUser = async (
  address: string,
  taskType: string,
  priority: string,
): Promise<{ txHash: string }> => {
  try {
    const provider = await getProvider();
    if (!provider) {
      throw new Error('Ethereum provider not available');
    }
    
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    
    const contract = new ethers.Contract(tokenContractAddress as string, MOMTokenAbi, signer);

    const taskTypeKey = taskType as keyof RewardByType;
    const priorityKey = priority as keyof RewardAmount;
    
    const rewardAmount = REWARD_AMOUNTS[taskTypeKey]?.[priorityKey] || 5;
    
    const tokenAmount = ethers.parseUnits(rewardAmount.toString(), 18);

    try {
      let isOwner = false;
      try {
        const owner = await contract.owner();
        isOwner = owner.toLowerCase() === signerAddress.toLowerCase();
      } catch {
        console.log('Could not determine owner, will try public reward method');
      }
      
      let tx;
      if (isOwner) {
        tx = await contract.rewardTo(address, tokenAmount);
      } else {
        tx = await contract.publicRewardTo(address, tokenAmount);
      }
      
      const receipt = await tx.wait();

      return { txHash: receipt.hash };
    } catch (error) {
      throw new Error(`Token contract error: ${(error as Error).message}`);
    }
  } catch (error) {
    throw new Error(`Failed to reward tokens: ${(error as Error).message}`);
  }
};

/**
 * Rewards a user with MOM tokens using server-side signing (no wallet confirmation)
 * @param recipientAddress - User's wallet address to receive tokens
 * @param taskType - Type of the task
 * @param priority - Priority of the task
 * @returns Transaction hash
 */
export const rewardUserServerSide = async (
  recipientAddress: string,
  taskType: string,
  priority: string,
): Promise<{ txHash: string }> => {
  try {
    if (!tokenContractAddress) {
      throw new Error('Token contract address is missing');
    }
    
    const taskTypeKey = taskType as keyof RewardByType;
    const priorityKey = priority as keyof RewardAmount;
    const rewardAmount = REWARD_AMOUNTS[taskTypeKey]?.[priorityKey] || 5;
    
    const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/752210d34ce54b7daad6fb8776cf566b';
    if (!rpcUrl) {
      throw new Error('SEPOLIA_RPC_URL is not defined in environment variables');
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const privateKey = process.env.REWARDER_PRIVATE_KEY || 'a333fd7171aadf987ed73afb872ea885409a589db65049e5573768ae405d861d';
    if (!privateKey) {
      throw new Error('REWARDER_PRIVATE_KEY is not defined in environment variables');
    }
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const contract = new ethers.Contract(tokenContractAddress, MOMTokenAbi, wallet);
    
    const tokenAmount = ethers.parseUnits(rewardAmount.toString(), 18);
    
    try {
      const balance = await contract.balanceOf(wallet.address);
      if (balance < tokenAmount) {
        throw new Error('Insufficient token balance in rewarder wallet');
      }
    } catch (balanceError: any) {
      console.error('Error checking rewarder balance:', balanceError);
    }
    
    try {
      const owner = await contract.owner();
    } catch (ownerError: any) {
      console.error('Error checking contract owner:', ownerError);
    }
    
    try {
      const gasEstimate = await contract.rewardTo.estimateGas(recipientAddress, tokenAmount);
    } catch (gasError: any) {
      
      try {
        if (contract.publicRewardTo) {
          const tx = await contract.publicRewardTo(recipientAddress, tokenAmount);
          const receipt = await tx.wait();
          return { txHash: receipt.hash };
        }
      } catch (fallbackError: any) {
        console.error('Fallback attempt also failed:', fallbackError);
      }
      
      throw new Error(`Transaction would fail: ${gasError.message}`);
    }
    
    const tx = await contract.rewardTo(recipientAddress, tokenAmount);
    
    const receipt = await tx.wait();
    
    try {
      await updateUserTokenBalance(rewardAmount);
    } catch (dbError) {
    }
    
    return { txHash: receipt.hash };
  } catch (error: any) {
    if (error.code === 'CALL_EXCEPTION') {
      console.error('Contract execution reverted. Details:', {
        errorCode: error.code,
        errorData: error.data,
        errorReason: error.reason || 'No reason provided',
        transaction: error.transaction,
        revert: error.revert
      });
    }
    throw new Error(`Failed to reward tokens: ${error.message}`);
  }
};

/**
 * Gets the MOM token balance of a user
 * @param address - User's wallet address
 * @returns User's token balance in human-readable format
 */
export const getTokenBalance = async (address: string): Promise<string> => {
  try {
    const provider = await getProvider();
    if (!provider) {
      return '0';
    }
    
    if (!tokenContractAddress || !ethers.isAddress(tokenContractAddress)) {
      return '0';
    }
    
    try {
      const code = await provider.getCode(tokenContractAddress);
      if (code === '0x' || code === '0x0') {
        return '0';
      }
      
      const contract = new ethers.Contract(tokenContractAddress, MOMTokenAbi, provider);
      
      try {
        if (!contract.interface.hasFunction('balanceOf')) {
          return '0';
        }
        
        const balance = await contract.balanceOf(address);
        
        const formattedBalance = ethers.formatUnits(balance, 18);
        
        return formattedBalance;
      } catch (contractError) {
        if ((contractError as { code?: string }).code === 'CALL_EXCEPTION') {
          try {
            await provider.getBlockNumber();
          } catch (networkError) {
            console.error('Network error detected:', networkError);
          }
          
          return '0';
        }
        
        return '0';
      }
    } catch (error) {
      return '0';
    }
  } catch (error) {
    return '0';
  }
};