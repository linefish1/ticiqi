import React, { useState, useEffect } from 'react';
import TeleprompterDisplay from './components/TeleprompterDisplay';
import ControlPanel from './components/ControlPanel';
import AIModal from './components/AIModal';
import HelpModal from './components/HelpModal';
import APISettingsModal from './components/APISettingsModal';
import { PrompterSettings } from './types';

const App: React.FC = () => {
  // --- State ---
  const [text, setText] = useState<string>(() => {
    const savedText = localStorage.getItem('zen_text');
    return savedText !== null ? savedText : `您好，欢迎使用 ZenPrompter，这是一款为您精心设计的个人提词器，旨在提供清晰、专注的体验。

现在，您正处于编辑模式。您可以点击本文本的任意位置开始输入、粘贴内容，或者直接从电脑拖拽一个脚本文件进来。

准备好后，请看下方的控制面板。

您可以按下“开始”按钮，或者直接敲击空格键，来启动平滑的自动滚动。使用速度控件找到最适合您的语速。

想要获得真正现代化的体验，请尝试语音模式。点击麦克风图标，授予权限，ZenPrompter 将会聆听您的声音，并跟随您的语速进行滚动。正在朗读的词语会被高亮显示，让您永远不会跟丢。

需要配合实体提词器设备使用吗？“镜像”按钮可以水平翻转文本，以便在提词器玻璃上正确显示。

如果您创作时遇到困难，我们的 AI 助手可以随时提供帮助。从一个简单的想法生成全新的脚本，或者润色您现有的文本，使其语法更通顺，语流更自然。

就是这么简单！现在您已准备好自信地进行演示。去吧，用您自己的精彩脚本替换这段文字。`;
  });

  const [settings, setSettings] = useState<PrompterSettings>(() => {
    const defaults: PrompterSettings = {
      speed: 2,
      fontSize: 60,
      isMirrored: false,
      isPlaying: false,
      isEditing: true,
      isVoiceMode: false,
      fontFamily: 'sans',
      textColor: 'white',
      bgOpacity: 50,
      textOpacity: 100
    };
    const savedSettings = localStorage.getItem('zen_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          ...defaults,
          ...parsed,
          isPlaying: false,
          isVoiceMode: false
        };
      } catch (e) {
        console.error("Failed to load settings from localStorage:", e);
      }
    }
    return defaults;
  });

  const [isAIModalOpen, setAIModalOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isApiModalOpen, setApiModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    // Save to localStorage when settings or text changes
    localStorage.setItem('zen_text', text);
    // Don't save active status flags like isPlaying or isVoiceMode
    const { isPlaying, isVoiceMode, ...toSave } = settings;
    localStorage.setItem('zen_settings', JSON.stringify(toSave));
  }, [text, settings]);


  // --- Handlers ---
  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const updateSettings = (newSettings: Partial<PrompterSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const togglePlay = () => {
    if (settings.isVoiceMode) {
      setSettings(prev => ({ ...prev, isPlaying: !prev.isPlaying, isVoiceMode: false }));
    } else {
      setSettings(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  const handleReset = () => {
    setSettings(prev => ({ ...prev, isPlaying: false, isVoiceMode: false }));
    const scroller = document.querySelector('.overflow-y-auto');
    if (scroller) scroller.scrollTop = 0;
  };

  const handleAIApply = (generatedText: string) => {
    setText(generatedText);
    handleReset();
  };

  // --- Drag & Drop ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
        if (file.type.startsWith('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
            const content = await file.text();
            setText(content);
            handleReset();
        } else {
            alert("请拖放普通的文本文件 (.txt、.md)！");
        }
    }
  };

  return (
    <div 
        className="flex flex-col h-screen overflow-hidden font-sans relative"
        style={{ backgroundColor: `rgba(0, 0, 0, ${settings.bgOpacity / 100})` }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
          <div className="absolute inset-0 z-50 bg-amber-950/80 backdrop-blur-sm flex items-center justify-center border-4 border-amber-500 border-dashed m-4 rounded-xl">
              <div className="text-center text-amber-100 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                  <h2 className="text-3xl font-bold">拖放文件以加载脚本</h2>
              </div>
          </div>
      )}

      {/* Header / Top Bar (Minimalist) */}
      <div className="absolute top-0 left-0 p-4 z-40 opacity-55 hover:opacity-100 transition-opacity">
        <h1 className="text-white font-bold tracking-tighter text-xl pointer-events-none select-none">
          Zen<span className="text-amber-500">Prompter</span>
        </h1>
      </div>

      {/* Main Display */}
      <TeleprompterDisplay 
        settings={settings} 
        text={text} 
        onTextChange={handleTextChange} 
        togglePlay={togglePlay}
      />

      {/* Controls */}
      <ControlPanel 
        settings={settings} 
        updateSettings={updateSettings} 
        togglePlay={togglePlay}
        onReset={handleReset}
        openAIModal={() => setAIModalOpen(true)}
        openHelpModal={() => setHelpModalOpen(true)}
        openApiModal={() => setApiModalOpen(true)}
        wordCount={text.split(/\s+/).filter(w => w.length > 0).length}
      />

      {/* AI Modal */}
      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => setAIModalOpen(false)}
        onApply={handleAIApply}
        currentText={text}
      />

      {/* Help Modal */}
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      {/* API Settings Modal */}
      <APISettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setApiModalOpen(false)}
      />
    </div>
  );
};

export default App;