// src/app/contexts/ApiSettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AllGlobalSettings, GlobalProviderSetting, ApiSettingsContextType } from './ApiSettingsContext.types';
import { ApiProvider } from '../lib/constants'; // Ensure this path is correct

const LOCAL_STORAGE_KEY = 'globalWritingHelperApiSettings';

export const ApiSettingsContext = createContext<ApiSettingsContextType | undefined>(undefined);

export const ApiSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [globalSettings, setGlobalSettings] = useState<AllGlobalSettings>({});

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSettings) {
        setGlobalSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Failed to load API settings from localStorage:", error);
      // Initialize with empty or default if parsing fails
      setGlobalSettings({});
    }
  }, []);

  const saveProviderSetting = useCallback((provider: ApiProvider, settings: GlobalProviderSetting) => {
    setGlobalSettings(prevSettings => {
      const newSettings = {
        ...prevSettings,
        [provider]: { ...prevSettings[provider], ...settings } // Merge new settings with existing for the provider
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error("Failed to save API settings to localStorage:", error);
      }
      return newSettings;
    });
  }, []);

  const getProviderSetting = useCallback((provider: ApiProvider): GlobalProviderSetting | undefined => {
    return globalSettings[provider];
  }, [globalSettings]);

  return (
    <ApiSettingsContext.Provider value={{ globalSettings, saveProviderSetting, getProviderSetting }}>
      {children}
    </ApiSettingsContext.Provider>
  );
};

export const useApiSettings = (): ApiSettingsContextType => {
  const context = useContext(ApiSettingsContext);
  if (!context) {
    throw new Error('useApiSettings must be used within an ApiSettingsProvider');
  }
  return context;
};
