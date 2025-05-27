"use client";

import React, { useState } from 'react'; // Removed useEffect and useCallback
import MarkdownEditor from './MarkdownEditor';
// Removed generateContent, ApiSettings imports
import { useApiConfiguredGenerator } from '../lib/api'; // Import the new hook
import { PromptStyle, WritingRequest, ApiResponseDetails } from '../lib/types';
import { API_PROVIDER_CONFIG, ApiProvider } from '../lib/constants';

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

  // Removed API State: apiProvider, llmApiUrl, llmApiKey, model, availableModels, showApiSettings
  // Removed fetchOllamaModels, handleProviderChangeInParent, useEffect related to API state
  
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
    const platformSpecificInstructions = getPlatformInstructions(topic, keywords.split('、'), wordCount);

    // Construct request payload for configuredGenerate
    const requestPayload = { // Type will be Omit<WritingRequest, ...>
      topic: platformSpecificInstructions, // Map platformSpecificInstructions to topic
      promptStyle: promptStyle,
      keywords: keywords.split('、'), // Ensure keywords are passed as an array
      wordCount: wordCount,
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
      setError(err.message || 'An unexpected error occurred.');
      setApiResponseDetails({ rawError: err.message } as ApiResponseDetails);
    } finally {
      setIsLoading(false);
    }
  };

  // isGenerateButtonDisabled function removed

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">{platformName}</h1>
        <p className="text-md text-gray-600 mt-2">
          {platformDescription} (Using {API_PROVIDER_CONFIG[DESIGNATED_PROVIDER_TYPE].helpText.split(" ")[0]} API via Global Settings)
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Settings & Form */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
          <form onSubmit={handleSubmit}>
            {/* ApiSettings component and related UI elements are removed */}
            
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
              disabled={isLoading} // Simplified disabled logic
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
              {/* Update these if the hook provides similar details, or remove if not applicable */}
              <p><strong>Model Used:</strong> {apiResponseDetails.modelUsed || API_PROVIDER_CONFIG[DESIGNATED_PROVIDER_TYPE].defaultModel}</p>
              {apiResponseDetails.latency !== undefined && <p><strong>Latency:</strong> {apiResponseDetails.latency.toFixed(2)} ms</p>}
              {apiResponseDetails.promptTokens !== undefined && <p><strong>Prompt Tokens:</strong> {apiResponseDetails.promptTokens}</p>}
              {apiResponseDetails.completionTokens !== undefined && <p><strong>Completion Tokens:</strong> {apiResponseDetails.completionTokens}</p>}
              {apiResponseDetails.totalTokens !== undefined && <p><strong>Total Tokens:</strong> {apiResponseDetails.totalTokens}</p>}
              {apiResponseDetails.cost !== undefined && <p><strong>Estimated Cost:</strong> ${apiResponseDetails.cost.toFixed(6)}</p>}
              {apiResponseDetails.rawError && <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">Error Details: {apiResponseDetails.rawError}</pre>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformGeneratorUI;
