"use client";

import { WritingRequest, ApiResponse, PromptStyle, PolishRequest, PolishResponse } from './types';

export async function generateContent(request: WritingRequest): Promise<ApiResponse> {
  try {
    const { promptStyle, topic, keywords, wordCount, llmApiUrl, llmApiKey, model } = request;
    
    // Format the prompt template
    const promptTemplate = formatPromptTemplate(promptStyle, topic, keywords, wordCount);
    
    // Detect API provider type from URL (simple detection)
    const isGrokApi = llmApiUrl.includes('grok') || llmApiUrl.includes('xai');
    const isOllamaApi = llmApiUrl.includes('ollama') || llmApiUrl.includes('11434');
    
    // Prepare request body based on API provider
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
    } else if (isGrokApi) {
      // Grok API format
      requestBody = {
        messages: [
          {
            role: 'user',
            content: promptTemplate
          }
        ],
        model: "grok-2-latest",
        temperature: 0.7,
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
        temperature: 0.7
      };
    }
    
    // Prepare headers based on API provider
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add appropriate authorization header if not Ollama
    if (!isOllamaApi) {
      headers['Authorization'] = `Bearer ${llmApiKey}`;
    }

    console.log('准备发送请求到:', llmApiUrl);
    console.log('请求头:', JSON.stringify(headers, null, 2).replace(llmApiKey, '[REDACTED]'));
    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    
    // 使用本地 API 代理来避免 CORS 问题
    try {
      // 尝试使用本地代理
      const proxyResponse = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl: llmApiUrl,
          headers,
          body: requestBody,
          isOllama
        })
      });
      
      if (!proxyResponse.ok) {
        const errorData = await proxyResponse.json().catch(() => ({ error: { message: `代理服务错误: ${proxyResponse.status}` } }));
        throw new Error(errorData.error?.message || `代理服务错误: ${proxyResponse.status}: ${proxyResponse.statusText}`);
      }
      
      const data = await proxyResponse.json();
      console.log('API 响应:', data);
      
      // 保存原始响应用于调试
      console.log('原始 API 响应:', JSON.stringify(data, null, 2));
      
      // 以与测试页面相同的方式尝试不同方法提取内容
      let content = '';
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        // 标准格式
        content = data.choices[0].message.content;
        console.log('从 choices[0].message.content 提取内容');
      } else if (data.message && data.message.content) {
        // 替代格式1
        content = data.message.content;
        console.log('从 message.content 提取内容');
      } else if (data.content) {
        // 替代格式2
        content = data.content;
        console.log('从 content 提取内容');
      } else if (data.output) {
        // 替代格式3
        content = data.output;
        console.log('从 output 提取内容');
      } else if (data.response) {
        // 替代格式4
        content = data.response;
        console.log('从 response 提取内容');
      } else if (data.text) {
        // 替代格式5
        content = data.text;
        console.log('从 text 提取内容');
      } else if (typeof data === 'string') {
        // 可能整个响应就是文本
        content = data;
        console.log('使用整个响应作为内容');
      } else if (data.error) {
        // 有明确的错误信息
        throw new Error(`API 错误: ${data.error.message || JSON.stringify(data.error)}`);
      } else {
        // 无法解析的响应
        throw new Error(`无法从API响应中提取内容: ${JSON.stringify(data)}`);
      }
      
      return { content };
    } catch (proxyError) {
      console.error('代理请求失败:', proxyError);
      throw proxyError;
    }
  } catch (error) {
    console.error('生成内容错误:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

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
  return `${styleJson}

---
遵循以上风格为我编写一篇${wordCount}字的文章，主题是${topic}，输出格式为markdown。
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
    const { originalText, llmApiUrl, llmApiKey, model, polishType = 'standard' } = request;
    
    if (!originalText || originalText.trim() === '') {
      return {
        originalText: '',
        polishedText: '',
        diffMarkup: '',
        error: '请提供需要润色的文章内容'
      };
    }
    
    // 构建提示词
    const polishTypePrompt = {
      'standard': '请对以下文章进行语言润色，修正语法错误，提高表达流畅度，使文章更易读，但保持原意不变。',
      'academic': '请对以下学术文章进行润色，使用更专业、正式的学术用语，修正语法问题，保持学术严谨性。',
      'business': '请对以下商业文档进行润色，使用更专业的商业术语，提高文档的清晰度和说服力。',
      'creative': '请对以下创意文章进行润色，使表达更生动、有趣，增强文章的感染力和吸引力，但保持原意。'
    }[polishType];
    
    const promptTemplate = `${polishTypePrompt}
    
    请修改以下文章，并明确指出修改了哪些内容(可以用"【原文】...【修改】..."的格式标注)：
    
    ${originalText}
    
    只返回润色后的文章内容，不需要其他解释。`;
    
    // Detect API provider type from URL (simple detection)
    const isGrokApi = llmApiUrl.includes('grok') || llmApiUrl.includes('xai');
    const isOllamaApi = llmApiUrl.includes('ollama') || llmApiUrl.includes('11434');
    
    // Prepare request body based on API provider
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
    } else if (isGrokApi) {
      // Grok API format
      requestBody = {
        messages: [
          {
            role: 'user',
            content: promptTemplate
          }
        ],
        model: "grok-2-latest",
        temperature: 0.7,
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
    
    // 如果有API密钥，添加授权头
    if (llmApiKey) {
      headers['Authorization'] = `Bearer ${llmApiKey}`;
    }
    
    // 发送请求到代理
    const proxyResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUrl: llmApiUrl,
        headers,
        method: 'POST',
        body: requestBody,
        isOllama
      }),
    });
    
    if (!proxyResponse.ok) {
      throw new Error(`代理请求失败: ${proxyResponse.status}`);
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