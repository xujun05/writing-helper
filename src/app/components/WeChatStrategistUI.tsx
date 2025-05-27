"use client";

import React, { useState } from 'react'; // Removed useCallback, useEffect
import MarkdownEditor from './MarkdownEditor';
// Removed generateContent, ApiSettings imports
import { useApiConfiguredGenerator } from '../lib/api'; // Import the new hook
import { PromptStyle, WritingRequest, ApiResponseDetails } from '../lib/types'; // WritingRequest might need Omit
import { API_PROVIDER_CONFIG, ApiProvider } from '../lib/constants'; // Keep ApiProvider for DESIGNATED_PROVIDER_TYPE

interface WeChatStrategistUIProps {
  getPlatformPromptStyle: () => PromptStyle;
  getPlatformInstructions: (theme: string, coreIdea: string, audience: string, styleTone: string) => string;
}

const WeChatStrategistUI: React.FC<WeChatStrategistUIProps> = ({
  getPlatformPromptStyle,
  getPlatformInstructions,
}) => {
  // Content State
  const [theme, setTheme] = useState<string>("例如：利用AI提升个人知识管理效率");
  const [coreIdea, setCoreIdea] = useState<string>("例如：现代人面临信息过载，传统知识管理方式低效。AI工具可通过智能分类、自动摘要、关联挖掘等功能，帮助用户构建动态、高效的个人知识网络，从而释放创造力。");
  const [audience, setAudience] = useState<string>("例如：知识工作者、学生、终身学习者、效率工具爱好者");
  const [styleTone, setStyleTone] = useState<string>("例如：专业、前沿、实用、赋能感、略带科技美学");

  // Removed API State: apiProvider, llmApiUrl, llmApiKey, model, availableModels, showApiSettings
  // Removed fetchOllamaModels, onApiProviderChange, useEffect related to API state

  // Output State
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponseDetails, setApiResponseDetails] = useState<ApiResponseDetails | null>(null);
  // showApiSettings state is removed

  // Define the designated provider type for this component
  const DESIGNATED_PROVIDER_TYPE: ApiProvider = 'openai';
  const configuredGenerate = useApiConfiguredGenerator(DESIGNATED_PROVIDER_TYPE);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setOutput('');
    setApiResponseDetails(null);

    const promptStyle = getPlatformPromptStyle();
    const platformSpecificInstructions = getPlatformInstructions(theme, coreIdea, audience, styleTone);

    // Construct request payload for configuredGenerate
    const requestPayload = { // Type will be Omit<WritingRequest, ...>
      prompt: platformSpecificInstructions, // This was specific to old generateContent, needs to map to new structure if different
      // The old `generateContent` used `promptStyle`, `topic`, `keywords`, `wordCount` to build the prompt.
      // The new `_internalGenerateContent` expects `promptStyle`, `topic`, `keywords`, `wordCount`.
      // So we pass these directly. The `getPlatformInstructions` might need to be used to form the `topic` or part of it.
      // For now, assuming `platformSpecificInstructions` is the main `topic` for the prompt template.
      topic: platformSpecificInstructions, // Assuming this is the main content/topic for the prompt template
      promptStyle: promptStyle,
      keywords: [], // Keywords might be part of platformSpecificInstructions or handled differently
      wordCount: 0, // Or use state.wordCount if it's still relevant
      // language, creativityLevel, format, tone are not directly in WritingRequest but part of PromptStyle or implied
      // No need to pass: apiProvider, llmApiUrl, llmApiKey, model
    };
    
    try {
      // Use the configuredGenerate function from the hook
      const result = await configuredGenerate(requestPayload);
      if (result.error) {
        setError(result.error);
        setApiResponseDetails({ rawError: result.error } as ApiResponseDetails); // Adapt if result has more details
      } else {
        setOutput(result.content || '');
        setApiResponseDetails(result.details || null);
      }
    } catch (err: any) {
      setError(err.message || '发生未知错误。');
      setApiResponseDetails({ rawError: err.message } as ApiResponseDetails);
    } finally {
      setIsLoading(false);
    }
  };

  // isGenerateButtonDisabled function is removed as API key check is no longer local

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">微信公众号运营策略师</h1>
        <p className="text-md text-gray-600 mt-2">
          输入文章的核心要素，AI为你生成公众号文章的初步框架和内容建议。 
          (使用 {API_PROVIDER_CONFIG[DESIGNATED_PROVIDER_TYPE].helpText.split(" ")[0]} API)
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Settings & Form */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
          <form onSubmit={handleSubmit}>
            {/* ApiSettings component and related UI elements are removed */}
            
            <div className="space-y-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">内容设置</h2>
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                  文章主题
                </label>
                <input
                  type="text"
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="例如：利用AI提升个人知识管理效率"
                />
              </div>
              <div>
                <label htmlFor="coreIdea" className="block text-sm font-medium text-gray-700 mb-1">
                  核心观点/摘要
                </label>
                <textarea
                  id="coreIdea"
                  value={coreIdea}
                  onChange={(e) => setCoreIdea(e.target.value)}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="例如：现代人面临信息过载，传统知识管理方式低效..."
                />
              </div>
              <div>
                <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                  目标受众
                </label>
                <input
                  type="text"
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="例如：知识工作者、学生、终身学习者"
                />
              </div>
              <div>
                <label htmlFor="styleTone" className="block text-sm font-medium text-gray-700 mb-1">
                  期望文章风格/调性
                </label>
                <input
                  type="text"
                  id="styleTone"
                  value={styleTone}
                  onChange={(e) => setStyleTone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="例如：专业、前沿、实用、赋能感"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading} // Simplified disabled logic
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </div>
              ) : "生成内容建议"}
            </button>
          </form>
        </div>

        {/* Right Column: Output & Editor */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">生成结果</h2>
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-center">
                <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-lg text-gray-600">正在生成内容... 请稍候。</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 mb-4" role="alert">
              <strong className="font-bold">错误: </strong>
              <span className="block sm:inline">{error}</span>
              {apiResponseDetails && apiResponseDetails.rawError && (
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                  {JSON.stringify(apiResponseDetails.rawError, null, 2)}
                </pre>
              )}
            </div>
          )}
          
          {!isLoading && !error && !output && (
             <div className="text-center text-gray-500 py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-gray-600">生成的内容将在此处显示。</p>
             </div>
          )}

          {output && (
            <MarkdownEditor value={output} onChange={setOutput} />
          )}

          {apiResponseDetails && (
            <div className="mt-6 bg-gray-50 p-4 rounded-md text-xs text-gray-600">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">API 响应详情:</h3>
              {/* Update these if the hook provides similar details, or remove if not applicable */}
              <p><strong>使用模型:</strong> {apiResponseDetails.modelUsed || API_PROVIDER_CONFIG[DESIGNATED_PROVIDER_TYPE].defaultModel}</p>
              {apiResponseDetails.latency !== undefined && <p><strong>延迟:</strong> {apiResponseDetails.latency.toFixed(2)} ms</p>}
              {apiResponseDetails.promptTokens !== undefined && <p><strong>提示 Tokens:</strong> {apiResponseDetails.promptTokens}</p>}
              {apiResponseDetails.completionTokens !== undefined && <p><strong>完成 Tokens:</strong> {apiResponseDetails.completionTokens}</p>}
              {apiResponseDetails.totalTokens !== undefined && <p><strong>总 Tokens:</strong> {apiResponseDetails.totalTokens}</p>}
              {apiResponseDetails.cost !== undefined && <p><strong>预估费用:</strong> ${apiResponseDetails.cost.toFixed(6)}</p>}
              {apiResponseDetails.rawError && <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">Error Details: {apiResponseDetails.rawError}</pre>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeChatStrategistUI;
