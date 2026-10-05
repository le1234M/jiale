export function exportResultsToWord(params: {
  title: string;
  modeLabel: string;
  sections: Array<{ name: string; content: string }>;
}) {
  const { title, modeLabel, sections } = params;
  const timestamp = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  // 将 Markdown 内容转换为简单的 HTML
  const markdownToHtml = (md: string): string => {
    return md
      // 标题
      .replace(/^### (.*$)/gm, '<h3 style="color: #0a162e; margin: 16px 0 8px;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="color: #0a162e; margin: 20px 0 10px;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="color: #0a162e; margin: 24px 0 12px;">$1</h1>')
      // 粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 表格行
      .replace(/^\|(.+)\|$/gm, (match) => {
        const cells = match.split('|').filter((c) => c.trim());
        const isHeader = cells.every((c) => /^[\s-]+$/.test(c));
        if (isHeader) return '';
        const tag = 'td';
        return `<tr>${cells.map((c) => `<${tag} style="border: 1px solid #ddd; padding: 8px;">${c.trim()}</${tag}>`).join('')}</tr>`;
      })
      // 表格开始
      .replace(/(<tr>.*<\/tr>\n?)+/g, '<table style="border-collapse: collapse; width: 100%; margin: 12px 0;">$&</table>')
      // 列表
      .replace(/^- (.*$)/gm, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>')
      // 引用
      .replace(/^> (.*$)/gm, '<blockquote style="border-left: 3px solid #d4af6a; padding-left: 12px; margin: 12px 0; color: #555;">$1</blockquote>')
      // 分割线
      .replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid #d4af6a; margin: 20px 0;">')
      // 换行
      .replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.8;">')
      .replace(/\n/g, '<br/>');
  };

  const body = sections
    .map(
      (s) => `
    <div style="page-break-inside: avoid; margin-bottom: 32px;">
      <h2 style="color: #0a162e; border-left: 4px solid #d4af6a; padding-left: 12px; margin: 24px 0 12px;">${escape(
        s.name,
      )}</h2>
      <div style="line-height: 1.85; font-size: 14px; color: #222; font-family: '微软雅黑', sans-serif;">
        ${markdownToHtml(s.content)}
      </div>
    </div>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${escape(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: '微软雅黑', 'Microsoft YaHei', sans-serif; }
    @page { margin: 2cm; }
  </style>
</head>
<body style="color: #222; padding: 24px;">
  <h1 style="color: #0a162e; font-size: 24px; margin-bottom: 4px;">${escape(title)}</h1>
  <div style="color: #666; font-size: 12px; margin-bottom: 8px;">模式：${escape(modeLabel)} · 生成时间：${escape(timestamp)}</div>
  <hr style="border: none; border-top: 2px solid #d4af6a; margin: 16px 0;">
  ${body}
</body>
</html>`;

  // 使用 data URL 方式，兼容性更好（特别是微信内置浏览器和 iOS）
  const base64 = btoa(unescape(encodeURIComponent('\uFEFF' + html)));
  const dataUrl = `data:application/msword;base64,${base64}`;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${title}-${Date.now()}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
