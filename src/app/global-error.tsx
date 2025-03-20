'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="zh">
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-800">500</h1>
            <h2 className="text-2xl font-medium mt-4 text-gray-600">系统错误</h2>
            <p className="mt-2 text-gray-500">抱歉，应用程序遇到了严重错误</p>
            <button
              onClick={() => reset()}
              className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 