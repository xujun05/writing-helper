"use client";

import React from 'react';
import FeatureLayout from '../../components/FeatureLayout';

export default function FeatureTemplate() {
  return (
    <FeatureLayout 
      title="新功能页面" 
      subtitle="这是一个新功能页面的模板，可以根据需要修改"
    >
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
        {/* 在此处添加功能组件 */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">功能开发中</h2>
          <p className="text-gray-600 mb-4">
            请根据实际需求修改此模板，添加所需的组件和功能。
          </p>
          <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200 text-left">
            <h3 className="text-md font-medium text-gray-800 mb-2">开发指南:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>将此目录复制到 <code className="bg-gray-100 px-1 py-0.5 rounded">src/app/features/[your-feature-name]</code></li>
              <li>修改标题和描述</li>
              <li>添加功能所需的组件</li>
              <li>在 <code className="bg-gray-100 px-1 py-0.5 rounded">src/app/components/Navigation.tsx</code> 文件中注册新页面</li>
            </ol>
          </div>
        </div>
      </div>
    </FeatureLayout>
  );
} 