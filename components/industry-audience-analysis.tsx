'use client'

import { FormEvent, useRef, useState } from 'react'
import { BrainCircuit, Loader2, RotateCcw, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type Props = { accountId?: string }

export function IndustryAudienceAnalysis({ accountId }: Props) {
  const [industry, setIndustry] = useState('')
  const [region, setRegion] = useState('')
  const [context, setContext] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedIndustry = industry.trim()
    if (!trimmedIndustry) {
      setError('请先输入行业类目')
      return
    }
    if (trimmedIndustry.length > 80 || region.length > 40 || context.length > 500) {
      setError('行业类目最多80字，地区最多40字，补充背景最多500字')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('/api/analyze-audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: trimmedIndustry, region: region.trim(), context: context.trim(), accountId }),
        signal: controller.signal,
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error || '分析请求失败，请稍后重试')
      }
      if (!response.body) throw new Error('分析服务没有返回内容')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let completed = false
      while (!completed) {
        const read = await reader.read()
        buffer += decoder.decode(read.value || new Uint8Array(), { stream: !read.done })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''
        for (const eventText of events) {
          const line = eventText.split('\n').find((line) => line.startsWith('data: '))
          if (!line) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') {
            completed = true
            break
          }
          const chunk = JSON.parse(payload) as { content?: string; error?: string }
          if (chunk.error) throw new Error(chunk.error)
          if (chunk.content) setResult((current) => current + chunk.content)
        }
        if (read.done) completed = true
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return
      setError(caught instanceof Error ? caught.message : '分析失败，请稍后重试')
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <form onSubmit={handleAnalyze} className="cyber-card space-y-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-2 text-cyan-300"><BrainCircuit size={20} /></div>
          <div>
            <h2 className="text-lg font-semibold text-cyan-100">行业人群分析</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">从行业类目拆解目标人群、兴趣和真实经营痛点。</p>
          </div>
        </div>
        <label className="block text-sm text-slate-300">行业类目<span className="ml-1 text-pink-300">*</span>
          <input value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="例如：烘焙店、宠物医院、健身房" maxLength={80} className="cyber-input mt-2 w-full" />
        </label>
        <label className="block text-sm text-slate-300">所在地区（可选）
          <input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="例如：成都·高新区" maxLength={40} className="cyber-input mt-2 w-full" />
        </label>
        <label className="block text-sm text-slate-300">补充背景（可选）
          <textarea value={context} onChange={(event) => setContext(event.target.value)} placeholder="门店定位、价格带、客群、特色服务等，未知的内容留空即可" maxLength={500} rows={5} className="cyber-input mt-2 w-full resize-y" />
          <span className="mt-1 block text-right text-[11px] text-slate-500">{context.length}/500</span>
        </label>
        {error && <p role="alert" className="rounded-md border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        <button type="submit" disabled={loading} className="cyber-btn flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <><Loader2 size={16} className="animate-spin" />正在分析...</> : <><Sparkles size={16} />开始分析</>}
        </button>
        {loading && <button type="button" onClick={() => abortRef.current?.abort()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-3 text-sm text-slate-300 hover:border-cyan-300 hover:text-cyan-200"><RotateCcw size={15} />取消分析</button>}
      </form>

      <section className="cyber-card min-h-[520px] p-5 sm:p-7">
        {!result && !loading && <div className="flex min-h-[470px] flex-col items-center justify-center text-center text-slate-500"><BrainCircuit size={48} className="mb-4 text-cyan-400/40" /><p className="text-sm">输入行业类目后，分析结果会在这里流式生成</p><p className="mt-2 text-xs">结果包含人群画像、兴趣偏好、行业痛点与内容切入点</p></div>}
        {loading && !result && <div className="flex min-h-[470px] items-center justify-center gap-3 text-cyan-200"><Loader2 size={20} className="animate-spin" />正在构建行业人群画像...</div>}
        {result && <article className="prose prose-invert max-w-none prose-headings:text-cyan-100 prose-strong:text-cyan-200 prose-a:text-cyan-300"><ReactMarkdown>{result}</ReactMarkdown></article>}
      </section>
    </div>
  )
}
