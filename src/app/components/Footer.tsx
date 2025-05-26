import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 py-8 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="text-gray-600 mb-4">
            AI 写作助手 • <Link href="/api-test" className="text-blue-500 hover:text-blue-600">API 测试页面</Link> • 使用先进的大型语言模型
          </div>
          
          <div className="flex space-x-8 mb-4">
            <a href="mailto:dasvenxx@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email">
              <svg className="h-6 w-6 text-gray-600 hover:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </a>
          </div>
          
          <div className="text-sm text-gray-500">
            © 2025 写作助手
          </div>
        </div>
      </div>
    </footer>
  );
} 