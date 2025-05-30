"use client";

import React, { useState } from 'react';
import { PromptStyle, WritingRequest } from '../lib/types';
import { generateContent, exportToMarkdown } from '../lib/api';
import MarkdownEditor from './MarkdownEditor';
import ApiSettings, { ApiProvider } from './ApiSettings';

const gongwenPromptStyle: PromptStyle = {
  style_name: "GongwenOfficialDocument",
  style_description: "Formal government document generation based on detailed user instructions.",
  style_summary: "Formal, structured document generation.",
  target_audience: { description: "", age_group: "", interests: [], education_level: "", language_proficiency: "" },
  language: {
    language_variety: "Chinese",
    word_choice: { clarity_level: 5, conciseness_level: 5, formality_level: 5, technical_depth: 3, idiom_usage: [] },
    sentence_structure: { complexity: 3, average_length: "20-30 words", variety: [] },
    grammar: { tense: "Formal", voice: "Formal", mood: "Formal" },
    rhetoric: [],
  },
  structure: {
    format_type: "Markdown",
    length_constraints: "", // 由用户在主prompt中提供
    paragraph_length: "",   // 由用户在主prompt中提供
    heading_usage: "",      // 由用户在主prompt中提供
    list_format: "Standard",
    quotation_style: "Standard",
    referencing_style: "Standard",
    hierarchy_pattern: "",  // 由用户在主prompt中提供
  },
  emotion: {
    tone: "Formal and Objective", // 默认基调
    emotional_arc: "",
    humor_level: 0,
    empathy_level: 0,
    expression_style: "Formal",
  },
  creative_strategy: {
    storytelling_elements: [],
    analogies_metaphors: "None",
    perspective: "Formal",
    call_to_action: "", // 由用户在主prompt中提供
    visual_appeal_notes: "",
  },
  cultural_references: { region: "China", common_knowledge: [], avoid_sensitive_topics: true },
  formatting_guidelines: { line_spacing: "", font_style: "Formal", emphasis_techniques: [], multimedia_integration: "" },
  ethical_considerations: { bias_avoidance: true, fact_checking: true, transparency: false },
  output_requirements: { file_format: "Markdown", language_specific_conventions: ["Standard Chinese official document practices"] },
  domain_specific_rules: {},
  // Ensure all PromptStyle fields are covered as per the definition in types.ts
  thinking: { logic_pattern: "Formal", depth: 4, rhythm: "Consistent" },
  uniqueness: { signature_phrases: [], imagery_system: [] },
  rhythm: { syllable_pattern: "Consistent", pause_pattern: "Formal", tempo: "Measured" },
  narrative: { time_sequence: "Chronological", narrator_attitude: "Objective" },
};

// API 提供商选项
// type ApiProvider = 'openai' | 'grok' | 'ollama' | 'custom';

// 默认 API URLs
const API_URLS: Record<ApiProvider, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  grok: 'https://api.grok.ai/v1/chat/completions',
  ollama: 'http://localhost:11434/api/generate',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  custom: ''
};

// API 提供商帮助信息
const API_HELP = {
  openai: '使用 OpenAI API，例如 GPT-4',
  grok: '使用 Grok API (X.AI)',
  ollama: '使用本地运行的 Ollama 服务',
  custom: '配置自定义 API 端点'
};

export default function WritingAssistant() {
  // API 设置
  const [apiProvider, setApiProvider] = useState<ApiProvider>('openai');
  const [llmApiUrl, setLlmApiUrl] = useState<string>(API_URLS.openai);
  const [llmApiKey, setLlmApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gpt-4'); // 添加模型设置
  
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponseDetails, setApiResponseDetails] = useState<string | null>(null);
  const [showApiSettings, setShowApiSettings] = useState<boolean>(true);

  // New state variables for Gongwen Assistant
  const [gongwenType, setGongwenType] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [mainTopic, setMainTopic] = useState<string>('');
  const [writingRequirements, setWritingRequirements] = useState<string>('');
  const [wordCountLimit, setWordCountLimit] = useState<string>(''); // 字数限制可以是文本，如 "800字左右"
  const [referenceTexts, setReferenceTexts] = useState<string[]>(['']); // 初始化为一个空范文输入框

  // 添加 Ollama 模型列表状态
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Functions to handle reference texts
  const handleReferenceTextChange = (index: number, value: string) => {
    const newTexts = [...referenceTexts];
    newTexts[index] = value;
    setReferenceTexts(newTexts);
  };

  const addReferenceText = () => {
    setReferenceTexts([...referenceTexts, '']);
  };

  const removeReferenceText = (index: number) => {
    if (referenceTexts.length > 1) {
      const newTexts = referenceTexts.filter((_, i) => i !== index);
      setReferenceTexts(newTexts);
    } else {
      // If it's the last one, just clear it instead of removing the input field
      setReferenceTexts(['']);
    }
  };

  // 获取可用的 Ollama 模型
  const fetchOllamaModels = async () => {
    try {
      setError(null); // 清除之前的错误
      console.log('开始获取 Ollama 模型列表...');
      
      // 使用代理接口而不是直接调用本地 Ollama API
      // 这可以避免浏览器的 CORS 限制
      const response = await fetch('/api/proxy/ollama-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ollamaUrl: 'http://localhost:11434/api/tags'
        }),
        // 添加超时设置以避免长时间等待
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`获取模型列表失败: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`无法获取模型列表: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('获取到的 Ollama 模型数据:', data);
      
      // 检查数据格式，处理可能的不同结构
      let modelsList: string[] = [];
      
      if (data.models && Array.isArray(data.models)) {
        modelsList = data.models.filter((model: unknown) => typeof model === 'string') as string[];
      } else if (data.names && Array.isArray(data.names)) {
        modelsList = data.names.filter((model: unknown) => typeof model === 'string') as string[];
      }
      
      console.log('处理后的模型列表:', modelsList);
      
      if (modelsList.length > 0) {
        // 为了确保UI更新，先清空后设置
        setAvailableModels([]);
        setTimeout(() => {
          setAvailableModels(modelsList);
          
          // 如果当前模型不在列表中，则选择第一个模型
          if (!modelsList.includes(model)) {
            setModel(modelsList[0]);
          }
        }, 10);
        
        console.log(`成功获取到 ${modelsList.length} 个 Ollama 模型`);
      } else {
        console.warn('未找到 Ollama 模型列表');
        setAvailableModels([]);
        // 保持默认模型名称 'llama2'
      }
      
      return modelsList; // 返回处理后的模型列表
    } catch (error) {
      console.error('获取模型列表失败:', error);
      setAvailableModels([]); // 清空模型列表，使用默认值
      
      // 根据错误类型提供更具体的错误信息
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('无法连接到 Ollama 服务，请确保: 1) Ollama 已安装并运行 2) 服务地址正确');
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        setError('获取模型列表超时，请检查 Ollama 服务是否响应');
      } else {
        setError('无法获取 Ollama 模型列表，请确保 Ollama 服务正在运行');
      }
      
      return []; // 返回空数组，避免后续处理出错
    }
  };

  // 当 API 提供商变化时更新 URL 和模型
  const handleApiProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as ApiProvider;
    setApiProvider(provider);
    
    // 如果是预设的提供商，自动填充 URL
    if (provider !== 'custom') {
      setLlmApiUrl(API_URLS[provider]);
    }
    
    // 根据提供商设置默认模型
    if (provider === 'grok') {
      setModel('grok-3-latest');
    } else if (provider === 'ollama') {
      setModel('llama2');
      // 清空 API Key，因为 Ollama 不需要
      setLlmApiKey('');
    } else if (provider === 'openai') {
      setModel('gpt-4');
    } else if (provider === 'deepseek') {
      setLlmApiUrl('https://api.deepseek.com/v1/chat/completions');
      setModel('deepseek-chat');
    }
    
    // 重置错误
    setError(null);
    setApiResponseDetails(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setApiResponseDetails(null); // 使用 setApiResponseDetails(null) 而不是 setApiResponseDetails('')
    setOutput('');

    // 1. 构建公文笔杆子角色描述 (用户提供的固定部分)
    const rolePrompt = `# Role：公文笔杆子

## Background :
我是一位在政府机关工作多年、经验丰富的公文写作专家（“笔杆子”）。我精通各类公文（如通知、报告、请示、函、会议纪要、讲话稿等）的格式、语体和行文逻辑，对政府机关的组织架构和工作流程有深入的理解和把握。

## Attention:
公文写作的质量直接影响政令的传达和执行效率。我将严格遵循您提供的结构化信息进行创作，确保内容精准、格式规范、语体得当。请您务必清晰、准确地填写下面的【核心任务指令】。
## Profile:
  - version: 1.0
  - language: 中文
  - description: 我是一位专业的公文写作专家，致力于根据您提供的结构化指令，为您撰写出专业、规范、高质量的各类公文。
## Skills:
  - 精通各类公文格式与标准。
  - 深刻理解政府机关行文逻辑与语境。
  - 能够根据不同的受文对象和目的，调整写作口吻与风格。
  - 具备强大的信息整合与结构化写作能力。
  - 能够进行逻辑严谨、条理清晰的论述。
## Goals:
  - 接收并理解用户在【核心任务指令】中提供的全部信息。
  - 严格按照指令要求，生成一篇结构完整、要素齐全、符合规范的公文。
  - 确保输出的公文内容准确、措辞严谨、逻辑清晰、可读性强。
  - 如果用户提供了[参考范文]，我将尽力模仿其风格、结构和用语。
## Constrains:
  - 我只在您提供了下方【核心任务指令】中的所有必填信息后，才开始执行写作任务。
  - 我不会创作任何违反法律法规或不符合基本事实的内容。
  - 输出内容严格限制在公文写作领域，不进行闲聊或回答与任务无关的问题。
## Workflow:
1.  **问候与引导**：首先，我会向您问好，并明确告知您需要填写下面的【核心任务指令】。
2.  **指令确认**：我会等待您将所有必填信息填写完整。
3.  **构思与起草**：在您提供完整指令后，我将根据这些信息进行构思，并开始起草公文。
4.  **输出交付**：最后，我将输出一篇完整的公文给您。
-----
`;

    // 2. 构建核心任务指令 (根据用户输入动态生成)
    let userInstructions = "### 核心任务指令 (请复制并填写)\n请您复制以下模板，并根据您的实际需求填写详细信息，这将直接决定我最终输出的公文质量。\n```\n";
    userInstructions += `  - **公文类型 (必填)**: ${gongwenType || '（未填写）'}\n`;
    userInstructions += `  - **受文对象 (必填)**: ${recipient || '（未填写）'}\n`;
    userInstructions += `  - **核心主题 (必填)**: ${mainTopic || '（未填写）'}\n`;
    userInstructions += `  - **写作要求 (必填)**: ${writingRequirements || '（未填写）'}\n`;
    userInstructions += `  - **字数限制 (选填)**: ${wordCountLimit || '（未填写）'}\n`;
    
    const validReferenceTexts = referenceTexts.filter(text => text.trim() !== '');
    if (validReferenceTexts.length > 0) {
      userInstructions += `  - **参考范文 (选填)**:\n`;
      validReferenceTexts.forEach((text, index) => {
        userInstructions += `    --- 范文 ${index + 1} ---\n${text}\n`;
      });
    } else {
      userInstructions += `  - **参考范文 (选填)**: （未提供）\n`;
    }
    userInstructions += "```\n\n";
    
    // 3. 初始化问候语 (用户提供的固定部分) - AI应在此之后开始其响应
    const initializationPrompt = `## Initialization
	您好，我是您的专属“公文笔杆子”。为了给您撰写出最精准、最规范的公文，请您复制上方的【核心任务指令】模板，并详细填写各项信息。期待您的指令。`

    // 组合最终的完整Prompt
    const fullPrompt = rolePrompt + userInstructions + initializationPrompt;

    // 这里，我们的 fullPrompt 会被注入到 ${topic} 的位置。
    
    const request: WritingRequest = {
      promptStyle: gongwenPromptStyle, // 使用简化的style
      topic: fullPrompt,             // 完整指令作为topic
      keywords: [],                  // keywords不再由用户直接输入，可为空
      wordCount: parseInt(wordCountLimit) || 0, // 使用用户输入的字数限制
      llmApiUrl: llmApiUrl,
      llmApiKey: llmApiKey,
      model: model,
      apiProvider: apiProvider, // Ensure apiProvider is part of WritingRequest
    };
    
    // 检查API密钥 (如果不是Ollama)
    if (apiProvider !== 'ollama' && !llmApiKey) {
      setError(`使用 ${apiProvider === 'openai' ? 'OpenAI' : apiProvider === 'grok' ? 'Grok' : apiProvider === 'deepseek' ? 'DeepSeek' : '自定义'} API 需要提供有效的 API 密钥`);
      setIsLoading(false);
      return;
    }

    console.log("发送给AI的完整Prompt预览 (实际包含Style JSON):", fullPrompt); // 用于调试

    try {
      const response = await generateContent(request); // generateContent内部会调用formatPromptTemplate
      
      if (response.error) {
        setError(response.error);
        // setApiResponseDetails(response.details || '请查看浏览器控制台以获取更多错误详情。'); // 假设details是string
      } else if (!response.content || response.content.trim() === '') {
        setError('API 返回了空内容。这可能是由于 API 响应格式不符合预期。');
        // setApiResponseDetails('请尝试切换 API 提供商或检查 API 密钥和 URL 是否正确。');
      } else {
        setOutput(response.content);
        // setApiResponseDetails(response.details || null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成内容时发生未知错误';
      setError(errorMessage);
      // setApiResponseDetails('请检查浏览器控制台以获取更多错误详情，或尝试使用不同的 API 提供商。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (output) {
      exportToMarkdown(output);
    }
  };

  // const toggleDebugInfo = () => { 
  //  // This function is no longer needed as showDebugInfo and its corresponding button are removed.
  // };

  const toggleApiSettings = () => {
    setShowApiSettings(!showApiSettings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">公文写作助手</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">根据您的结构化指令，撰写专业、规范的各类公文。</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                写作设置
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* LLM API Settings */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                  <div className="flex justify-between items-center cursor-pointer" onClick={toggleApiSettings}>
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1H4v8a1 1 0 001 1h10a1 1 0 001-1V6zM4 4a1 1 0 011-1h10a1 1 0 011 1v1H4V4z" clipRule="evenodd" />
                      </svg>
                      API 设置
                    </h3>
                    <div className="flex items-center space-x-2">
                      {/* The debug button that was here has been removed. */}
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${showApiSettings ? 'transform rotate-180' : ''}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {showApiSettings && (
                    <ApiSettings 
                      showSettings={true}
                      toggleSettings={() => {}} // 这里已经控制显示了，所以传入空函数
                      apiProvider={apiProvider}
                      setApiProvider={(provider) => {
                        setApiProvider(provider);
                        // 当更改提供商时，直接更新URL（使用预定义的默认值）
                        if (provider === 'openai') {
                          setLlmApiUrl('https://api.openai.com/v1/chat/completions');
                          setModel('gpt-4');
                        } else if (provider === 'grok') {
                          setLlmApiUrl('https://api.grok.ai/v1/chat/completions');
                          setModel('grok-3-latest');
                        } else if (provider === 'ollama') {
                          setLlmApiUrl('http://localhost:11434/api/generate');  // 确保使用 /api/generate 端点
                          setModel('llama2');
                          // 清空 API Key，因为 Ollama 不需要
                          setLlmApiKey('');
                        } else if (provider === 'deepseek') {
                          setLlmApiUrl('https://api.deepseek.com/v1/chat/completions');
                          setModel('deepseek-chat');
                        }
                        // 重置错误
                        setError(null);
                        setApiResponseDetails(null);
                      }}
                      apiUrl={llmApiUrl}
                      setApiUrl={setLlmApiUrl}
                      apiKey={llmApiKey}
                      setApiKey={setLlmApiKey}
                      model={model}
                      setModel={setModel}
                      availableModels={availableModels}
                      fetchModels={fetchOllamaModels}
                    />
                  )}
                </div>

                {/* New Gongwen Input Fields */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                  <h3 className="font-medium text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    核心任务指令
                  </h3>
                  <div>
                    <label htmlFor="gongwenType" className="block text-sm font-medium text-gray-700 mb-1">公文类型 (必填)</label>
                    <input type="text" id="gongwenType" value={gongwenType} onChange={(e) => setGongwenType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                  </div>
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">受文对象 (必填)</label>
                    <input type="text" id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                  </div>
                  <div>
                    <label htmlFor="mainTopic" className="block text-sm font-medium text-gray-700 mb-1">核心主题 (必填)</label>
                    <input type="text" id="mainTopic" value={mainTopic} onChange={(e) => setMainTopic(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                  </div>
                  <div>
                    <label htmlFor="writingRequirements" className="block text-sm font-medium text-gray-700 mb-1">写作要求 (必填)</label>
                    <textarea id="writingRequirements" value={writingRequirements} onChange={(e) => setWritingRequirements(e.target.value)} rows={4} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required></textarea>
                  </div>
                  <div>
                    <label htmlFor="wordCountLimit" className="block text-sm font-medium text-gray-700 mb-1">字数限制 (选填)</label>
                    <input type="text" id="wordCountLimit" value={wordCountLimit} onChange={(e) => setWordCountLimit(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  
                  {/* Reference Texts Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">参考范文 (选填，每篇范文粘贴在一个文本框内)</h4>
                    {referenceTexts.map((text, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <textarea
                          value={text}
                          onChange={(e) => handleReferenceTextChange(index, e.target.value)}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`范文 ${index + 1}`}
                        />
                        {referenceTexts.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeReferenceText(index)}
                            className="p-2 text-red-500 hover:text-red-700"
                            aria-label="移除范文"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={addReferenceText}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      增加一篇范文
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-6 rounded-md font-medium disabled:opacity-60 disabled:from-gray-400 disabled:to-gray-500 transition duration-150 ease-in-out transform hover:scale-105 shadow-md"
                    disabled={isLoading || (apiProvider !== 'ollama' && !llmApiKey)}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        生成中...
                      </span>
                    ) : '生成内容'}
                  </button>
                  <a
                    href="/grok"
                    className="bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    API 测试页面
                  </a>
                </div>
              </form>
            </div>
          </div>
        
          {/* Output Section */}
          <div>
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  生成结果
                </h2>
                {output && (
                  <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-4 rounded-md text-sm flex items-center transition duration-150 ease-in-out shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    导出 Markdown
                  </button>
                )}
              </div>
              
              <div className="flex-grow">
                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 mb-4">
                    <div className="font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      错误: {error}
                    </div>
                    {apiResponseDetails && (
                      <div className="mt-2 text-sm pl-7">{apiResponseDetails}</div>
                    )}
                  </div>
                )}
                
                {isLoading ? (
                  <div className="flex justify-center items-center bg-gray-50 border border-gray-200 rounded-lg min-h-[400px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600 mb-2">正在生成内容，请稍候...</p>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto">这可能需要几秒到几分钟的时间，取决于 API 响应速度和内容长度</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full rounded-lg">
                    <MarkdownEditor 
                      initialContent={output} 
                      onContentChange={setOutput} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 