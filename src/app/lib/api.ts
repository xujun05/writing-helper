"use client";

import { WritingRequest, ApiResponse, PromptStyle, PolishRequest, PolishResponse } from './types';
import { useCallback } from 'react';
import { useApiSettings } from '../contexts/ApiSettingsContext'; // Adjust path as necessary
import { API_PROVIDER_CONFIG, ApiProvider } from './constants'; // Adjust path as necessary

// Renamed original generateContent to _internalGenerateContent
// Added apiProvider to its parameters for explicit provider logic if needed beyond URL detection
async function _internalGenerateContent(request: WritingRequest): Promise<ApiResponse> {
  try {
    const { promptStyle, topic, keywords, wordCount, llmApiUrl, llmApiKey, model, apiProvider } = request;
    
    // Format the prompt template
    const promptTemplate = formatPromptTemplate(promptStyle, topic, keywords, wordCount);
    
    // Use the passed apiProvider to determine behavior, fallback to URL detection if necessary
    const providerType = apiProvider || (llmApiUrl.includes('ollama') ? 'ollama' : 
                                       llmApiUrl.includes('grok') || llmApiUrl.includes('xai') ? 'grok' :
                                       llmApiUrl.includes('deepseek') ? 'deepseek' : 
                                       llmApiUrl.includes('anthropic') ? 'anthropic' :
                                       llmApiUrl.includes('google') ? 'google' : 'openai'); // Default to openai or custom

    const apiUrl = llmApiUrl;
    let requestBody: Record<string, unknown>;
    let isOllamaPayload = false; // Specific flag for Ollama's unique payload for /api/generate

    // Construct request body based on providerType
    switch (providerType) {
      case 'ollama':
        // Note: Ollama has /api/generate (prompt string) and /api/chat (messages array)
        // This logic assumes /api/generate if a simple prompt string is used,
        // or /api/chat if messages are structured.
        // For simplicity, current promptTemplate is a string, matching /api/generate.
        requestBody = {
          model: model || API_PROVIDER_CONFIG.ollama.defaultModel || 'llama2',
          prompt: promptTemplate,
          stream: false,
        };
        isOllamaPayload = true; // Mark for proxy if special handling is needed for /api/generate
        console.log('Using Ollama API format, generate content request:', JSON.stringify(requestBody));
        break;
      case 'grok':
        requestBody = {
          messages: [{ role: 'user', content: promptTemplate }],
          model: model || API_PROVIDER_CONFIG.grok.defaultModel || 'grok-3-latest',
          temperature: 0.7,
          stream: false,
        };
        break;
      case 'deepseek':
        requestBody = {
          model: model || API_PROVIDER_CONFIG.deepseek.defaultModel || 'deepseek-chat',
          messages: [{ role: 'user', content: promptTemplate }],
          temperature: 0.7,
          stream: false,
        };
        break;
      case 'anthropic':
        requestBody = {
          model: model || API_PROVIDER_CONFIG.anthropic.defaultModel || 'claude-3-opus-20240229',
          messages: [{ role: 'user', content: promptTemplate }],
          max_tokens: request.wordCount ? request.wordCount * 5 : 4000, // Anthropic requires max_tokens
          temperature: 0.7,
        }
        break;
      case 'google': // Gemini
         requestBody = {
          contents: [{ parts: [{ text: promptTemplate }] }],
          // generationConfig can be added here if needed (temperature, maxOutputTokens, etc.)
        };
        // Note: Google Gemini might not use 'model' in the body if it's part of the URL.
        // The URL itself often specifies the model:
        // https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
        // or https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent
        break;
      case 'openai':
      case 'custom': // Assuming custom might follow OpenAI format
      default:
        requestBody = {
          model: model || API_PROVIDER_CONFIG.openai.defaultModel || 'gpt-4',
        messages: [
          messages: [{ role: 'user', content: promptTemplate }],
          temperature: 0.7,
        };
        break;
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (providerType !== 'ollama' && providerType !== 'custom' && llmApiKey) { // Custom might not need API key
      headers['Authorization'] = `Bearer ${llmApiKey}`;
    } else if (providerType === 'custom' && llmApiKey) { // For custom, if key is provided, use it
       headers['Authorization'] = `Bearer ${llmApiKey}`;
    }
    // For Google, API key is often part of the URL query string `?key=YOUR_API_KEY`
    // The proxy should handle this if targetUrl already includes it, or it needs to be appended here.
    // Current proxy structure might need adjustment for query param keys.
    // For simplicity, assuming key is in header if not ollama/custom.

    console.log('Preparing to send request to proxy for:', apiUrl);
    console.log('Provider type:', providerType);
    console.log('Request headers (API key redacted for non-Ollama/Custom):', 
                JSON.stringify(headers, null, 2).replace(llmApiKey && providerType !== 'ollama' ? llmApiKey : 'DUMMY_KEY_FOR_REPLACE', '[REDACTED]'));
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const proxyResponse = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetUrl: apiUrl,
        headers,
        body: requestBody,
        isOllama: isOllamaPayload, // Use the specific flag for Ollama /api/generate payload
      }),
    });

    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text();
      console.error('Proxy service error response text:', errorText);
      const errorData = JSON.parse(errorText || "{}"); // Try to parse, fallback to empty obj
      throw new Error(errorData.error?.message || `Proxy service error: ${proxyResponse.status} ${proxyResponse.statusText}`);
    }

    const data = await proxyResponse.json();
    console.log('Received API response via proxy:', data);

    let content = '';
    // Adapt response parsing based on providerType more explicitly
    switch (providerType) {
      case 'openai':
      case 'deepseek':
      case 'grok': // Grok's actual response might differ, this is based on typical chat completion
      case 'custom': // Assuming custom might follow OpenAI structure
        if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
          content = data.choices[0].message.content;
        }
        break;
      case 'ollama':
        if (data.response) { // For /api/generate (prompt string)
          content = data.response;
        } else if (data.message && data.message.content) { // For /api/chat (messages array)
          content = data.message.content;
        }
        break;
      case 'anthropic':
         if (data.content && Array.isArray(data.content) && data.content.length > 0 && data.content[0].text) {
            content = data.content[0].text;
        } else if (typeof data.content === 'string') { // Less common, but possible
            content = data.content;
        }
        break;
      case 'google': // Gemini
        if (data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content && data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0 && data.candidates[0].content.parts[0].text) {
          content = data.candidates[0].content.parts[0].text;
        }
        break;
      default:
        // Fallback for any other or unhandled structures
        if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
            content = data.choices[0].message.content;
        } else if (data.message && data.message.content) {
            content = data.message.content;
        } else if (data.content) {
            content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
        } else if (data.response) {
            content = data.response;
        } else if (data.text) {
            content = data.text;
        } else if (typeof data === 'string') {
            content = data;
        }
        break;
    }
     if (data.error) { // Handle explicit error messages from API
        throw new Error(`API error for ${providerType}: ${data.error.message || JSON.stringify(data.error)}`);
    }
    if (!content && providerType !== 'google') { // Google might have valid empty content if generation safety filters trigger
        console.warn(`Could not extract content for provider ${providerType} from response:`, data);
        // Do not throw error for empty content, but log it. Let calling component decide.
        // For now, returning stringified data for debugging if content is empty.
        // This behavior might need refinement.
        content = `No standard content field found. Raw response: ${JSON.stringify(data)}`;
    }


    return { content };
  } catch (error) {
    console.error('Error in _internalGenerateContent:', error);
    return { content: '', error: error instanceof Error ? error.message : 'Unknown error in API utility' };
  }
}

// The old generateContent function has been removed.
// Components should now use useApiConfiguredGenerator.

export const useApiConfiguredGenerator = (apiProviderType: ApiProvider) => {
  const { getProviderSetting } = useApiSettings();

  const configuredGenerateContent = useCallback(async (
    request: Omit<WritingRequest, 'llmApiKey' | 'llmApiUrl' | 'model' | 'apiProvider'>
  ): Promise<ApiResponse> => {
    const globalSetting = getProviderSetting(apiProviderType);
    const providerConfig = API_PROVIDER_CONFIG[apiProviderType];

    if (!providerConfig) {
      return { content: '', error: `Invalid API provider type: ${apiProviderType}` };
    }

    const apiKey = globalSetting?.apiKey || '';
    const apiUrl = globalSetting?.customUrl || providerConfig.url;
    // Model precedence: User's choice in component (if passed in `request.model`), 
    // then global setting, then provider default from API_PROVIDER_CONFIG
    // The `request` for `configuredGenerateContent` doesn't include `model`, so it's global then config.
    const modelToUse = globalSetting?.defaultModel || providerConfig.defaultModel || '';

    if (!apiUrl) {
        return { content: '', error: `API URL for ${apiProviderType} is not configured.`};
    }
    // For 'custom' provider, model might not be mandatory if the custom endpoint doesn't require it.
    // For 'google', model is part of URL path, so `modelToUse` here is for body if needed or logging.
    if (!modelToUse && apiProviderType !== 'custom' && apiProviderType !== 'google') { 
        return { content: '', error: `Model for ${apiProviderType} is not configured.`};
    }
    // 'custom' provider might not require an API key, or it might be part of custom URL or headers.
    if (apiProviderType !== 'ollama' && apiProviderType !== 'custom' && !apiKey) {
        return { content: '', error: `API Key for ${apiProviderType} is not configured.`};
    }


    const fullRequest: WritingRequest = {
      ...request, // Contains promptStyle, topic, keywords, wordCount
      llmApiKey: apiKey,
      llmApiUrl: apiUrl,
      model: modelToUse,
      apiProvider: apiProviderType,
    };
    
    return _internalGenerateContent(fullRequest);

  }, [apiProviderType, getProviderSetting]);

  return configuredGenerateContent;
};


export function formatPromptTemplate(
  style: PromptStyle, 
  topic: string, 
  keywords: string[], 
  wordCount: number
): string {
  // Convert the style object to a formatted JSON string
  const styleJson = JSON.stringify(style, null, 4);
  
  // Format the keywords as a comma-separated list
  const keywordsStr = keywords.join('、');
  
  // Construct the complete prompt
  // Ensure wordCount is handled appropriately if it's 0 or not provided by user
  const wordCountText = wordCount > 0 ? `${wordCount}字` : '适当长度';
  return `${styleJson}

---
遵循以上风格为我编写一篇${wordCountText}的文章，主题是${topic}，输出格式为markdown。
关键词：${keywordsStr}`;
}

export function exportToMarkdown(content: string): void {
  // Create a blob with the content
  const blob = new Blob([content], { type: 'text/markdown' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `writing_${new Date().toISOString().slice(0, 10)}.md`;
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 计算两段文本的差异并生成带有HTML标记的差异
function generateDiffMarkup(original: string, polished: string): string {
  const diffLines = [];
  const originalLines = original.split('\n');
  const polishedLines = polished.split('\n');
  
  // 非常简单的差异比较 - 行级别
  let i = 0, j = 0;
  
  while (i < originalLines.length || j < polishedLines.length) {
    const origLine = i < originalLines.length ? originalLines[i] : '';
    const polishLine = j < polishedLines.length ? polishedLines[j] : '';
    
    if (origLine === polishLine) {
      // 行相同，不做任何标记
      diffLines.push(origLine);
      i++;
      j++;
    } else {
      // 行不同，标记为已修改
      // 判断行是否被删除、添加或修改
      if (j + 1 < polishedLines.length && originalLines[i] === polishedLines[j + 1]) {
        // 添加行
        diffLines.push(`<ins class="diff-add">${polishLine}</ins>`);
        j++;
      } else if (i + 1 < originalLines.length && polishedLines[j] === originalLines[i + 1]) {
        // 删除行
        diffLines.push(`<del class="diff-del">${origLine}</del>`);
        i++;
      } else {
        // 修改行
        // 简单标记整行
        diffLines.push(`<del class="diff-del">${origLine}</del>`);
        diffLines.push(`<ins class="diff-add">${polishLine}</ins>`);
        i++;
        j++;
      }
    }
  }
  
  return diffLines.join('\n');
}

// 文章润色API
export async function polishContent(request: PolishRequest): Promise<PolishResponse> {
  try {
    const { originalText, llmApiUrl, llmApiKey, model, polishType } = request;
    
    // 生成润色提示词
    const promptTemplate = `请帮我润色以下文章，保持主要内容不变，但提升表达效果和语言流畅度。${polishType === 'academic' 
      ? '使用更加学术和专业的语言。' 
      : polishType === 'business' 
        ? '使用更加商业和专业的语言。' 
        : polishType === 'creative' 
          ? '使用更加生动和有创意的语言，增加趣味性和吸引力。' 
          : '使用更加流畅和自然的语言。'}
    
以下是原文：
${originalText}

请提供润色后的文本。只返回润色后的完整文本，不要添加任何说明或解释。`;

    // 确定API提供商类型
    const isGrokApi = llmApiUrl.includes('grok') || llmApiUrl.includes('xai');
    const isOllamaApi = llmApiUrl.includes('ollama') || llmApiUrl.includes('11434');
    const isDeepSeekApi = llmApiUrl.includes('deepseek');
    
    // URL 由前端组件和代理处理，这里直接使用
    const apiUrl = llmApiUrl;
    
    // 根据API提供商准备不同的请求格式
    let requestBody: Record<string, unknown>;
    let isOllama = false;
    
    if (isOllamaApi) {
      // Ollama API format
      requestBody = {
        model: model || 'llama2',
        prompt: promptTemplate,
        stream: false
      };
      isOllama = true;
      console.log('使用 Ollama API 格式, 润色请求:', JSON.stringify(requestBody));
    } else if (isGrokApi) {
      // Grok API format
      requestBody = {
        messages: [
          {
            role: 'user',
            content: promptTemplate
          }
        ],
        model: "grok-3-latest",
        temperature: 0.7,
        stream: false
      };
    } else if (isDeepSeekApi) {
      // DeepSeek API format (与 OpenAI 兼容但有自己的模型名称)
      requestBody = {
        model: model || 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: promptTemplate
          }
        ],
        temperature: 0.3,
        stream: false
      };
    } else {
      // OpenAI-compatible API format (default)
      requestBody = {
        model: model || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: promptTemplate
          }
        ],
        temperature: 0.3,
        stream: false
      };
    }
    
    // 创建代理请求以避免CORS问题
    const proxyUrl = '/api/proxy';
    
    // 设置请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // 如果有API密钥且不是 Ollama，添加授权头
    if (llmApiKey && !isOllamaApi) {
      headers['Authorization'] = `Bearer ${llmApiKey}`;
    }
    
    console.log('润色请求目标:', apiUrl);
    console.log('请求头:', JSON.stringify(headers, null, 2).replace(llmApiKey || '', '[REDACTED]'));
    
    // 发送请求到代理
    try {
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl: apiUrl,
          headers,
          body: requestBody,
          isOllama
        }),
      });
      
      if (!proxyResponse.ok) {
        const errorData = await proxyResponse.json();
        throw new Error(errorData.error?.message || `代理服务错误: ${proxyResponse.status}`);
      }
      
      const data = await proxyResponse.json();
      console.log('API 响应:', data);
      
      // 提取内容
      let polishedText = '';
      
      if (data.choices && data.choices.length > 0) {
        polishedText = data.choices[0].message.content;
      } else if (data.content) {
        polishedText = data.content;
      } else if (data.response) {
        polishedText = data.response;
      } else {
        throw new Error('无法从API响应中提取内容');
      }
      
      // 生成差异标记
      const diffMarkup = generateDiffMarkup(originalText, polishedText);
      
      return {
        originalText,
        polishedText,
        diffMarkup
      };
    } catch (proxyError) {
      console.error('代理请求失败:', proxyError);
      throw proxyError;
    }
  } catch (error) {
    console.error('润色请求失败:', error);
    return {
      originalText: request.originalText,
      polishedText: '',
      diffMarkup: '',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
} 