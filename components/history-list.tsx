'use client';

import { useState, useEffect } from 'react';
import { Search, Star, Copy, Calendar, RotateCcw, Trash2, FileText } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  content_type: string;
  content: string;
  form_data: any;
  account_id: string | null;
  is_favorite: boolean;
  created_at: string;
}

interface HistoryListProps {
  onReuse?: (item: HistoryItem) => void;
  onAddToCalendar?: (item: HistoryItem) => void;
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  script: '短视频脚本',
  talking: '口播文案',
  vlog: '探店 Vlog',
  livestream: '直播话术',
  interaction: '互动话术',
  calendar: '月度选题'
};

export function HistoryList({ onReuse, onAddToCalendar }: HistoryListProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [contentType, setContentType] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
        contentType,
        isFavorite: showFavorites.toString()
      });

      const res = await fetch(`/api/history?${params}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('获取历史作品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, search, contentType, showFavorites]);

  const toggleFavorite = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/history?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !current })
      });
      const data = await res.json();
      if (data.success) {
        fetchHistory();
      }
    } catch (error) {
      console.error('更新收藏状态失败:', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('确定要删除这个作品吗？')) return;
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchHistory();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const copyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B94A8]" />
          <input
            type="text"
            placeholder="搜索作品标题或内容..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#12213F] border border-[rgba(212,175,106,0.2)] rounded-lg text-[#F5F0E4] placeholder-[#8B94A8] focus:border-[#D4AF6A] focus:outline-none transition-colors"
          />
        </div>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="px-4 py-2.5 bg-[#12213F] border border-[rgba(212,175,106,0.2)] rounded-lg text-[#F5F0E4] focus:border-[#D4AF6A] focus:outline-none transition-colors"
        >
          <option value="">全部类型</option>
          <option value="script">短视频脚本</option>
          <option value="talking">口播文案</option>
          <option value="vlog">探店 Vlog</option>
          <option value="livestream">直播话术</option>
          <option value="interaction">互动话术</option>
          <option value="calendar">月度选题</option>
        </select>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`px-4 py-2.5 rounded-lg border transition-colors flex items-center gap-2 ${
            showFavorites
              ? 'bg-[#D4AF6A] text-[#0A162E] border-[#D4AF6A]'
              : 'bg-[#12213F] text-[#F5F0E4] border-[rgba(212,175,106,0.2)] hover:border-[#D4AF6A]'
          }`}
        >
          <Star className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
          收藏
        </button>
      </div>

      {/* 作品列表 */}
      {loading ? (
        <div className="text-center py-12 text-[#8B94A8]">加载中...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-[#8B94A8] opacity-50" />
          <p className="text-[#8B94A8]">暂无历史作品</p>
          <p className="text-sm text-[#8B94A8] mt-2">生成文案后会自动保存到历史记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#12213F] border border-[rgba(212,175,106,0.2)] rounded-xl p-4 hover:border-[rgba(212,175,106,0.4)] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-[#F5F0E4] font-semibold mb-1">{item.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-[#8B94A8]">
                    <span>{CONTENT_TYPE_LABELS[item.content_type] || item.content_type}</span>
                    <span>·</span>
                    <span>{new Date(item.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(item.id, item.is_favorite)}
                  className="p-2 hover:bg-[rgba(212,175,106,0.1)] rounded-lg transition-colors"
                >
                  <Star
                    className={`w-5 h-5 ${
                      item.is_favorite ? 'text-[#D4AF6A] fill-current' : 'text-[#8B94A8]'
                    }`}
                  />
                </button>
              </div>

              <div className="text-sm text-[#8B94A8] line-clamp-2 mb-3">
                {item.content.substring(0, 200)}...
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {onReuse && (
                  <button
                    onClick={() => onReuse(item)}
                    className="px-3 py-1.5 bg-[rgba(212,175,106,0.1)] text-[#D4AF6A] rounded-lg text-sm hover:bg-[rgba(212,175,106,0.2)] transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    复用
                  </button>
                )}
                {onAddToCalendar && (
                  <button
                    onClick={() => onAddToCalendar(item)}
                    className="px-3 py-1.5 bg-[rgba(212,175,106,0.1)] text-[#D4AF6A] rounded-lg text-sm hover:bg-[rgba(212,175,106,0.2)] transition-colors flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    加入日历
                  </button>
                )}
                <button
                  onClick={() => copyContent(item.content)}
                  className="px-3 py-1.5 bg-[rgba(212,175,106,0.1)] text-[#D4AF6A] rounded-lg text-sm hover:bg-[rgba(212,175,106,0.2)] transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  复制
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="px-3 py-1.5 bg-[rgba(194,90,90,0.1)] text-[#C25A5A] rounded-lg text-sm hover:bg-[rgba(194,90,90,0.2)] transition-colors flex items-center gap-1 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[#12213F] border border-[rgba(212,175,106,0.2)] rounded-lg text-[#F5F0E4] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#D4AF6A] transition-colors"
          >
            上一页
          </button>
          <span className="text-[#8B94A8]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-[#12213F] border border-[rgba(212,175,106,0.2)] rounded-lg text-[#F5F0E4] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#D4AF6A] transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
