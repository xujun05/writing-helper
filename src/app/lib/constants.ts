export type ApiProvider = 'openai' | 'grok' | 'ollama' | 'deepseek' | 'custom' | 'anthropic' | 'google';

export interface ApiProviderDetails {
  url: string;
  helpText: string;
  defaultModel?: string;
  availableModels?: string[]; // For providers like OpenAI, Anthropic, Google with a fixed set
}

export const API_PROVIDER_CONFIG: Record<ApiProvider, ApiProviderDetails> = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    helpText: '使用 OpenAI API，例如 GPT-4',
    defaultModel: 'gpt-4',
    availableModels: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  grok: {
    url: 'https://api.x.ai/v1/chat/completions',
    helpText: '使用 Grok API (X.AI)',
    defaultModel: 'grok-3-latest'
  },
  ollama: {
    url: 'http://localhost:11434/api/generate',
    helpText: '使用本地运行的 Ollama 服务',
    defaultModel: 'llama2'
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    helpText: '使用 DeepSeek API，例如 DeepSeek-V2',
    defaultModel: 'deepseek-chat'
  },
  custom: {
    url: '',
    helpText: '配置自定义 API 端点',
    defaultModel: ''
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    helpText: '使用 Anthropic API，例如 Claude',
    defaultModel: 'claude-3-opus-20240229',
    availableModels: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
  },
  google: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    helpText: '使用 Google AI Studio API，例如 Gemini',
    defaultModel: 'gemini-1.5-pro-latest',
    availableModels: ['gemini-pro', 'gemini-1.5-pro-latest']
  }
};

// Redundant constants previously commented out have been removed.

export const APP_TITLE = 'Writing Assistant';
export const DEBOUNCE_DELAY = 500;
export const SESSION_STORAGE_KEY_API_PROVIDER = 'apiProvider';
export const SESSION_STORAGE_KEY_API_URL = 'apiUrl';
export const SESSION_STORAGE_KEY_API_KEY = 'apiKey';
export const SESSION_STORAGE_KEY_MODEL = 'model';
export const SESSION_STORAGE_KEY_CUSTOM_MODEL_ENABLED = 'customModelEnabled';
export const SESSION_STORAGE_KEY_SYSTEM_PROMPT = 'systemPrompt';

export const DEFAULT_MAX_TOKENS = 4000;
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_TOP_P = 1;
export const DEFAULT_SYSTEM_PROMPT = `You are a versatile and helpful AI writing assistant. Your goal is to help users generate, refine, and perfect their text.

Follow these guidelines:
- Provide helpful and constructive suggestions.
- Adapt your tone and style to the user's input.
- Be concise and to the point, unless asked for more detail.
- If the user asks for a specific format, follow it.
- If the user's request is ambiguous, ask for clarification.`;
export const MARKDOWN_COPY_BUTTON_MESSAGE = 'Copy Markdown';
export const MARKDOWN_OPTIONS_PROMPT_MESSAGE = 'Enter your prompt here...';
export const BUTTON_TEXT_SAVE = 'Save';
export const BUTTON_TEXT_CANCEL = 'Cancel';
export const BUTTON_TEXT_CLEAR = 'Clear';
export const BUTTON_TEXT_SEND = 'Send';
export const BUTTON_TEXT_STOP_GENERATING = 'Stop Generating';
export const BUTTON_TEXT_PROMPT_LIBRARY = 'Prompt Library';
export const BUTTON_TEXT_SETTINGS = 'Settings';
export const BUTTON_TEXT_DOCUMENT = 'Document';
export const BUTTON_TEXT_EXPORT = 'Export';

// Redundant constants previously commented out have been removed.

export const MODEL_CONFIG_SCHEMA_URL = 'https://json.schemastore.org/model-config.json';
export const DEFAULT_MODEL_CONFIG_PATH = './modelconfig.json';
export const SETTINGS_DEFAULT_INITIAL_VIEW = 'menu'; // "menu" or "chatParams" or "modelParams" or "systemPrompt" or "userProfile"
export const TEXTAREA_MAX_HEIGHT = 400;
export const CHAT_INPUT_MAX_HEIGHT = 200;
export const CHAT_DEFAULT_MAX_HEIGHT = 'calc(100vh - 200px)';
export const CHAT_DEFAULT_MIN_HEIGHT = '100px';

export const DEFAULT_CHAT_TEMPERATURE = 0.7;
export const DEFAULT_CHAT_TOP_P = 1;
export const DEFAULT_CHAT_MAX_TOKENS = 2048;

export const UI_TEXT = {
  modelSelectLabel: 'Select Model',
  customModelInputLabel: 'Custom Model Name',
  noModelAvailable: 'No models available for this provider.',
  apiKeyInputLabel: (providerName: string) => `Enter ${providerName} API Key`,
  apiUrlInputLabel: (providerName: string) => `${providerName} API URL`,
  apiProviderSelectLabel: 'API Provider',
  helpTextLabel: 'Help',
  modelParametersTitle: 'Model Parameters',
  chatParametersTitle: 'Chat Parameters',
  systemPromptTitle: 'System Prompt',
  userProfileTitle: 'User Profile',
  temperatureSliderLabel: 'Temperature',
  topPSliderLabel: 'Top P',
  maxTokensSliderLabel: 'Max Tokens',
  settingsModalTitle: 'Settings',
  promptLibraryModalTitle: 'Prompt Library',
  editPromptModalTitle: 'Edit Prompt',
  addPromptModalTitle: 'Add Prompt',
  deletePromptModalTitle: 'Delete Prompt',
  deleteConfirmationMessage: (promptName: string) => `Are you sure you want to delete the prompt "${promptName}"?`,
  saveChangesButton: 'Save Changes',
  closeButton: 'Close',
  addPromptButton: 'Add Prompt',
  searchPromptsInputPlaceholder: 'Search prompts...',
  promptNameInputLabel: 'Prompt Name',
  promptContentTextareaLabel: 'Prompt Content',
  savePromptButton: 'Save Prompt',
  deletePromptButton: 'Delete Prompt',
  editPromptButton: 'Edit',
  chatMessageSystem: 'System',
  chatMessageUser: 'User',
  chatMessageAssistant: 'Assistant',
  chatInputPlaceholder: 'Type your message...',
  copyCodeButton: 'Copy Code',
  copiedTooltip: 'Copied!',
  exportChatButton: 'Export Chat',
  clearChatButton: 'Clear Chat',
  showSystemPromptButton: 'Show System Prompt',
  hideSystemPromptButton: 'Hide System Prompt',
  errorMessage: 'An error occurred. Please try again.',
  loadingMessage: 'Loading...',
  emptyChatMessage: 'No messages yet. Start by typing a message below.',
  apiSettingsTitle: 'API Settings',
};

export const HELP_TEXT_API_KEY = 'Your API key for the selected provider.';
export const HELP_TEXT_API_URL = 'The API endpoint URL for the selected provider.';
export const HELP_TEXT_MODEL = 'The model to use for generation. Available models depend on the selected provider.';
export const HELP_TEXT_CUSTOM_MODEL = 'Enable this to use a custom model name not listed in the dropdown.';
export const HELP_TEXT_TEMPERATURE = 'Controls randomness. Lower values make the output more focused and deterministic. Higher values make it more creative.';
export const HELP_TEXT_TOP_P = 'Controls diversity via nucleus sampling. 0.1 means only tokens comprising the top 10% probability mass are considered.';
export const HELP_TEXT_MAX_TOKENS = 'The maximum number of tokens to generate. Requests can use up to this many tokens. The exact number of tokens generated will depend on the prompt and the model.';
export const HELP_TEXT_SYSTEM_PROMPT = 'The system prompt helps set the behavior of the assistant. It can be used to provide context, instructions, or persona.';

export const ERROR_MESSAGES = {
  API_KEY_REQUIRED: 'API key is required for this provider.',
  NETWORK_ERROR: 'A network error occurred. Please check your connection and try again.',
  GENERAL_API_ERROR: 'An error occurred while communicating with the API.',
  INVALID_JSON_RESPONSE: 'Received an invalid JSON response from the server.',
  STREAMING_NOT_SUPPORTED: 'Streaming is not supported for this provider or model.',
  MISSING_MODEL_AND_PROVIDER: 'Model and API provider are required.',
};

export const SUCCESS_MESSAGES = {
  SETTINGS_SAVED: 'Settings saved successfully.',
  PROMPT_SAVED: 'Prompt saved successfully.',
  PROMPT_DELETED: 'Prompt deleted successfully.',
  CHAT_EXPORTED: 'Chat exported successfully.',
  CHAT_CLEARED: 'Chat cleared successfully.',
};

export const WARNING_MESSAGES = {
  CLEAR_CHAT_CONFIRMATION: 'Are you sure you want to clear the chat? This action cannot be undone.',
};

export const INITIAL_CHAT_MESSAGE = {
  role: 'assistant',
  content: `Welcome to the ${APP_TITLE}! How can I help you today?`,
};

export const DEFAULT_PROMPTS = [
  { name: 'Summarize Text', content: 'Summarize the following text:\n\n{{text}}' },
  { name: 'Translate to English', content: 'Translate the following text to English:\n\n{{text}}' },
  { name: 'Explain Code', content: 'Explain the following code snippet:\n\n{{code}}' },
];

export const STORAGE_VERSION = 1; // Used for migrating settings if the structure changes
export const LOCAL_STORAGE_SETTINGS_KEY = `writingAssistantSettings_v${STORAGE_VERSION}`;
export const LOCAL_STORAGE_PROMPTS_KEY = `writingAssistantPrompts_v${STORAGE_VERSION}`;
export const LOCAL_STORAGE_CHAT_HISTORY_KEY = `writingAssistantChatHistory_v${STORAGE_VERSION}`;

// Key for storing the last used API provider and model
export const LAST_USED_API_INFO_KEY = 'lastUsedApiInfo';

// Default values for settings
export const DEFAULT_SETTINGS = {
  apiProvider: 'openai' as ApiProvider,
  apiUrl: API_PROVIDER_CONFIG.openai.url,
  apiKey: '',
  model: API_PROVIDER_CONFIG.openai.defaultModel || '',
  customModelEnabled: false,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  maxTokens: DEFAULT_CHAT_MAX_TOKENS,
  temperature: DEFAULT_CHAT_TEMPERATURE,
  topP: DEFAULT_CHAT_TOP_P,
  editorTheme: 'light', // 'light' or 'dark' or 'system'
  fontSize: 14,
  fontFamily: 'sans-serif',
  lineHeight: 1.5,
  showLineNumbers: true,
  autoSave: true,
  autoSaveInterval: 5000, // milliseconds
  showWordCount: true,
  showCharCount: true,
  showTokenCount: false, // Potentially expensive, so off by default
  enableSpellcheck: true,
  enableGrammarCheck: false, // May require external API or library
  uiLanguage: 'en', // 'en', 'zh', etc.
  darkMode: false, // true, false, or 'system'
  autoDetectTheme: true,
  lastUsedPrompt: null, // Store the last used prompt ID or object
};
