"use client";

import React, { useState } from 'react';

export type ApiProvider = 'openai' | 'grok' | 'ollama' | 'custom';

// API 提供商帮助信息
const API_HELP: Record<ApiProvider, string> = {
  openai: '使用 OpenAI API，例如 GPT-4',
  grok: '使用 Grok API (X.AI)',
  ollama: '使用本地运行的 Ollama 服务',
  custom: '配置自定义 API 端点'
};

// 默认 API URLs
const API_URLS: Record<ApiProvider, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  grok: 'https://api.x.ai/v1/chat/completions',
  ollama: 'http://localhost:11434/api/generate',
  custom: ''
};

export interface ApiSettingsProps {
  showSettings: boolean;
  toggleSettings: () => void;
  apiProvider: ApiProvider;
  setApiProvider: (provider: ApiProvider) => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  // 仅在使用 Ollama 时需要
  availableModels?: string[];
  fetchModels?: () => Promise<void>;
}

export default function ApiSettings({
  showSettings,
  toggleSettings,
  apiProvider,
  setApiProvider,
  apiUrl,
  setApiUrl,
  apiKey,
  setApiKey,
  model,
  setModel,
  availableModels = [],
  fetchModels
}: ApiSettingsProps) {
  
  const handleApiProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as ApiProvider;
    
    // 更新状态前先准备好新的 URL 和模型
    const newUrl = API_URLS[provider];
    
    // 先更新提供商
    setApiProvider(provider);
    
    // 设置默认 URL
    setApiUrl(newUrl);
    
    // 设置默认模型名称
    if (provider === 'openai') {
      setModel('gpt-4');
    } else if (provider === 'grok') {
      setModel('grok-2-latest');
    } else if (provider === 'ollama') {
      // 对于 Ollama，尝试获取可用模型
      setModel('llama2'); // 设置默认值，即使没有获取到模型列表也能有默认值
      if (fetchModels) {
        // 异步获取模型列表
        fetchModels().catch(err => {
          console.error('获取 Ollama 模型列表失败:', err);
        });
      }
    }
    // 自定义提供商不设置默认模型
  };

  return (
    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleSettings}>
        <h3 className="font-medium text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1H4v8a1 1 0 001 1h10a1 1 0 001-1V6zM4 4a1 1 0 011-1h10a1 1 0 011 1v1H4V4z" clipRule="evenodd" />
          </svg>
          API 设置
        </h3>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${showSettings ? 'transform rotate-180' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {showSettings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="apiProvider" className="block text-sm font-medium text-gray-700 mb-1">
              选择 API 提供商
            </label>
            <select
              id="apiProvider"
              value={apiProvider}
              onChange={handleApiProviderChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="openai">OpenAI</option>
              <option value="grok">Grok (xAI)</option>
              <option value="ollama">Ollama (本地)</option>
              <option value="custom">自定义</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {API_HELP[apiProvider]}
            </p>
          </div>

          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
              API 地址
            </label>
            <input
              type="text"
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="API 端点 URL"
            />
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API 密钥
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="输入您的 API 密钥"
              disabled={apiProvider === 'ollama'}
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              模型名称
            </label>
            {apiProvider === 'ollama' && availableModels && availableModels.length > 0 ? (
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {availableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={apiProvider === 'ollama' ? '加载模型列表中...' : '输入模型名称'}
                disabled={apiProvider === 'ollama' && availableModels && availableModels.length === 0 && fetchModels !== undefined}
              />
            )}
            {apiProvider === 'ollama' && fetchModels && availableModels.length === 0 && (
              <button
                type="button"
                onClick={() => fetchModels()}
                className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                刷新模型列表
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 