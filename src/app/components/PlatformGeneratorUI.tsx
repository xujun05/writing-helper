"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ApiSettings, { ApiProvider } from './ApiSettings';
import MarkdownEditor from './MarkdownEditor';
import { generateContent } from '../lib/api';
import { PromptStyle, WritingRequest, ApiResponseDetails } from '../lib/types';
import { OPENAI_API_URL, ANTHROPIC_API_URL, OLLAMA_API_URL, GOOGLE_AI_STUDIO_URL } from '../lib/constants';

interface PlatformGeneratorUIProps {
  platformName: string;
  platformDescription: string;
  defaultTopic: string;
  defaultKeywords: string;
  defaultWordCount: number;
  getPlatformPromptStyle: () => PromptStyle;
  getPlatformInstructions: (topic: string, keywords: string[], wordCount: number) => string;
}

const PlatformGeneratorUI: React.FC<PlatformGeneratorUIProps> = ({
  platformName,
  platformDescription,
  defaultTopic,
  defaultKeywords,
  defaultWordCount,
  getPlatformPromptStyle,
  getPlatformInstructions,
}) => {
  const [topic, setTopic] = useState<string>(defaultTopic);
  const [keywords, setKeywords] = useState<string>(defaultKeywords);
  const [wordCount, setWordCount] = useState<number>(defaultWordCount);
  const [apiProvider, setApiProvider] = useState<ApiProvider>('openai');
  const [llmApiUrl, setLlmApiUrl] = useState<string>(OPENAI_API_URL);
  const [llmApiKey, setLlmApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gpt-4');
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponseDetails, setApiResponseDetails] = useState<ApiResponseDetails | null>(null);
  const [showApiSettings, setShowApiSettings] = useState<boolean>(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const fetchOllamaModels = useCallback(async () => {
    if (apiProvider === 'ollama') {
      try {
        const response = await fetch('/api/proxy/ollama-models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ollamaApiUrl: llmApiUrl }),
        });
        if (!response.ok) {
          throw new Error(`Ollama API request failed with status ${response.status}`);
        }
        const data = await response.json();
        setAvailableModels(data.models.map((m: any) => m.name) || []);
        if (data.models.length > 0) {
          setModel(data.models[0].name);
        } else {
          setModel('');
        }
      } catch (err) {
        setError('Failed to fetch Ollama models. Please ensure Ollama is running and accessible.');
        setAvailableModels([]);
        setModel('');
      }
    }
  }, [apiProvider, llmApiUrl]);

  useEffect(() => {
    if (apiProvider === 'ollama') {
      fetchOllamaModels();
    } else if (apiProvider === 'openai') {
      setAvailableModels(['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']);
      setModel('gpt-4');
    } else if (apiProvider === 'anthropic') {
      setAvailableModels(['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']);
      setModel('claude-3-opus-20240229');
    } else if (apiProvider === 'google') {
      setAvailableModels(['gemini-pro', 'gemini-1.5-pro-latest']);
      setModel('gemini-1.5-pro-latest');
    }
  }, [apiProvider, fetchOllamaModels]);


  const handleApiProviderChange = (provider: ApiProvider) => {
    setApiProvider(provider);
    setLlmApiKey(''); // Reset API key when provider changes
    setApiResponseDetails(null);
    setError(null);
    setOutput('');
    switch (provider) {
      case 'openai':
        setLlmApiUrl(OPENAI_API_URL);
        setModel('gpt-4');
        setAvailableModels(['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']);
        break;
      case 'anthropic':
        setLlmApiUrl(ANTHROPIC_API_URL);
        setModel('claude-3-opus-20240229');
        setAvailableModels(['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']);
        break;
      case 'ollama':
        setLlmApiUrl(OLLAMA_API_URL);
        // fetchOllamaModels will be called by useEffect
        break;
      case 'google':
        setLlmApiUrl(GOOGLE_AI_STUDIO_URL);
        setModel('gemini-1.5-pro-latest');
        setAvailableModels(['gemini-pro', 'gemini-1.5-pro-latest']);
        break;
      default:
        setLlmApiUrl(OPENAI_API_URL);
        setModel('gpt-4');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setOutput('');
    setApiResponseDetails(null);

    const promptStyle = getPlatformPromptStyle();
    const platformSpecificInstructions = getPlatformInstructions(topic, keywords.split('、'), wordCount);

    const request: WritingRequest = {
      prompt: platformSpecificInstructions, // Important: use platformSpecificInstructions as the main prompt
      context: '', // Context might not be needed here or could be an empty string
      style: promptStyle,
      tone: 'Neutral', // Or make this configurable if needed
      format: 'Text', // Or make this configurable
      language: 'English', // Or make this configurable
      creativityLevel: 0.7, // Or make this configurable
      wordCount: wordCount,
      apiProvider,
      llmApiUrl,
      llmApiKey,
      model,
    };

    try {
      const result = await generateContent(request);
      if (result.error) {
        setError(result.error);
        setApiResponseDetails(result.details || null);
      } else {
        setOutput(result.content || '');
        setApiResponseDetails(result.details || null);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setApiResponseDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isGenerateButtonDisabled = () => {
    if (isLoading) return true;
    if (apiProvider === 'openai' && !llmApiKey) return true;
    if (apiProvider === 'anthropic' && !llmApiKey) return true;
    if (apiProvider === 'google' && !llmApiKey) return true;
    // Ollama might not require an API key depending on setup
    return false;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">{platformName}</h1>
        <p className="text-md text-gray-600 mt-2">{platformDescription}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Settings & Form */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
          <form onSubmit={handleSubmit}>
            <ApiSettings
              apiProvider={apiProvider}
              onApiProviderChange={handleApiProviderChange}
              llmApiKey={llmApiKey}
              onLlmApiKeyChange={setLlmApiKey}
              llmApiUrl={llmApiUrl}
              onLlmApiUrlChange={setLlmApiUrl}
              model={model}
              onModelChange={setModel}
              availableModels={availableModels}
              fetchOllamaModels={fetchOllamaModels}
              showApiSettings={showApiSettings}
              onShowApiSettingsChange={setShowApiSettings}
              error={error && error.includes("API key") ? error : null} // Pass API key specific errors
            />

            {showApiSettings && <hr className="my-6 border-gray-200" />}

            <div className="space-y-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Content Settings</h2>
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Main Topic/Goal
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`e.g., "A blog post about the future of AI"`}
                />
              </div>
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords (comma-separated, e.g., AI、machine learning、future)
                </label>
                <input
                  type="text"
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., technology, innovation, disruption"
                />
              </div>
              <div>
                <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Approximate Word Count
                </label>
                <input
                  type="number"
                  id="wordCount"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value, 10))}
                  className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerateButtonDisabled()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : `Generate ${platformName} Content`}
            </button>
          </form>
        </div>

        {/* Right Column: Output & Editor */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated Result</h2>
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-center">
                <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-lg text-gray-600">Generating content... please wait.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
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
                <p className="mt-2 text-gray-600">Generated content will appear here.</p>
             </div>
          )}

          {output && (
            <MarkdownEditor value={output} onChange={setOutput} />
          )}

          {apiResponseDetails && (
            <div className="mt-6 bg-gray-50 p-4 rounded-md text-xs text-gray-700">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">API Response Details:</h3>
              <p><strong>Model Used:</strong> {apiResponseDetails.modelUsed || model}</p>
              {apiResponseDetails.latency !== undefined && <p><strong>Latency:</strong> {apiResponseDetails.latency.toFixed(2)} ms</p>}
              {apiResponseDetails.promptTokens !== undefined && <p><strong>Prompt Tokens:</strong> {apiResponseDetails.promptTokens}</p>}
              {apiResponseDetails.completionTokens !== undefined && <p><strong>Completion Tokens:</strong> {apiResponseDetails.completionTokens}</p>}
              {apiResponseDetails.totalTokens !== undefined && <p><strong>Total Tokens:</strong> {apiResponseDetails.totalTokens}</p>}
              {apiResponseDetails.cost !== undefined && <p><strong>Estimated Cost:</strong> ${apiResponseDetails.cost.toFixed(6)}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformGeneratorUI;
