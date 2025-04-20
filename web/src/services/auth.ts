import jwt from 'jsonwebtoken';

// Secret key for JWT signing - in production, load from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'momentum-secret-key-change-in-production';

// Token expiry time
const TOKEN_EXPIRY = '7d'; // 7 days

// Create a JWT token for a wallet address
export const createToken = (walletAddress: string): string => {
  return jwt.sign(
    { 
      address: walletAddress 
    },
    JWT_SECRET,
    { 
      expiresIn: TOKEN_EXPIRY 
    }
  );
};

// Verify and decode a JWT token
export const verifyToken = (token: string): { address: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { address: string };
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

// Store token in local storage
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

// Get token from local storage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    console.log('[Auth] Getting token from localStorage:', token ? 'Token exists' : 'No token found');
    return token;
  }
  console.log('[Auth] Window is undefined, cannot get token');
  return null;
};

// Remove token from local storage
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// Get wallet address from token
export const getWalletAddress = (): string | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const decoded = jwt.decode(token) as { address: string };
    return decoded.address;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}; 