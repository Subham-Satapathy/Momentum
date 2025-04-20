'use client';

import LandingHero from '../components/LandingHero';
import { useWallet } from '../contexts/WalletContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isConnected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return <LandingHero />;
} 