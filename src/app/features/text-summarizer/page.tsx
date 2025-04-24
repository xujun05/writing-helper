"use client";

import React, { useState } from 'react';
import FeatureLayout from '../../components/FeatureLayout';

export default function TextSummarizer() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setSummary('');

    try {
      // 这里会调用后端API，现在只是模拟
      // 实际应用中，应该创建一个API端点处理请求
      setTimeout(() => {
        setSummary(`这是"${text.slice(0, 30)}..."的摘要示例。实际应用中，这里会显示真实的摘要结果。`);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('生成摘要时出错:', error);
      setLoading(false);
    }
  };

  return (
    <FeatureLayout 
      title="文本摘要工具" 
      subtitle="快速生成文章的摘要，提取关键信息"
    >
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                输入需要摘要的文本
              </label>
              <textarea
                id="text"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入要生成摘要的文本..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  loading || !text.trim()
                    ? 'bg-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? '生成中...' : '生成摘要'}
              </button>
            </div>
          </form>

          {summary && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">摘要结果</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-gray-700">{summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </FeatureLayout>
  );
} 