import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils, Message } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json(
        { success: false, error: "请上传图片" },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages: Message[] = [
      {
        role: "system",
        content:
          "你是一个团购信息识别专家。用户会上传一张抖音/美团等平台的团购套餐截图，请从图片中提取所有团购信息。",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `请从这张团购截图中提取所有团购套餐信息，返回 JSON 格式，严格按照以下结构（不要包含任何其他内容）：

{
  "deals": [
    {
      "name": "套餐名称，如双人特惠餐",
      "originalPrice": "原价数字（只保留数字，如 100）",
      "price": "团购价数字（只保留数字，如 69）",
      "content": "套餐包含的详细内容描述"
    }
  ]
}

注意：
- 如果有多个套餐，全部列出
- 代金券也算一个套餐，name写"X元代Y元代金券"，price写X，originalPrice写Y
- 价格只保留数字，不要带"元"字
- 如果识别不清晰，请填写最合理的值并在 content 中说明`,
          },
          {
            type: "image_url",
            image_url: {
              url: image,
              detail: "high",
            },
          },
        ],
      },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.1,
    });

    let deals: Array<{
      name: string;
      originalPrice: string;
      price: string;
      content: string;
    }> = [];

    try {
      // Try to parse JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        deals = parsed.deals || [];
      }
    } catch {
      // If JSON parsing fails, return raw text
    }

    return NextResponse.json({
      success: true,
      deals,
      raw: deals.length === 0 ? response.content : undefined,
    });
  } catch (error) {
    console.error("团购图片分析失败:", error);
    return NextResponse.json(
      { success: false, error: "图片分析失败，请重试" },
      { status: 500 }
    );
  }
}