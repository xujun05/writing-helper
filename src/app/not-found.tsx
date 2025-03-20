import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <h2 className="text-2xl font-medium mt-4 text-gray-600">页面未找到</h2>
        <p className="mt-2 text-gray-500">您请求的页面不存在</p>
        <Link href="/" className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          返回首页
        </Link>
      </div>
    </div>
  );
} 