// API Endpoint URLs
export const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'; // Or a more specific one if known
export const OLLAMA_API_URL = 'http://localhost:11434/api/generate'; // Ensure this matches ApiSettings.tsx
export const GOOGLE_AI_STUDIO_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'; // Example for Gemini
export const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'; // From ApiSettings.tsx
export const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'; // From ApiSettings.tsx

// Help URLs (add if PlatformGeneratorUI attempts to import them, otherwise optional for now)
// For now, focusing on the API URLs as per the error message.
// export const OPENAI_HELP_URL = 'https://platform.openai.com/docs/overview';
// export const ANTHROPIC_HELP_URL = 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api';
// export const OLLAMA_HELP_URL = 'https://ollama.ai/library';
// export const GOOGLE_AI_STUDIO_HELP_URL = 'https://ai.google.dev/docs';
// export const GROK_HELP_URL = 'https://x.ai/product'; // Placeholder
// export const DEEPSEEK_HELP_URL = 'https://www.deepseek.com/'; // Placeholder
