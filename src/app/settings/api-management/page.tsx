"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useApiSettings } from '../../../../contexts/ApiSettingsContext'; // Adjust path if necessary based on actual file structure
import { API_PROVIDER_CONFIG, ApiProvider } from '../../../../lib/constants'; // Adjust path
import { GlobalProviderSetting } from '../../../../contexts/ApiSettingsContext.types'; // Adjust path
// import FeatureLayout from '@/app/components/FeatureLayout'; // Optional: for consistent layout, assuming not used for now

const ApiManagementPage = () => {
  const { globalSettings, saveProviderSetting, getProviderSetting } = useApiSettings();
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider>('openai');

  // Form states
  const [apiKey, setApiKey] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [defaultModel, setDefaultModel] = useState('');
  const [isLoading, setIsLoading] = useState(true); // To handle initial loading of settings

  // Load settings when selectedProvider changes or initially
  useEffect(() => {
    setIsLoading(true);
    const currentProviderSettings = getProviderSetting(selectedProvider) || {};
    const providerConfigDetails = API_PROVIDER_CONFIG[selectedProvider];

    setApiKey(currentProviderSettings.apiKey || '');
    
    // Set customUrl from saved settings if it exists, otherwise leave it empty (placeholder will show default)
    setCustomUrl(currentProviderSettings.customUrl || ''); 
    
    // Set defaultModel from saved settings, fallback to provider's default, then empty
    setDefaultModel(currentProviderSettings.defaultModel || providerConfigDetails.defaultModel || '');
    setIsLoading(false);
  }, [selectedProvider, getProviderSetting, globalSettings]); // globalSettings in dependency array to reload if settings change externally

  const handleSave = () => {
    // Construct settings object, ensuring only relevant fields are saved
    const settingsToSave: GlobalProviderSetting = {};

    if (selectedProvider !== 'ollama') { // Ollama typically doesn't need/use an API key from global settings
      settingsToSave.apiKey = apiKey;
    }
    // Only save customUrl if it's for a provider that uses it (ollama, custom) or if user explicitly entered something
    if (customUrl || selectedProvider === 'ollama' || selectedProvider === 'custom') {
      settingsToSave.customUrl = customUrl;
    }
    
    if (defaultModel) { // Save default model if user specified one
      settingsToSave.defaultModel = defaultModel;
    } else { // If user cleared it, save an empty string to signify no preference, or remove the key
        settingsToSave.defaultModel = ''; 
    }

    saveProviderSetting(selectedProvider, settingsToSave);
    alert(`${API_PROVIDER_CONFIG[selectedProvider].helpText.split(' ')[0]} settings saved!`); // Simple feedback
  };

  const currentConfig = API_PROVIDER_CONFIG[selectedProvider];
  // Determine the URL to display: user's custom URL, or the default from config.
  // For providers not 'ollama' or 'custom', customUrl from settings is ignored for display unless explicitly set.
  let displayUrl = currentConfig.url;
  if (selectedProvider === 'ollama' || selectedProvider === 'custom') {
    displayUrl = customUrl || currentConfig.url;
  }


  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    // <FeatureLayout title="Global API Settings" subtitle="Manage API configurations for all tools">
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Global API Settings</h1>
        <p className="text-md text-gray-600 mt-2">Manage API configurations that can be used by various AI tools.</p>
      </header>
      
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="mb-6">
          <label htmlFor="providerSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select API Provider to Configure:
          </label>
          <select
            id="providerSelect"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as ApiProvider)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {Object.keys(API_PROVIDER_CONFIG).map((key) => {
              const providerKey = key as ApiProvider;
              // Use a more descriptive name if available, e.g., from a dedicated name field or helpText
              const providerName = API_PROVIDER_CONFIG[providerKey].helpText.split(',')[0] || API_PROVIDER_CONFIG[providerKey].helpText.split(' ')[0] || providerKey;
              return (
                <option key={providerKey} value={providerKey}>
                  {providerName}
                </option>
              );
            })}
          </select>
          <p className="mt-1 text-xs text-gray-500">{currentConfig.helpText}</p>
        </div>

        <div className="space-y-6">
          {/* API Key */}
          {selectedProvider !== 'ollama' && ( 
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">API Key</label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={selectedProvider === 'custom' ? "Optional API Key" : "Enter API Key"}
              />
               <p className="mt-1 text-xs text-gray-500">Your API key is stored locally in your browser.</p>
            </div>
          )}

          {/* Custom URL */}
          { (selectedProvider === 'ollama' || selectedProvider === 'custom') ? (
            <div>
              <label htmlFor="customUrl" className="block text-sm font-medium text-gray-700">
                Custom API URL 
              </label>
              <input
                type="text"
                id="customUrl"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={currentConfig.url || "e.g., http://localhost:11434/api/generate"}
              />
              <p className="mt-1 text-xs text-gray-500">
                For Ollama, use the base URL (e.g., http://localhost:11434). Specific endpoints like /api/generate or /api/chat will be appended by tools.
              </p>
            </div>
          ) : (
             <div>
                <p className="block text-sm font-medium text-gray-700">API URL (Default)</p>
                <p className="mt-1 text-sm text-gray-600 bg-gray-100 p-3 rounded-md border border-gray-200">{displayUrl}</p>
             </div>
           )}


          {/* Default Model */}
          <div>
            <label htmlFor="defaultModel" className="block text-sm font-medium text-gray-700">Preferred Default Model</label>
            {currentConfig.availableModels && currentConfig.availableModels.length > 0 ? (
              <select
                id="defaultModel"
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">-- Select a model (optional) --</option>
                {currentConfig.availableModels.map(modelName => (
                  <option key={modelName} value={modelName}>{modelName}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="defaultModel"
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={currentConfig.defaultModel || "e.g., llama2, gpt-4, etc."}
              />
            )}
             <p className="mt-1 text-xs text-gray-500">
               Specify a model to be used by default. Tools may allow overriding this.
               {currentConfig.availableModels && currentConfig.availableModels.length > 0 ? 
                ` Available for ${selectedProvider}: ${currentConfig.availableModels.join(', ')}` 
                : selectedProvider === 'ollama' ? " For Ollama, ensure the model is pulled locally." : " Enter any model name supported by the provider."}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
            >
              Save Settings for {API_PROVIDER_CONFIG[selectedProvider].helpText.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
    // </FeatureLayout>
  );
};

export default ApiManagementPage;
