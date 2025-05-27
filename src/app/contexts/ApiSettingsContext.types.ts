import { ApiProvider } from '../lib/constants'; // Assuming ApiProvider is exported from constants

export interface GlobalProviderSetting {
  apiKey?: string;
  customUrl?: string;
  defaultModel?: string;
}

export type AllGlobalSettings = Partial<Record<ApiProvider, GlobalProviderSetting>>;

export interface ApiSettingsContextType {
  globalSettings: AllGlobalSettings;
  saveProviderSetting: (provider: ApiProvider, settings: GlobalProviderSetting) => void;
  getProviderSetting: (provider: ApiProvider) => GlobalProviderSetting | undefined;
}
