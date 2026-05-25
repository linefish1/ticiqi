import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-emerald-500">?</span> How to Use
          </h2>
          <button 
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-gray-300">
          
          {/* Section 1: Basics */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Editing & Playback
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li><strong className="text-gray-100">Click anywhere</strong> on the text to start typing or editing your script.</li>
              <li>Press <strong className="text-gray-100 px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 font-mono text-xs">Spacebar</strong> or click <span className="text-emerald-400 font-bold">START</span> to begin auto-scrolling.</li>
              <li>Use the <span className="text-gray-100">Speed</span> slider or <span className="text-gray-100">+/-</span> buttons to adjust scrolling pace.</li>
            </ul>
          </section>

          {/* Section 2: Voice Mode */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
              Voice Following (Magic Mode)
            </h3>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <p className="mb-3">Enable <strong className="text-purple-400">Voice Mode</strong> (the microphone icon) and the teleprompter will listen to you.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">●</span>
                  <span>The script automatically scrolls to match your speaking pace.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">●</span>
                  <span>The <span className="bg-blue-600 text-white px-1 rounded text-xs">Active Word</span> is highlighted in blue so you never lose your place.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">●</span>
                  <span>Read text turns gray to track your progress.</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500 italic">Note: Requires microphone permission. Works best in Chrome or Safari.</p>
            </div>
          </section>

          {/* Section 3: AI & Tools */}
          <section className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
                AI Assistant
              </h3>
              <p className="text-sm">Click the <strong className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">AI Button</strong> to:</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-gray-400">
                <li>Generate scripts from a topic.</li>
                <li>Polish grammar and flow.</li>
                <li>Change the tone of the script.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Hardware Mode
              </h3>
               <p className="text-sm">Using a physical teleprompter glass?</p>
               <p className="text-sm mt-2 text-gray-400">Click the <strong className="text-gray-200">Mirror Button</strong> to flip the text horizontally so it reflects correctly on the glass.</p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button 
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};

export default HelpModal;