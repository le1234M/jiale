'use client';

import { useState, useEffect } from 'react';
import { Key, Save, Trash2, Plus, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface ApiKeyConfig {
  id: string;
  platform: string;
  api_key: string;
  has_secret: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiKeyManagerProps {
  onDataRefresh?: () => void;
}

const PLATFORMS = [
  {
    id: 'feigua',
    name: '飞瓜数据',
    description: '抖音/快手数据分析平台',
    icon: '📊',
    fields: ['api_key'],
    applyUrl: 'https://www.feigua.cn/openapi',
  },
  {
    id: 'chanmama',
    name: '蝉妈妈',
    description: '抖音电商数据分析',
    icon: '',
    fields: ['api_key'],
    applyUrl: 'https://www.chanmama.com/openapi',
  },
  {
    id: 'douyin',
    name: '抖音开放平台',
    description: '官方数据接口（需 OAuth 授权）',
    icon: '🎵',
    fields: ['client_id', 'client_secret'],
    applyUrl: 'https://open.douyin.com',
  },
];

export default function ApiKeyManager({ onDataRefresh }: ApiKeyManagerProps) {
  const [configs, setConfigs] = useState<ApiKeyConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [formData, setFormData] = useState({
    api_key: '',
    api_secret: '',
    client_id: '',
    client_secret: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/api-keys');
      const data = await res.json();
      if (data.success) {
        setConfigs(data.data);
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (platformId: string) => {
    setSaving(platformId);
    setMessage(null);

    try {
      const body: any = {
        platform: platformId,
        api_key: formData.api_key,
      };

      if (formData.api_secret) body.api_secret = formData.api_secret;
      if (formData.client_id) body.client_id = formData.client_id;
      if (formData.client_secret) body.client_secret = formData.client_secret;

      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: '保存成功！' });
        setFormData({ api_key: '', api_secret: '', client_id: '', client_secret: '' });
        setSelectedPlatform('');
        fetchConfigs();
        onDataRefresh?.();
      } else {
        setMessage({ type: 'error', text: data.error || '保存失败' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (platformId: string) => {
    if (!confirm('确定要删除这个配置吗？')) return;

    try {
      const res = await fetch(`/api/api-keys?platform=${platformId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: '删除成功！' });
        fetchConfigs();
      } else {
        setMessage({ type: 'error', text: data.error || '删除失败' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '删除失败' });
    }
  };

  const getConfiguredPlatforms = () => {
    return configs.map(c => c.platform);
  };

  const getPlatformConfig = (platformId: string) => {
    return configs.find(c => c.platform === platformId);
  };

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5" style={{ color: '#D4AF6A' }} />
          <h2 className="text-lg font-bold" style={{ color: '#F5F0E4' }}>
            API Key 配置
          </h2>
        </div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </span>
        </div>
      )}

      {/* 平台列表 */}
      <div className="space-y-4">
        {PLATFORMS.map(platform => {
          const config = getPlatformConfig(platform.id);
          const isConfigured = !!config;
          const isEditing = selectedPlatform === platform.id;

          return (
            <div
              key={platform.id}
              className="rounded-xl p-5 transition-all"
              style={{
                background: '#12213F',
                border: `1px solid ${isConfigured ? 'rgba(212,175,106,0.3)' : 'rgba(139,148,168,0.2)'}`,
              }}
            >
              {/* 平台信息 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <div>
                    <h3 className="font-bold" style={{ color: '#F5F0E4' }}>
                      {platform.name}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: '#8B94A8' }}>
                      {platform.description}
                    </p>
                  </div>
                </div>
                {isConfigured && (
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ background: 'rgba(212,175,106,0.2)', color: '#D4AF6A' }}
                  >
                    已配置
                  </span>
                )}
              </div>

              {/* 配置状态 */}
              {isConfigured && !isEditing && (
                <div className="flex items-center justify-between">
                  <div className="text-sm" style={{ color: '#8B94A8' }}>
                    <span>API Key: {config.api_key}</span>
                    {config.has_secret && <span className="ml-3">密钥：已设置</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        setFormData({ api_key: '', api_secret: '', client_id: '', client_secret: '' });
                      }}
                      className="px-3 py-1.5 rounded text-sm font-medium transition-all"
                      style={{
                        background: 'rgba(212,175,106,0.1)',
                        color: '#D4AF6A',
                        border: '1px solid rgba(212,175,106,0.3)',
                      }}
                    >
                      重新配置
                    </button>
                    <button
                      onClick={() => handleDelete(platform.id)}
                      className="p-1.5 rounded transition-all"
                      style={{ color: '#C25A5A' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* 编辑表单 */}
              {isEditing && (
                <div className="space-y-3">
                  {platform.fields.includes('api_key') && (
                    <div>
                      <label className="block text-sm mb-1.5" style={{ color: '#8B94A8' }}>
                        API Key *
                      </label>
                      <input
                        type="text"
                        value={formData.api_key}
                        onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                        style={{
                          background: '#0A162E',
                          border: '1px solid rgba(139,148,168,0.3)',
                          color: '#F5F0E4',
                        }}
                        placeholder="输入 API Key"
                      />
                    </div>
                  )}
                  {platform.fields.includes('api_secret') && (
                    <div>
                      <label className="block text-sm mb-1.5" style={{ color: '#8B94A8' }}>
                        API Secret
                      </label>
                      <input
                        type="password"
                        value={formData.api_secret}
                        onChange={e => setFormData({ ...formData, api_secret: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                        style={{
                          background: '#0A162E',
                          border: '1px solid rgba(139,148,168,0.3)',
                          color: '#F5F0E4',
                        }}
                        placeholder="输入 API Secret（可选）"
                      />
                    </div>
                  )}
                  {platform.fields.includes('client_id') && (
                    <div>
                      <label className="block text-sm mb-1.5" style={{ color: '#8B94A8' }}>
                        Client ID *
                      </label>
                      <input
                        type="text"
                        value={formData.client_id}
                        onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                        style={{
                          background: '#0A162E',
                          border: '1px solid rgba(139,148,168,0.3)',
                          color: '#F5F0E4',
                        }}
                        placeholder="输入 Client ID"
                      />
                    </div>
                  )}
                  {platform.fields.includes('client_secret') && (
                    <div>
                      <label className="block text-sm mb-1.5" style={{ color: '#8B94A8' }}>
                        Client Secret *
                      </label>
                      <input
                        type="password"
                        value={formData.client_secret}
                        onChange={e => setFormData({ ...formData, client_secret: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                        style={{
                          background: '#0A162E',
                          border: '1px solid rgba(139,148,168,0.3)',
                          color: '#F5F0E4',
                        }}
                        placeholder="输入 Client Secret"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleSave(platform.id)}
                      disabled={saving === platform.id || !formData.api_key}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #D4AF6A, #E8C989)',
                        color: '#0A162E',
                      }}
                    >
                      <Save className="w-4 h-4" />
                      {saving === platform.id ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlatform('');
                        setFormData({ api_key: '', api_secret: '', client_id: '', client_secret: '' });
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: 'transparent',
                        color: '#8B94A8',
                        border: '1px solid rgba(139,148,168,0.3)',
                      }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* 未配置状态 */}
              {!isConfigured && !isEditing && (
                <div className="flex items-center justify-between">
                  <a
                    href={platform.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm transition-all"
                    style={{ color: '#D4AF6A' }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    前往申请
                  </a>
                  <button
                    onClick={() => {
                      setSelectedPlatform(platform.id);
                      setFormData({ api_key: '', api_secret: '', client_id: '', client_secret: '' });
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: 'rgba(212,175,106,0.1)',
                      color: '#D4AF6A',
                      border: '1px solid rgba(212,175,106,0.3)',
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    配置
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 使用说明 */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'rgba(212,175,106,0.05)',
          border: '1px solid rgba(212,175,106,0.2)',
        }}
      >
        <h3 className="font-bold mb-3" style={{ color: '#D4AF6A' }}>
          💡 使用说明
        </h3>
        <ul className="space-y-2 text-sm" style={{ color: '#8B94A8' }}>
          <li>• <strong style={{ color: '#F5F0E4' }}>飞瓜数据</strong>：适合抖音/快手账号数据分析，需前往官网申请 API 权限</li>
          <li>• <strong style={{ color: '#F5F0E4' }}>蝉妈妈</strong>：专注抖音电商数据，适合带货类账号</li>
          <li>• <strong style={{ color: '#F5F0E4' }}>抖音开放平台</strong>：官方接口，数据最准确，但需要 OAuth 授权流程</li>
          <li>• 配置完成后，数据看板会自动从对应平台同步最新数据</li>
          <li>• API Key 会加密存储，仅用于数据同步，不会泄露</li>
        </ul>
      </div>
    </div>
  );
}
