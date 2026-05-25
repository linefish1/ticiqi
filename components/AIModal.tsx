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
      setError("Failed to generate script. Check your API Key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePolish = async () => {
    if (!currentText.trim()) {
        setError("Your teleprompter is empty. Write something or generate a new script.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await polishScript(currentText);
      onApply(result);
      onClose();
    } catch (e) {
      setError("Failed to polish script.");
    } finally {
      setIsLoading(false);
    }
  };

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
            <span className="text-purple-500">✨</span> AI Assistant
        </h2>
        <p className="text-gray-400 text-sm mb-6">Create a new script or improve your existing one using Gemini.</p>

        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded-lg mb-4">
                {error}
            </div>
        )}

        <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Generate New Script</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. A 1-minute intro for a YouTube video about React Hooks..."
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none h-32 resize-none"
                ></textarea>
                 <div className="flex gap-2 mt-2">
                    {['Professional', 'Casual', 'Funny', 'Urgent'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTone(t.toLowerCase())}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${tone === t.toLowerCase() ? 'bg-purple-900 border-purple-500 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
                        ${isLoading || !prompt.trim() ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}
                    `}
                >
                    {isLoading ? 'Thinking...' : 'Generate Script'}
                </button>
            </div>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-800"></div>
                <span className="flex-shrink-0 mx-4 text-gray-600 text-xs uppercase">OR</span>
                <div className="flex-grow border-t border-gray-800"></div>
            </div>

             <button
                onClick={handlePolish}
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? 'Polishing...' : 'Polish Current Script (Grammar & Flow)'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;