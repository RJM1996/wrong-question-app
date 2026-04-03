// API 配置
// 用户需要在 localStorage 中设置 API Key

const API_URL = '/api/chat/completions'

// 获取 API Key
export function getApiKey() {
  return localStorage.getItem('qwen_api_key') || ''
}

// 设置 API Key
export function setApiKey(key) {
  localStorage.setItem('qwen_api_key', key)
}

// 将图片转换为 base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 识别图片内容
export async function recognizeImage(imageFile) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('请先设置 API Key')
  }

  const base64Image = await fileToBase64(imageFile)

  // 添加超时处理
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒超时

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              },
              {
                type: 'text',
                text: `请分析这道题目的内容，并按以下JSON格式返回结果：
{
  "subject": "科目名称",
  "questionType": "题型分类",
  "tags": ["知识点标签1", "知识点标签2"],
  "difficulty": "难度(简单/中等/困难)",
  "keyPoints": "题目关键点简述"
}

可选科目：语文、数学、英语、物理、化学、生物
如果无法确定，请根据题目内容合理推断。

只返回JSON，不要有其他内容。`
              }
            ]
          }
        ]
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API错误响应:', errorText)
      try {
        const errorJson = JSON.parse(errorText)
        throw new Error(errorJson.error?.message || errorJson.message || 'API 调用失败')
      } catch {
        throw new Error(`API 调用失败: ${response.status}`)
      }
    }

    const data = await response.json()
    console.log('API响应:', data)

    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('API 返回内容为空')
    }

    // 解析返回的JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('无法解析识别结果')
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('请求超时，请重试')
    }
    throw err
  }
}