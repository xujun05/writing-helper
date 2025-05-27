"use client";

import React, { useEffect } from 'react'; // Removed useState, added useEffect
import Link from 'next/link'; // Import Link
import { useApiSettings } from '../contexts/ApiSettingsContext'; // Import useApiSettings
import { API_PROVIDER_CONFIG, ApiProvider } from '../../lib/constants';

export interface ApiSettingsProps {
  showSettings: boolean;
  toggleSettings: () => void;
  apiProvider: ApiProvider;
  setApiProvider: (provider: ApiProvider) => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  apiKey: string;  // 注意：对于 Ollama，此值可以为空字符串
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  // 仅在使用 Ollama 时需要
  availableModels?: string[];
  fetchModels?: () => Promise<string[] | void>;
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
  const { getProviderSetting } = useApiSettings();

  // Effect to initialize/update settings when apiProvider prop changes from parent
  // This is important if the parent changes the provider programmatically
  useEffect(() => {
    const globalProviderSetting = getProviderSetting(apiProvider) || {};
    const providerConfig = API_PROVIDER_CONFIG[apiProvider];

    const effectiveUrl = globalProviderSetting.customUrl || providerConfig.url;
    setApiUrl(effectiveUrl);

    const initialModel = globalProviderSetting.defaultModel || providerConfig.defaultModel || '';
    setModel(initialModel);

    if (apiProvider === 'ollama') {
      setApiKey(''); // Clear local/parent API key state if Ollama
      if (fetchModels) {
        fetchModels().catch(err => console.error('Failed to fetch Ollama models:', err));
      }
    }
  }, [apiProvider, getProviderSetting, setApiUrl, setModel, setApiKey, fetchModels]);


  const handleApiProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as ApiProvider;
    setApiProvider(newProvider); // Call parent's state update for provider
    
    // Settings (URL, Model) will be updated by the useEffect above once apiProvider prop changes
  };
  
  const currentProviderConfig = API_PROVIDER_CONFIG[apiProvider];
  const providerModels = currentProviderConfig?.availableModels || [];
  const globalSettingForProvider = getProviderSetting(apiProvider) || {};
  const globalApiKey = globalSettingForProvider.apiKey;
  const globalCustomUrl = globalSettingForProvider.customUrl;

  const isApiKeyGloballySet = !!globalApiKey;
  // URL is globally managed if a globalCustomUrl exists for 'ollama' or 'custom',
  // or for other providers if their effective URL (which would be globalCustomUrl if set) is active.
  // However, for non-ollama/custom, globalCustomUrl isn't typically used to override their default.
  // So, we primarily care about globalCustomUrl for 'ollama' and 'custom'.
  const isUrlGloballyManaged = (apiProvider === 'ollama' || apiProvider === 'custom') && !!globalCustomUrl && globalCustomUrl === apiUrl;


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
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="grok">Grok (xAI)</option>
              <option value="ollama">Ollama (本地)</option>
              <option value="deepseek">DeepSeek</option>
              <option value="custom">自定义</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {API_PROVIDER_CONFIG[apiProvider].helpText}
            </p>
          </div>

          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
              API 地址
            </label>
            <input
              type="text"
              id="apiUrl"
              value={apiUrl} // This now reflects the effective URL from global/config
              onChange={(e) => {
                if (!isUrlGloballyManaged) {
                  setApiUrl(e.target.value);
                }
              }}
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isUrlGloballyManaged ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder={currentProviderConfig.url || "API Endpoint URL"}
              disabled={isUrlGloballyManaged || (apiProvider !== 'custom' && apiProvider !== 'ollama')}
            />
            {isUrlGloballyManaged && (
              <p className="mt-1 text-xs text-gray-500">
                Managed by <Link href="/settings/api-management" className="text-blue-600 hover:underline">Global Settings</Link>.
              </p>
            )}
             { (apiProvider !== 'custom' && apiProvider !== 'ollama' && !isUrlGloballyManaged) && (
                <p className="mt-1 text-xs text-gray-500">Default URL for {currentProviderConfig.helpText.split(" ")[0]}. Not typically changed here.</p>
            )}
          </div>
          
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API 密钥
            </label>
            {apiProvider === 'ollama' ? (
              <div className="block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500 text-sm">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Ollama typically does not require an API key.
                </span>
              </div>
            ) : isApiKeyGloballySet ? (
              <div className="block w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md text-gray-500 text-sm cursor-not-allowed">
                Globally Set: ******
                <Link href="/settings/api-management" className="text-blue-600 hover:underline ml-2 text-xs">(Manage)</Link>
              </div>
            ) : (
              <input
                type="password"
                id="apiKey"
                value={apiKey} // Parent's local state
                onChange={(e) => setApiKey(e.target.value)} // Update parent's local state
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="输入您的 API 密钥 (或在全局设置中配置)"
              />
            )}
            {!isApiKeyGloballySet && apiProvider !== 'ollama' && (
                 <p className="mt-1 text-xs text-gray-500">
                    No global key set for {currentProviderConfig.helpText.split(" ")[0]}. Key entered here is for this session.
                    <Link href="/settings/api-management" className="text-blue-600 hover:underline ml-1">Set Globally</Link>
                </p>
            )}
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              模型名称
            </label>
            {(apiProvider === 'ollama' && availableModels && availableModels.length > 0) || (providerModels.length > 0 && apiProvider !== 'custom') ? (
              <div className="space-y-2">
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {(apiProvider === 'ollama' ? availableModels : providerModels).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {apiProvider === 'ollama' && (
                  <div className="text-xs text-green-600">
                    已找到 {availableModels.length} 个可用模型
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={
                    apiProvider === 'ollama' 
                      ? '加载模型列表中或手动输入模型名称...' 
                      : (providerModels.length === 0 || apiProvider === 'custom') 
                        ? '输入模型名称' 
                        : '选择或输入模型名称'
                  }
                />
                {apiProvider === 'ollama' && availableModels.length === 0 && (
                  <div className="text-xs text-gray-500">
                    未找到模型，请确保 Ollama 正在运行并已安装模型
                  </div>
                )}
                 {(apiProvider !== 'ollama' && apiProvider !== 'custom' && providerModels.length === 0) && (
                  <div className="text-xs text-gray-500">
                    当前提供商没有预设模型列表，请输入模型名称。
                  </div>
                )}
              </div>
            )}
            {apiProvider === 'ollama' && fetchModels && (
              <button
                type="button"
                onClick={() => {
                  try {
                    console.log('开始获取 Ollama 模型列表...');
                    fetchModels()
                      .then((models) => {
                        console.log('获取 Ollama 模型成功，可用模型数量:', Array.isArray(models) ? models.length : availableModels.length);
                        // 强制刷新组件
                        if (availableModels.length > 0) {
                          const modelInput = document.getElementById('model');
                          if (modelInput) {
                            // 触发一个小动画以便用户知道列表已刷新
                            modelInput.classList.add('pulse-animation');
                            setTimeout(() => {
                              modelInput.classList.remove('pulse-animation');
                            }, 1000);
                          }
                        }
                      })
                      .catch(err => {
                        console.error('刷新模型列表失败:', err);
                      });
                  } catch (error) {
                    console.error('刷新模型列表失败:', error);
                  }
                }}
                className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新模型列表
              </button>
            )}
            {apiProvider === 'ollama' && (
              <div className="mt-2 text-xs text-gray-600">
                <p>
                  提示: 如需安装新模型，请在终端执行: <code className="px-1 py-0.5 bg-gray-100 rounded">ollama pull llama3.1</code>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 