'use client';

interface TodoStatsProps {
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
  verifiedCount: number;
}

export default function TodoStats({
  completedCount,
  totalCount,
  completionPercentage,
  verifiedCount
}: TodoStatsProps) {
  const verificationPercentage = completedCount > 0 
    ? Math.min(100, Math.round((verifiedCount / completedCount) * 100)) 
    : 0;
    
  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            Task Completion
          </span>
          <span className="text-sm font-medium text-accent-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-dark-600 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-accent-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {completedCount > 0 && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">
              Blockchain Verification
            </span>
            <span className="text-sm font-medium text-green-400">
              {verificationPercentage}%
            </span>
          </div>
          <div className="w-full bg-dark-600 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-accent-500 h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${verificationPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-dark-700 p-4 rounded-lg text-center border border-dark-600 hover:border-accent-400 transition-all duration-300">
          <p className="text-sm text-gray-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-accent-400">{completedCount}</p>
        </div>
        <div className="bg-dark-700 p-4 rounded-lg text-center border border-dark-600 hover:border-accent-400 transition-all duration-300">
          <p className="text-sm text-gray-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{totalCount}</p>
        </div>
      </div>
      
      <div className="bg-dark-700 p-4 rounded-lg text-center border border-dark-600 hover:border-green-400 transition-all duration-300">
        <p className="text-sm text-gray-400 mb-1">Verified on Blockchain</p>
        <p className="text-2xl font-bold text-green-400">{verifiedCount}</p>
      </div>

      {totalCount === 0 && (
        <div className="mt-4 text-center text-gray-500 text-sm p-2 bg-dark-700 rounded-lg border border-dark-600 mt-6">
          Add tasks to see your statistics
        </div>
      )}
    </div>
  );
} 