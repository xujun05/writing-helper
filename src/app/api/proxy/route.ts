import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 从请求体中获取目标 API 信息
    const { targetUrl, headers, body } = await request.json();

    if (!targetUrl) {
      return NextResponse.json(
        { error: { message: '缺少目标 API URL' } },
        { status: 400 }
      );
    }

    console.log('代理请求目标:', targetUrl);
    console.log('代理请求头:', JSON.stringify(headers).replace(/Bearer [^"]+/, 'Bearer [REDACTED]'));
    console.log('代理请求体:', JSON.stringify(body, null, 2));

    try {
      // 发起请求到目标 API
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: headers || {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('代理请求状态:', response.status, response.statusText);
      console.log('代理响应头:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));

      // 尝试解析响应数据
      const text = await response.text();
      console.log('代理响应原始文本:', text);

      // 尝试将文本解析为JSON
      let data;
      try {
        data = JSON.parse(text);
        console.log('代理响应JSON结构:', Object.keys(data));
      } catch {
        console.error('解析JSON失败, 返回原始文本');
        // 如果不是有效的JSON，则返回原始文本
        return NextResponse.json({ text });
      }

      // 返回解析后的JSON响应
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('代理请求失败:', fetchError);
      
      return NextResponse.json(
        { 
          error: { 
            message: fetchError instanceof Error ? fetchError.message : '代理请求失败',
            stack: fetchError instanceof Error ? fetchError.stack : undefined,
            cause: fetchError instanceof Error ? String(fetchError.cause) : undefined
          } 
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('API 代理错误:', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : '代理请求失败' } },
      { status: 500 }
    );
  }
} 