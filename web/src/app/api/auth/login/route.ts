import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '../../../../services/auth';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    // Validate wallet address
    if (!requestData.walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    // Generate JWT token
    const token = createToken(requestData.walletAddress);
    
    // Return token
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
} 