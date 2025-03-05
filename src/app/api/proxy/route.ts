import { NextRequest, NextResponse } from 'next/server';

// 设置最大执行时间为 60 秒
export const maxDuration = 60;

// 添加 CORS 配置
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // 从请求体中获取目标 API 信息
    const { targetUrl, headers, body, isOllama } = await request.json();

    if (!targetUrl) {
      return NextResponse.json(
        { error: { message: '缺少目标 API URL' } },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    console.log('代理请求目标:', targetUrl);
    console.log('代理请求头:', JSON.stringify(headers).replace(/Bearer [^"]+/, 'Bearer [REDACTED]'));
    console.log('代理请求体:', JSON.stringify(body, null, 2));

    try {
      // 发起请求到目标 API，添加超时设置
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      // 根据是否是 Ollama 请求调整请求体格式
      const requestBody = isOllama ? {
        model: body.model || 'llama2',
        prompt: Array.isArray(body.messages) ? body.messages[body.messages.length - 1].content : body.prompt,
        system: Array.isArray(body.messages) ? body.messages[0]?.content : undefined,
        format: 'json',
        stream: false
      } : body;

      // 检查 Ollama 服务是否可用
      if (isOllama) {
        try {
          // 强制使用 IPv4 地址
          const checkUrl = targetUrl.replace('/api/generate', '').replace('localhost', '127.0.0.1');
          const checkResponse = await fetch(checkUrl);
          if (!checkResponse.ok) {
            console.error('Ollama 服务检查失败:', await checkResponse.text());
            throw new Error('Ollama 服务不可用');
          }
        } catch (checkError) {
          console.error('Ollama 服务检查错误:', checkError);
          throw new Error('无法连接到 Ollama 服务，请确保：\n1. Ollama 已安装并运行\n2. 服务地址正确（默认：http://127.0.0.1:11434）\n3. 没有防火墙阻止连接');
        }
      }

      // 确保请求 URL 也使用 IPv4
      const requestUrl = isOllama ? targetUrl.replace('localhost', '127.0.0.1') : targetUrl;
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isOllama ? {} : headers), // 非 Ollama 请求时添加原始请求头
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('代理请求状态:', response.status, response.statusText);
      console.log('代理响应头:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));

      // 尝试解析响应数据
      const text = await response.text();
      console.log('代理响应原始文本:', text);

      // 尝试将文本解析为JSON
      let data;
      try {
        data = JSON.parse(text);
        
        // 如果是 Ollama 响应，转换为 OpenAI 兼容格式
        if (isOllama && data.response) {
          data = {
            choices: [{
              message: {
                content: data.response,
                role: 'assistant'
              },
              finish_reason: 'stop'
            }]
          };
        }
        
        console.log('代理响应JSON结构:', Object.keys(data));
      } catch (parseError) {
        console.error('解析JSON失败:', parseError);
        console.error('原始文本:', text);
        // 如果不是有效的JSON，则返回原始文本
        return NextResponse.json({ text }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        });
      }

      // 返回解析后的JSON响应
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } catch (fetchError) {
      console.error('代理请求失败:', fetchError);
      
      // 处理超时错误
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: { message: '请求超时，请稍后重试' } },
          { 
            status: 504,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
          }
        );
      }

      // 处理连接错误
      if (fetchError instanceof Error && fetchError.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: { message: '无法连接到服务，请确保服务正在运行并且端口正确' } },
          { 
            status: 502,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
          }
        );
      }

      // 处理其他错误
      return NextResponse.json(
        { 
          error: { 
            message: fetchError instanceof Error ? fetchError.message : '代理请求失败',
            stack: fetchError instanceof Error ? fetchError.stack : undefined,
            cause: fetchError instanceof Error ? String(fetchError.cause) : undefined
          } 
        },
        { 
          status: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }
  } catch (error) {
    console.error('API 代理错误:', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : '代理请求失败' } },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
} 