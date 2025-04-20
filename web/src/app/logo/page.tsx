'use client';

import { motion } from 'framer-motion';
import LogoIcon from '../../components/LogoIcon';
import Link from 'next/link';

export default function LogoPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center">
          <Link href="/" className="text-gray-400 hover:text-white mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold">Brand Assets</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div 
            className="bg-dark-800 rounded-xl p-8 flex flex-col items-center border border-dark-600"
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(107, 33, 168, 0.3)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-dark-700 p-10 rounded-xl mb-6 flex items-center justify-center">
              <LogoIcon size={150} animate />
            </div>
            <h3 className="text-xl font-semibold mb-2">Animated Logo</h3>
            <p className="text-gray-400 text-center mb-4">Our official animated logo with rotating effect</p>
            <div className="flex space-x-3">
              <button className="btn-secondary text-sm px-3 py-1">PNG</button>
              <button className="btn-secondary text-sm px-3 py-1">SVG</button>
            </div>
          </motion.div>

          <motion.div 
            className="bg-dark-800 rounded-xl p-8 flex flex-col items-center border border-dark-600"
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(107, 33, 168, 0.3)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-dark-700 p-10 rounded-xl mb-6 flex items-center justify-center">
              <LogoIcon size={150} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Static Logo</h3>
            <p className="text-gray-400 text-center mb-4">Our official logo for general use</p>
            <div className="flex space-x-3">
              <button className="btn-secondary text-sm px-3 py-1">PNG</button>
              <button className="btn-secondary text-sm px-3 py-1">SVG</button>
            </div>
          </motion.div>

          <motion.div 
            className="bg-dark-800 rounded-xl p-8 flex flex-col items-center border border-dark-600"
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(107, 33, 168, 0.3)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-10 rounded-xl mb-6 flex items-center justify-center">
              <div className="font-bold text-3xl text-white">Momentum</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Text Logo</h3>
            <p className="text-gray-400 text-center mb-4">Text-only version of our brand</p>
            <div className="flex space-x-3">
              <button className="btn-secondary text-sm px-3 py-1">PNG</button>
              <button className="btn-secondary text-sm px-3 py-1">SVG</button>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 p-6 bg-dark-800 rounded-xl border border-dark-600">
          <h2 className="text-2xl font-semibold mb-4">Logo Usage Guidelines</h2>
          <div className="space-y-3 text-gray-300">
            <p>• Maintain clear space around the logo equal to the height of the "M" in the logo</p>
            <p>• Do not alter the colors or distort the proportions of the logo</p>
            <p>• The minimum recommended size is 32px in height for digital use</p>
            <p>• When using on colored backgrounds, use the white or monochrome version</p>
            <p>• Our primary logo color is Purple (#6B21A8)</p>
          </div>
        </div>
      </div>
    </div>
  );
} 