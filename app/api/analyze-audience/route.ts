import { NextRequest } from "next/server";
import { Config, HeaderUtils, LLMClient, Message } from "coze-coding-dev-sdk";
import { verifyMerchantToken } from "@/lib/auth-manager";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `你是佳乐本地生活服务的行业人群策略分析师。你的任务是基于用户输入的行业类目，输出可验证、可执行的目标人群分析，不要编造具体平台后台数据、市场份额或用户数量。

分析必须贴近抖音本地生活内容运营，但不要声称掌握抖音内部算法或实时数据。请用“建议验证”“可能”“常见”等谨慎表述，并把推断和已知信息区分开。

请严格按以下结构输出 Markdown：
# 行业人群分析
## 1. 核心目标人群
用表格列出 3-5 类人群：人群名称、典型场景、核心需求、决策阻力、适合的内容切口。
## 2. 人群兴趣与内容偏好
列出高相关兴趣、搜索/浏览意图、容易触发停留的内容元素，并说明每一项如何验证。
## 3. 行业痛点
分别从消费者、商家、内容创作者三个视角列出痛点，每个痛点补充可观察证据和可执行的内容回应。
## 4. 内容与转化建议
给出 5 个适合短视频或直播的选题方向，每个包含：开场钩子、展示证据、行动指令、需要商家补充的事实。
## 5. 验证清单
给出发布前应向门店确认的 8 个问题，以及发布后应观察的 5 个指标。不要承诺播放量或转化率。

写作要求：中文、具体、避免行业套话；没有输入事实时明确标注“待确认”，不要虚构门店价格、客群规模、优惠或服务能力。`;

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth_token")?.value;
    if (!authToken || !(await verifyMerchantToken(authToken))) {
      return new Response(JSON.stringify({ success: false, error: "请先登录后使用行业人群分析" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json() as { industry?: unknown; region?: unknown; context?: unknown };
    const industry = typeof body.industry === "string" ? body.industry.trim() : "";
    const region = typeof body.region === "string" ? body.region.trim() : "";
    const context = typeof body.context === "string" ? body.context.trim() : "";

    if (!industry) {
      return new Response(JSON.stringify({ success: false, error: "请输入行业类目" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (industry.length > 80 || region.length > 40 || context.length > 500) {
      return new Response(JSON.stringify({ success: false, error: "输入内容过长，请精简后重试" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(new Config(), customHeaders);
    const messages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `行业类目：${industry}\n所在地区：${region || "待确认"}\n补充背景：${context || "暂无，请基于行业常见场景分析并标记待确认项"}`,
      },
    ];

    const stream = client.stream(messages, {
      model: "doubao-seed-2-0-pro-260215",
      thinking: "enabled",
      temperature: 0.45,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: String(chunk.content) })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "分析服务暂时不稳定，请稍后重试" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: "分析服务暂时不稳定，请稍后重试" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
