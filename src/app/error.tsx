'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">500</h1>
        <h2 className="text-2xl font-medium mt-4 text-gray-600">服务器错误</h2>
        <p className="mt-2 text-gray-500">抱歉，服务器出现了问题</p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    </div>
  );
} 