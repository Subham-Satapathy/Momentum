import { NextRequest } from 'next/server';
import { verifyToken } from '../services/auth';

export const createContext = async ({ req }: { req: NextRequest }) => {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userAddress: null };
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded || !decoded.address) {
    return { userAddress: null };
  }
  
  return {
    userAddress: decoded.address,
  };
}; 