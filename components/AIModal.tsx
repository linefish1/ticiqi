import React, { useState } from 'react';
import { generateScript, polishScript } from '../services/geminiService';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
  currentText: string;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onApply, currentText }) => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateScript(prompt, tone);
      onApply(result);
      onClose();
    } catch (e) {
      setError("无法生成脚本。请检查您的 API 密钥配置，或稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePolish = async () => {
    if (!currentText.trim()) {
        setError("您的提词器文本为空！请先输入一些文字，或者生成一个新脚本。");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await polishScript(currentText);
      onApply(result);
      onClose();
    } catch (e) {
      setError("润色脚本失败。");
    } finally {
      setIsLoading(false);
    }
  };

  const tones = [
    { label: '专业学术', value: 'professional' },
    { label: '日常随性', value: 'casual' },
    { label: '趣味幽默', value: 'funny' },
    { label: '激情促销', value: 'urgent' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl p-6 relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <span className="text-amber-500">✨</span> AI 创作助手
        </h2>
        <p className="text-gray-400 text-sm mb-6">通过 Gemini 生成全新的视频/演讲脚本，或者优化您当前的文案。</p>

        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded-lg mb-4">
                {error}
            </div>
        )}

        <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">生成全新脚本</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例如：关于 React 19 新特性的 3 分钟技术分享大纲..."
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none h-32 resize-none"
                ></textarea>
                 <div className="flex gap-2 mt-2">
                    {tones.map(t => (
                        <button 
                            key={t.value}
                            onClick={() => setTone(t.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${tone === t.value ? 'bg-amber-950/60 border-amber-500/40 text-amber-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                        ${isLoading || !prompt.trim() ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-amber-500 text-black hover:bg-amber-400'}
                    `}
                >
                    {isLoading ? '正在构思脚本...' : '生成全新脚本'}
                </button>
            </div>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-800"></div>
                <span className="flex-shrink-0 mx-4 text-gray-600 text-xs uppercase">或者</span>
                <div className="flex-grow border-t border-gray-800"></div>
            </div>

             <button
                onClick={handlePolish}
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold border border-gray-700 text-gray-350 text-gray-450 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-950/20 transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? '正在润色文本...' : '润色当前提词器文字 (纠正语法与口语流畅度)'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;