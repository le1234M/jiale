"use client";

import { useState } from "react";

interface EditingToolProps {
  script?: any;
}

type ToolTab = "storyboard" | "subtitle" | "cover" | "bgm";

export function EditingTool({ script }: EditingToolProps) {
  const [activeTab, setActiveTab] = useState<ToolTab>("storyboard");

  const tabs = [
    { id: "storyboard" as ToolTab, label: "分镜预览", icon: "🎬" },
    { id: "subtitle" as ToolTab, label: "字幕生成", icon: "" },
    { id: "cover" as ToolTab, label: "封面制作", icon: "🖼️" },
    { id: "bgm" as ToolTab, label: "BGM 推荐", icon: "🎵" },
  ];

  return (
    <div className="card-luxe p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">剪辑工具</h2>
        <p className="text-sm text-muted-foreground">
          将文案转化为可执行的拍摄和剪辑素材
        </p>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 工具内容 */}
      {activeTab === "storyboard" && <StoryboardPanel script={script} />}
      {activeTab === "subtitle" && <SubtitlePanel script={script} />}
      {activeTab === "cover" && <CoverPanel script={script} />}
      {activeTab === "bgm" && <BGMPanel script={script} />}
    </div>
  );
}

// 分镜预览面板
function StoryboardPanel({ script }: { script?: any }) {
  const [duration, setDuration] = useState(30);

  // 示例分镜数据（实际应从 script 中提取）
  const sampleShots = [
    { time: "0-3s", shot: "特写", action: "展示招牌菜", text: "晋城人注意了！" },
    { time: "3-8s", shot: "中景", action: "老板出镜介绍", text: "9 块 9 能吃一桌菜" },
    { time: "8-15s", shot: "全景", action: "展示门店环境", text: "就在 XX 路" },
    { time: "15-25s", shot: "特写", action: "展示菜品细节", text: "看看这分量" },
    { time: "25-30s", shot: "中景", action: "引导下单", text: "左下角团购" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">视频分镜</h3>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">时长:</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="input-luxe px-3 py-1 text-sm"
          >
            <option value={15}>15 秒</option>
            <option value={30}>30 秒</option>
            <option value={60}>60 秒</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {sampleShots.map((shot, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl">
              🎥
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {shot.time}
                </span>
                <span className="text-xs text-muted-foreground">
                  {shot.shot}
                </span>
              </div>
              <p className="text-sm text-foreground mb-1">{shot.action}</p>
              <p className="text-xs text-muted-foreground italic">
                "{shot.text}"
              </p>
            </div>
            <button className="flex-shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground">
          💡 <strong>拍摄提示:</strong> 每个分镜建议拍摄 3-5 条素材，后期选择最佳版本。保持画面稳定，光线充足。
        </p>
      </div>
    </div>
  );
}

// 字幕生成面板
function SubtitlePanel({ script }: { script?: any }) {
  const [subtitleText, setSubtitleText] = useState(
    `晋城人注意了！
9 块 9 能吃一桌菜？
就在 XX 路这家店
看看这分量
左下角团购赶紧冲`
  );
  const [fontSize, setFontSize] = useState(48);
  const [position, setPosition] = useState("bottom");

  const handleExportSRT = () => {
    const lines = subtitleText.split("\n");
    let srtContent = "";
    lines.forEach((line, index) => {
      const startTime = index * 3;
      const endTime = startTime + 3;
      srtContent += `${index + 1}\n`;
      srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
      srtContent += `${line}\n\n`;
    });

    const blob = new Blob([srtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitle.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">字幕生成器</h3>
        <button
          onClick={handleExportSRT}
          className="btn-gold px-4 py-2 text-sm"
        >
          导出 SRT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 字幕编辑 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            字幕文本（每行一句）
          </label>
          <textarea
            value={subtitleText}
            onChange={(e) => setSubtitleText(e.target.value)}
            rows={8}
            className="input-luxe w-full p-3 text-sm resize-none"
            placeholder="输入字幕文本，每行一句..."
          />
          <p className="mt-1 text-xs text-muted-foreground">
            共 {subtitleText.split("\n").filter((l) => l.trim()).length} 句
          </p>
        </div>

        {/* 预览 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            预览效果
          </label>
          <div className="relative aspect-video rounded-lg bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center overflow-hidden">
            <div
              className={`absolute left-0 right-0 p-4 text-center text-white font-bold drop-shadow-lg ${
                position === "top"
                  ? "top-0"
                  : position === "bottom"
                  ? "bottom-0"
                  : "top-1/2 -translate-y-1/2"
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {subtitleText.split("\n")[0] || "示例字幕"}
            </div>
          </div>
        </div>
      </div>

      {/* 样式设置 */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            字体大小
          </label>
          <input
            type="range"
            min="24"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">{fontSize}px</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            字幕位置
          </label>
          <div className="flex gap-2">
            {["top", "middle", "bottom"].map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                  position === pos
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {pos === "top" ? "顶部" : pos === "middle" ? "中间" : "底部"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 封面制作面板
function CoverPanel({ script }: { script?: any }) {
  const [title, setTitle] = useState("9 块 9 能吃一桌菜？");
  const [subtitle, setSubtitle] = useState("晋城人千万别错过");
  const [style, setStyle] = useState("bold");

  const styles = [
    { id: "bold", name: "粗体醒目", preview: "font-bold text-3xl" },
    { id: "elegant", name: "优雅简约", preview: "font-light text-2xl tracking-wider" },
    { id: "fun", name: "活泼趣味", preview: "font-bold text-2xl italic" },
  ];

  const handleExportCover = () => {
    // 创建画布生成封面图
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, "#1a2a4a");
    gradient.addColorStop(1, "#0a1628");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // 标题
    ctx.fillStyle = "#d4af6a";
    ctx.font = "bold 80px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, 540, 900);

    // 副标题
    ctx.fillStyle = "#ffffff";
    ctx.font = "40px sans-serif";
    ctx.fillText(subtitle, 540, 1000);

    // 下载
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cover.png";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">封面制作</h3>
        <button
          onClick={handleExportCover}
          className="btn-gold px-4 py-2 text-sm"
        >
          导出封面
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 编辑 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              主标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-luxe w-full"
              placeholder="输入主标题..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              副标题
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="input-luxe w-full"
              placeholder="输入副标题..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              文字风格
            </label>
            <div className="grid grid-cols-3 gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`p-3 rounded-lg text-sm transition-all ${
                    style === s.id
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 预览 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            封面预览
          </label>
          <div className="relative aspect-[9/16] rounded-lg bg-gradient-to-br from-[#1a2a4a] to-[#0a1628] flex flex-col items-center justify-center p-8 overflow-hidden">
            <h2
              className={`text-[#d4af6a] text-center mb-4 ${
                style === "bold"
                  ? "font-bold text-3xl"
                  : style === "elegant"
                  ? "font-light text-2xl tracking-wider"
                  : "font-bold text-2xl italic"
              }`}
            >
              {title}
            </h2>
            <p className="text-white text-center text-lg">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// BGM 推荐面板
function BGMPanel({ script }: { script?: any }) {
  const [mood, setMood] = useState("energetic");

  const bgmList = [
    {
      name: "轻快电子",
      mood: "energetic",
      keywords: "轻快 电子 节奏感",
      duration: "0:30",
      description: "适合美食探店、产品展示",
    },
    {
      name: "温暖吉他",
      mood: "warm",
      keywords: "温暖 吉他 抒情",
      duration: "0:45",
      description: "适合走心故事、品牌宣传",
    },
    {
      name: "搞笑音效",
      mood: "funny",
      keywords: "搞笑 音效 活泼",
      duration: "0:20",
      description: "适合幽默内容、反转剧情",
    },
    {
      name: "大气管弦",
      mood: "epic",
      keywords: "大气 管弦 震撼",
      duration: "1:00",
      description: "适合品牌升级、重大活动",
    },
    {
      name: "舒缓钢琴",
      mood: "calm",
      keywords: "舒缓 钢琴 安静",
      duration: "0:50",
      description: "适合深夜食堂、情感内容",
    },
  ];

  const filteredBGM = bgmList.filter((b) => b.mood === mood);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          BGM 推荐
        </h3>
        <p className="text-sm text-muted-foreground">
          根据内容情绪推荐背景音乐（使用平台曲库）
        </p>
      </div>

      {/* 情绪选择 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "energetic", label: "轻快活力", icon: "⚡" },
          { id: "warm", label: "温暖走心", icon: "❤️" },
          { id: "funny", label: "搞笑幽默", icon: "😄" },
          { id: "epic", label: "大气震撼", icon: "🎭" },
          { id: "calm", label: "舒缓安静", icon: "🌙" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMood(m.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              mood === m.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* BGM 列表 */}
      <div className="space-y-3">
        {filteredBGM.map((bgm, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
              🎵
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground mb-1">
                {bgm.name}
              </h4>
              <p className="text-xs text-muted-foreground mb-1">
                {bgm.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  搜索关键词:
                </span>
                <span className="text-xs text-primary">{bgm.keywords}</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-muted-foreground">{bgm.duration}</p>
              <button className="mt-1 text-xs text-primary hover:underline">
                试听
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground">
          💡 <strong>版权提示:</strong> 请使用抖音/剪映平台曲库中的音乐，避免版权问题。以上推荐仅为风格参考。
        </p>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const ms = 0;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}
