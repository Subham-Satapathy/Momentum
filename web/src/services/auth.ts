import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'momentum-secret-key-change-in-production';

const TOKEN_EXPIRY = '7d'; // 7 days

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

export const verifyToken = (token: string): { address: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { address: string };
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    console.log('[Auth] Getting token from localStorage:', token ? 'Token exists' : 'No token found');
    return token;
  }
  console.log('[Auth] Window is undefined, cannot get token');
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

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
