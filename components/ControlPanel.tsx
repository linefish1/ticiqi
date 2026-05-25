import React, { useState } from 'react';
import { PrompterSettings } from '../types';

interface ControlPanelProps {
  settings: PrompterSettings;
  updateSettings: (newSettings: Partial<PrompterSettings>) => void;
  togglePlay: () => void;
  onReset: () => void;
  openAIModal: () => void;
  openHelpModal: () => void;
  wordCount?: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  updateSettings,
  togglePlay,
  onReset,
  openAIModal,
  openHelpModal,
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
    <div className="bg-gray-900 border-t border-gray-800 p-4 w-full z-50 relative">
      
      {/* Pop-up Style Menu */}
      {showStyleMenu && (
          <div className="absolute bottom-full right-4 mb-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 w-64 animate-in fade-in slide-in-from-bottom-2 z-50">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Display Settings</h3>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-xs text-gray-500 mb-1 block">Text Color</label>
                      <div className="flex gap-2">
                        {['white', 'yellow', 'green', 'cyan'].map((c) => (
                             <button
                                key={c}
                                onClick={() => updateSettings({ textColor: c as any })}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.textColor === c ? 'border-white scale-110 ring-2 ring-gray-500' : 'border-transparent'}`}
                                style={{ backgroundColor: c === 'yellow' ? '#fbbf24' : c === 'green' ? '#4ade80' : c === 'cyan' ? '#22d3ee' : '#ffffff' }}
                                title={c}
                             />
                        ))}
                      </div>
                  </div>

                  <div>
                      <label className="text-xs text-gray-500 mb-1 block">Font Style</label>
                      <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
                          {['sans', 'serif', 'mono'].map((f) => (
                              <button
                                key={f}
                                onClick={() => updateSettings({ fontFamily: f as any })}
                                className={`flex-1 py-1 text-xs rounded transition-colors ${settings.fontFamily === f ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                              >
                                  {f === 'sans' ? 'Aa' : f === 'serif' ? 'Tk' : 'Code'}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left: Stats & Reset */}
        <div className="flex items-center gap-4 w-full lg:w-auto order-3 lg:order-1 justify-center lg:justify-start">
             <div className="flex flex-col text-xs text-gray-500 border-r border-gray-800 pr-4">
                 <span>{wordCount} words</span>
                 <span>~{estMinutes}m {estSeconds}s</span>
             </div>

             <button
                onClick={onReset}
                title="Reset Scroll to Top"
                className="p-3 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"></path><polyline points="3 8 3 12 7 12"></polyline></svg>
            </button>
        </div>

        {/* Center: Main Controls */}
        <div className="flex items-center gap-4 w-full lg:w-auto order-1 lg:order-2 justify-center bg-gray-800/50 p-2 rounded-xl border border-gray-700/50">
            <button
                onClick={() => updateSettings({ isVoiceMode: !settings.isVoiceMode, isPlaying: false })}
                className={`p-3 rounded-lg transition-all border relative ${settings.isVoiceMode ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-700'}`}
                title={settings.isVoiceMode ? "Disable Voice Mode" : "Enable Voice Following"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            </button>

            <button
                onClick={togglePlay}
                disabled={settings.isVoiceMode}
                className={`
                px-8 py-3 rounded-lg font-bold text-white transition-all transform hover:scale-105 active:scale-95 min-w-[120px]
                ${settings.isVoiceMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50' : (settings.isPlaying ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/30')}
                `}
            >
                {settings.isPlaying ? 'PAUSE' : 'START'}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-700">
                 <button onClick={() => adjustSpeed(-0.5)} className="w-8 h-8 rounded hover:bg-gray-700 text-gray-400 hover:text-white font-bold">-</button>
                 <div className="text-center w-12">
                     <div className="text-[10px] text-gray-500 uppercase">Speed</div>
                     <div className="text-emerald-400 font-bold">{settings.speed.toFixed(1)}</div>
                 </div>
                 <button onClick={() => adjustSpeed(0.5)} className="w-8 h-8 rounded hover:bg-gray-700 text-gray-400 hover:text-white font-bold">+</button>
            </div>
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-2 w-full lg:w-auto order-2 lg:order-3 justify-center lg:justify-end">
             {/* Font Size */}
             <div className="flex flex-col gap-1 w-20 mr-2">
                <input
                    type="range"
                    min="20"
                    max="150"
                    step="5"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    title="Font Size"
                />
            </div>

             <button
                onClick={() => setShowStyleMenu(!showStyleMenu)}
                className={`p-3 rounded-lg transition-colors ${showStyleMenu ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                title="Visual Settings (Color & Font)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>

             <button
                onClick={() => updateSettings({ isMirrored: !settings.isMirrored })}
                className={`p-3 rounded-lg transition-colors ${settings.isMirrored ? 'text-blue-400 bg-blue-900/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                title="Mirror Text"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </button>

             <button
                onClick={openAIModal}
                className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-indigo-900/20 text-sm"
            >
                <span>AI</span>
            </button>
             <button
                onClick={openHelpModal}
                className="p-3 text-gray-500 hover:text-white transition-colors"
                title="Help"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;