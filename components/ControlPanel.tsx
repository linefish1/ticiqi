import React, { useState } from 'react';
import { PrompterSettings } from '../types';

interface ControlPanelProps {
  settings: PrompterSettings;
  updateSettings: (newSettings: Partial<PrompterSettings>) => void;
  togglePlay: () => void;
  onReset: () => void;
  openAIModal: () => void;
  openHelpModal: () => void;
  openApiModal: () => void;
  wordCount?: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  updateSettings,
  togglePlay,
  onReset,
  openAIModal,
  openHelpModal,
  openApiModal,
  wordCount = 0
}) => {
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  // Helper to adjust speed safely
  const adjustSpeed = (delta: number) => {
    const newSpeed = Math.max(0, Math.min(10, settings.speed + delta));
    const roundedSpeed = Math.round(newSpeed * 10) / 10;
    updateSettings({ speed: roundedSpeed });
  };

  // Estimate time: 130 words per minute
  const estMinutes = Math.floor(wordCount / 130);
  const estSeconds = Math.round(((wordCount / 130) - estMinutes) * 60);

  return (
    <div className="bg-gray-955 border-t border-gray-900 px-3 py-2.5 w-full z-50 relative shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
      
      {/* Pop-up Style Menu */}
      {showStyleMenu && (
          <div className="absolute bottom-full right-4 mb-2 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-4 w-72 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 z-50">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">系统设置</h3>
                  <button 
                      onClick={() => setShowStyleMenu(false)}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
              </div>
              
              <div className="space-y-4">
                  {/* Font Size */}
                  <div>
                      <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                          <span>字号大小</span>
                          <span className="text-amber-400 font-mono text-xs font-semibold">{settings.fontSize}px</span>
                      </div>
                      <input
                          type="range"
                          min="20"
                          max="150"
                          step="5"
                          value={settings.fontSize}
                          onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                  </div>

                  {/* Text Color */}
                  <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">文字色彩</label>
                      <div className="flex gap-2">
                        {['white', 'yellow', 'green', 'cyan'].map((c) => (
                             <button
                                onClick={() => updateSettings({ textColor: c as any })}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.textColor === c ? 'border-white scale-110 ring-2 ring-amber-500/50' : 'border-transparent'}`}
                                style={{ backgroundColor: c === 'yellow' ? '#fbbf24' : c === 'green' ? '#4ade80' : c === 'cyan' ? '#22d3ee' : '#ffffff' }}
                                title={c === 'yellow' ? '黄色' : c === 'green' ? '绿色' : c === 'cyan' ? '青色' : '白色'}
                             />
                        ))}
                      </div>
                  </div>

                  {/* Font Family */}
                  <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">字体系列</label>
                      <div className="grid grid-cols-3 gap-1 bg-gray-950 p-1 rounded-lg">
                          {['sans', 'serif', 'mono'].map((f) => (
                              <button
                                key={f}
                                onClick={() => updateSettings({ fontFamily: f as any })}
                                className={`py-1.5 text-xs rounded transition-colors font-medium ${settings.fontFamily === f ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-gray-300'}`}
                              >
                                  {f === 'sans' ? '无衬线' : f === 'serif' ? '有衬线' : '等宽'}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Opacity Settings */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
                      <div>
                          <div className="flex justify-between items-center text-[11px] text-gray-400 mb-1">
                              <span>背景透明</span>
                              <span className="text-amber-400 font-mono text-[10px] font-semibold">{settings.bgOpacity}%</span>
                          </div>
                          <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={settings.bgOpacity}
                              onChange={(e) => updateSettings({ bgOpacity: parseInt(e.target.value) })}
                              className="w-full h-1 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                      </div>
                      <div>
                          <div className="flex justify-between items-center text-[11px] text-gray-400 mb-1">
                              <span>文字透明</span>
                              <span className="text-amber-400 font-mono text-[10px] font-semibold">{settings.textOpacity}%</span>
                          </div>
                          <input
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={settings.textOpacity}
                              onChange={(e) => updateSettings({ textOpacity: parseInt(e.target.value) })}
                              className="w-full h-1 bg-gray-955 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                      </div>
                  </div>

                  {/* Mirror & Help buttons inside menu */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800">
                      <button
                          onClick={() => updateSettings({ isMirrored: !settings.isMirrored })}
                          className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${settings.isMirrored ? 'bg-amber-950/20 border-amber-500/40 text-amber-400' : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'}`}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3"/>
                            <path d="M10 5L4 12l6 7V5z" fill={settings.isMirrored ? 'currentColor' : 'none'}/>
                          </svg>
                          <span>镜像翻转</span>
                      </button>

                      <button
                          onClick={() => {
                              openHelpModal();
                              setShowStyleMenu(false);
                          }}
                          className="py-2 px-3 rounded-lg bg-gray-955 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          <span>使用说明</span>
                      </button>
                  </div>

                  {/* API settings button */}
                  <div className="pt-2">
                      <button
                          onClick={() => {
                              openApiModal();
                              setShowStyleMenu(false);
                          }}
                          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                          <span>API 接口设置</span>
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 sm:gap-4">
        
        {/* Left Section: Compact Stats & Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2">
             <div className="hidden min-[400px]:flex flex-col text-[10px] md:text-xs text-gray-500 leading-tight border-r border-gray-800 pr-2">
                 <span className="font-semibold text-amber-500">{wordCount} 字</span>
                 <span className="whitespace-nowrap text-gray-400">约 {estMinutes}分{estSeconds}秒</span>
             </div>

             <button
                onClick={onReset}
                title="重置到顶部"
                className="p-2.5 rounded-full bg-gray-900 text-amber-500 hover:text-amber-400 hover:bg-gray-800 transition-colors border border-amber-500/10"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"></path><polyline points="3 8 3 12 7 12"></polyline></svg>
             </button>
        </div>

        {/* Center: Playback / Speed (Beautiful capsule layout) */}
        <div className="flex items-center gap-1 sm:gap-2.5 bg-gray-900/95 px-1.5 py-1 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            {/* Voice Mode Toggle */}
            <button
                onClick={() => updateSettings({ isVoiceMode: !settings.isVoiceMode, isPlaying: false })}
                className={`p-2 rounded-full transition-all border relative ${settings.isVoiceMode ? 'bg-amber-500 border-amber-450 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-transparent border-transparent text-gray-450 hover:text-amber-400'}`}
                title={settings.isVoiceMode ? "禁用语音跟读" : "启用语音跟读"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                {settings.isVoiceMode && (
                  <span className="absolute top-0 right-0 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>
                )}
            </button>

            {/* Play/Pause Icon Button */}
            <button
                onClick={togglePlay}
                disabled={settings.isVoiceMode}
                className={`
                p-2 rounded-full transition-all transform active:scale-95
                ${settings.isVoiceMode ? 'bg-gray-900/40 text-gray-700 cursor-not-allowed opacity-30' : (settings.isPlaying ? 'bg-orange-600 text-white shadow shadow-orange-900/20 hover:bg-orange-500' : 'bg-amber-500 text-black font-extrabold shadow shadow-amber-500/20 hover:bg-amber-400')}
                `}
                title={settings.isPlaying ? '暂停' : '开始'}
            >
                {settings.isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>

            {/* Speed Stepper */}
            <div className="flex items-center gap-0.5 pl-1.5 border-l border-gray-800">
                 <button onClick={() => adjustSpeed(-0.5)} className="w-6 h-6 rounded-full hover:bg-gray-800 text-gray-450 hover:text-amber-500 font-bold text-xs transition-colors">-</button>
                 <div className="text-center min-w-[28px]">
                     <span className="text-amber-500 font-extrabold font-mono text-xs">{settings.speed.toFixed(1)}</span>
                 </div>
                 <button onClick={() => adjustSpeed(0.5)} className="w-6 h-6 rounded-full hover:bg-gray-800 text-gray-450 hover:text-amber-500 font-bold text-xs transition-colors">+</button>
             </div>
        </div>

        {/* Right Section: Quick Tools */}
        <div className="flex items-center gap-1.5">
             {/* AI Creative Icon Toggle */}
             <button
                onClick={openAIModal}
                className="p-2.5 rounded-full text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors border border-amber-500/10"
                title="AI 创作 (生成口播脚本)"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="m5 3 1.25 2.75L9 7l-2.75 1.25L5 11l-1.25-2.75L1 7l2.75-1.25L5 3Z"/><path d="m19 17 1 2.25L22.25 20 20 21l-1 2.25-1-2.25-2.25-1 2.25-1 1-2.25Z"/></svg>
             </button>

             {/* Style & Main Settings Gear */}
             <button
                onClick={() => setShowStyleMenu(!showStyleMenu)}
                className={`p-2.5 rounded-full transition-all border ${showStyleMenu ? 'bg-amber-500/20 border-amber-500/45 text-amber-400' : 'bg-transparent border-amber-500/10 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10'}`}
                title="系统设置"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
             </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;