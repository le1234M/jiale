'use client';

import { useState } from 'react';
import { X, Sparkles, BookOpen, Play, Check } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
  onCreateAccount: (name: string) => void;
  onTryDemo: () => void;
}

export function OnboardingWizard({ onComplete, onCreateAccount, onTryDemo }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [accountName, setAccountName] = useState('');

  const steps = [
    {
      title: '欢迎使用佳乐本地生活服务',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#D4AF6A]/10 to-[#E8C989]/5 border border-[#D4AF6A]/20">
            <Sparkles className="w-6 h-6 text-[#D4AF6A]" />
            <div>
              <div className="text-sm font-semibold text-[#F5F0E4]">专业文案生成</div>
              <div className="text-xs text-[#8B94A8] mt-0.5">基于抖音本地生活爆款方法论</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#D4AF6A]/10 to-[#E8C989]/5 border border-[#D4AF6A]/20">
            <BookOpen className="w-6 h-6 text-[#D4AF6A]" />
            <div>
              <div className="text-sm font-semibold text-[#F5F0E4]">内容运营工作台</div>
              <div className="text-xs text-[#8B94A8] mt-0.5">日历排期 · 数据分析 · 素材管理</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#D4AF6A]/10 to-[#E8C989]/5 border border-[#D4AF6A]/20">
            <Play className="w-6 h-6 text-[#D4AF6A]" />
            <div>
              <div className="text-sm font-semibold text-[#F5F0E4]">一键生成多类型内容</div>
              <div className="text-xs text-[#8B94A8] mt-0.5">短视频脚本 · 口播文案 · 直播话术 · 月度选题</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '创建您的第一个账号',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#8B94A8] leading-relaxed">
            请为您的抖音账号创建一个名称，方便后续管理多个账号。
          </p>
          <div>
            <label className="text-xs font-medium text-[#F5F0E4] mb-2 block">账号名称</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="如：佳乐是个编导"
              className="w-full px-4 py-3 rounded-lg bg-[#12213F] border border-[rgba(212,175,106,0.2)] text-[#F5F0E4] placeholder-[#8B94A8]/50 focus:border-[#D4AF6A]/60 focus:outline-none transition-all text-sm"
            />
          </div>
          <div className="p-3 rounded-lg bg-[#1B2E56]/50 border border-[#D4AF6A]/10">
            <div className="text-xs text-[#8B94A8]">
              <div className="font-medium text-[#F5F0E4] mb-1">💡 提示</div>
              <div>您可以在后续随时添加更多账号，支持抖音、快手、小红书等多平台。</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '开始使用',
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF6A]/10 to-[#E8C989]/5 border border-[#D4AF6A]/20">
            <div className="text-sm font-semibold text-[#F5F0E4] mb-3">📝 使用指南</div>
            <div className="space-y-2 text-xs text-[#8B94A8]">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4AF6A] flex-shrink-0 mt-0.5" />
                <span>填写门店基础信息（类目、店名、卖点）</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4AF6A] flex-shrink-0 mt-0.5" />
                <span>设置运营定位（账号阶段、出镜人设、文案风格）</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4AF6A] flex-shrink-0 mt-0.5" />
                <span>填写团购信息（选填，无团购可跳过）</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4AF6A] flex-shrink-0 mt-0.5" />
                <span>选择输出类型，点击「开始生成」</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4AF6A] flex-shrink-0 mt-0.5" />
                <span>生成后可一键添加到内容日历排期</span>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#1B2E56]/50 border border-[#D4AF6A]/10">
            <div className="text-xs text-[#8B94A8]">
              <div className="font-medium text-[#F5F0E4] mb-1">🎯 输出类型</div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                <div>• 短视频脚本</div>
                <div>• 口播文案</div>
                <div>• 探店 Vlog</div>
                <div>• 直播话术</div>
                <div>• 互动话术包</div>
                <div>• 月度选题</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (step === 1) {
      // 创建账号
      if (accountName.trim()) {
        onCreateAccount(accountName.trim());
      }
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleTryDemo = () => {
    onTryDemo();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0A162E] border border-[#D4AF6A]/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF6A]/10">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? 'bg-[#D4AF6A] w-6' : 'bg-[#D4AF6A]/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-[#8B94A8] ml-2">
              {step + 1} / {steps.length}
            </span>
          </div>
          <button
            onClick={onComplete}
            className="text-[#8B94A8] hover:text-[#F5F0E4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <h2 className="text-xl font-bold text-[#F5F0E4] mb-4">
            {steps[step].title}
          </h2>
          {steps[step].content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D4AF6A]/10 flex gap-3">
          {step === 0 && (
            <button
              onClick={handleTryDemo}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#D4AF6A]/30 text-[#D4AF6A] hover:bg-[#D4AF6A]/10 transition-all text-sm font-medium"
            >
              先试试
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={step === 1 && !accountName.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] text-[#0A162E] font-semibold hover:shadow-lg hover:shadow-[#D4AF6A]/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === steps.length - 1 ? '开始使用' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  );
}
