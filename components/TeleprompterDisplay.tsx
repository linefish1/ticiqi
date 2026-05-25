import React, { useEffect, useRef, useState, useMemo } from 'react';
import { PrompterSettings } from '../types';

interface TeleprompterDisplayProps {
  settings: PrompterSettings;
  text: string;
  onTextChange: (text: string) => void;
  togglePlay: () => void;
}

// A segment is now a single character to allow for char-by-char highlighting
interface CharacterSegment {
  char: string;
  isWordChar: boolean;
  normIndex: number; // Index in the normalized string, or -1 if not a word character
}

// Levenshtein distance for fuzzy string matching
const levenshteinDistance = (s: string, t: string, maxDist: number = 100): number => {
  if (s === t) return 0;
  if (s.length === 0) return t.length;
  if (t.length === 0) return s.length;
  if (Math.abs(s.length - t.length) > maxDist) return maxDist + 1;

  const d: number[][] = [];
  for (let i = 0; i <= s.length; i++) d[i] = [i];
  for (let j = 0; j <= t.length; j++) d[0][j] = j;

  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[s.length][t.length];
};

const TeleprompterDisplay: React.FC<TeleprompterDisplayProps> = ({
  settings,
  text,
  onTextChange,
  togglePlay
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const readOnlyContentRef = useRef<HTMLDivElement>(null);
  
  const lastTimeRef = useRef<number | undefined>(undefined);
  const scrollAccumulator = useRef<number>(0);
  
  // --- Voice State & Logic Refs ---
  const recognitionRef = useRef<any>(null);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const lastMatchIndexRef = useRef<number>(0);
  const isReacquiringLockRef = useRef<boolean>(true);
  const stuckCounterRef = useRef<number>(0);
  
  const [matchedIndex, setMatchedIndex] = useState<number>(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [fatalError, setFatalError] = useState(false);

  // --- Intelligent Read-State Tracking ---
  const [readIndices, setReadIndices] = useState<Set<number>>(new Set());
  const prevMatchedIndexRef = useRef<number>(-1);


  const getFontFamily = () => {
      switch(settings.fontFamily) {
          case 'serif': return 'font-serif';
          case 'mono': return 'font-mono';
          default: return 'font-sans';
      }
  };

  const getTextColor = () => {
      switch(settings.textColor) {
          case 'yellow': return '#fbbf24';
          case 'green': return '#4ade80';
          case 'cyan': return '#22d3ee';
          default: return 'white';
      }
  };

  const { segments, normalizedText } = useMemo(() => {
    const charSegments: CharacterSegment[] = [];
    let normStr = "";
    const wordRegex = /[\p{L}\p{N}]/u;
    
    for (const char of text) {
        const isWordChar = wordRegex.test(char);
        if (isWordChar) {
            const normIndex = normStr.length;
            normStr += char.toLowerCase();
            charSegments.push({ char, isWordChar, normIndex });
        } else {
            charSegments.push({ char, isWordChar, normIndex: -1 });
        }
    }
    return { segments: charSegments, normalizedText: normStr };
  }, [text]);

  useEffect(() => {
    lastMatchIndexRef.current = 0;
    setMatchedIndex(-1);
    setFatalError(false);
    isReacquiringLockRef.current = true;
    stuckCounterRef.current = 0;
    setReadIndices(new Set());
    prevMatchedIndexRef.current = -1;
  }, [normalizedText, settings.isVoiceMode]);

    // Effect to intelligently manage which characters are marked as "read"
    useEffect(() => {
        if (matchedIndex === -1 || !settings.isVoiceMode) return;

        const prevIndex = prevMatchedIndexRef.current;
        const newIndex = matchedIndex;
        const JUMP_THRESHOLD = 100; // If a forward jump is larger than this, it's a skip

        setReadIndices(currentReadIndices => {
            const newReadIndices = new Set(currentReadIndices);

            if (newIndex > prevIndex) { // Moving forward
                // If it's a small, continuous move, fill the gap
                if (newIndex - prevIndex < JUMP_THRESHOLD) {
                    for (let i = prevIndex; i < newIndex; i++) {
                        if (i >= 0) newReadIndices.add(i);
                    }
                }
                // If it's a large jump (a skip), we don't fill the gap.
            } else if (newIndex < prevIndex) { // Moving backward
                // Un-mark the text that we've gone back over
                for (let i = newIndex + 1; i <= prevIndex; i++) {
                    newReadIndices.delete(i);
                }
            }
            return newReadIndices;
        });

        prevMatchedIndexRef.current = newIndex;
    }, [matchedIndex, settings.isVoiceMode]);

  useEffect(() => {
    let animationFrameId: number;
    let isRunning = settings.isPlaying;
    const animate = (time: number) => {
      if (!isRunning || !containerRef.current) return;
      if (lastTimeRef.current !== undefined) {
        const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.1);
        const pixelsPerSecond = settings.speed * 20; 
        const currentScroll = containerRef.current.scrollTop;
        if (Math.abs(currentScroll - scrollAccumulator.current) > 5) {
             scrollAccumulator.current = currentScroll;
        }
        scrollAccumulator.current += pixelsPerSecond * deltaTime;
        containerRef.current.scrollTop = scrollAccumulator.current;
      }
      lastTimeRef.current = time;
      animationFrameId = requestAnimationFrame(animate);
    };
    if (settings.isPlaying) {
      if (containerRef.current) scrollAccumulator.current = containerRef.current.scrollTop;
      lastTimeRef.current = undefined;
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings.isPlaying, settings.speed]);

  const scrollToActiveSegment = () => {
    if (!readOnlyContentRef.current || !containerRef.current) return;
    const activeSpan = readOnlyContentRef.current.querySelector('[data-active="true"]');
    if (activeSpan) {
        try {
          const rect = activeSpan.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const centerOffset = containerRect.height / 2;
          const relativeTop = rect.top - containerRect.top;
          const targetScroll = containerRef.current.scrollTop + relativeTop - centerOffset + (rect.height / 2);
          containerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
          scrollAccumulator.current = targetScroll;
        } catch (e) {}
    }
  };

  useEffect(() => {
    if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
        recognitionRef.current = null;
    }
    if (!settings.isVoiceMode || fatalError) return;

    setVoiceStatus('初始化...');
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('浏览器不支持');
      setFatalError(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN'; 

    recognition.onstart = () => { 
        setVoiceStatus('聆听中...'); 
    };
    
    recognition.onresult = (event: any) => {
         const transcript = event.results[event.results.length - 1][0].transcript;
         let cleanTranscript = "";
         const regex = /[\p{L}\p{N}]/u;
         for (const char of transcript) {
            if (regex.test(char)) cleanTranscript += char.toLowerCase();
         }
         if (cleanTranscript.length < 2) return;

         const WINDOW_SIZE = 40; 
         const searchStr = cleanTranscript.slice(-WINDOW_SIZE);
         const currentPos = lastMatchIndexRef.current;

         const LOOK_BACK = isReacquiringLockRef.current ? 200 : 75;
         const LOOK_AHEAD_LOCAL = 300;
         const LOOK_AHEAD_GLOBAL = 2500;

         const startSearch = Math.max(0, currentPos - LOOK_BACK);
         const endSearch = Math.min(normalizedText.length, currentPos + (isReacquiringLockRef.current ? LOOK_AHEAD_GLOBAL : LOOK_AHEAD_LOCAL));

         let bestMatchIndex = -1;
         let bestScore = Infinity;
         
         for (let i = startSearch; i <= endSearch - searchStr.length; i++) {
             const candidate = normalizedText.substr(i, searchStr.length);
             const dist = levenshteinDistance(searchStr, candidate, Math.floor(searchStr.length * 0.35));
             
             let penalty = 0;
             const positionDrift = i - currentPos;
             
             if (positionDrift < 0) {
                 penalty += Math.abs(positionDrift) * 0.08; 
             } else {
                 penalty += positionDrift * 0.01;
             }
             
             const score = dist + penalty;
             
             if (dist <= searchStr.length * 0.3 && score < bestScore) {
                 bestScore = score;
                 bestMatchIndex = i;
             }
         }

         if (bestMatchIndex !== -1) {
             const newIndex = bestMatchIndex + searchStr.length - 1;
             
             if (Math.abs(newIndex - currentPos) > 1) {
                 stuckCounterRef.current = 0;
                 lastMatchIndexRef.current = newIndex;
                 setMatchedIndex(newIndex);
                 if (!isReacquiringLockRef.current) {
                    setVoiceStatus('追踪中...');
                 }
                 if (isReacquiringLockRef.current) {
                     isReacquiringLockRef.current = false;
                 }
             } else {
                 stuckCounterRef.current++;
             }
         } else {
             stuckCounterRef.current++;
         }

         if (stuckCounterRef.current >= 3) {
             if (!isReacquiringLockRef.current) {
                 isReacquiringLockRef.current = true;
             }
             stuckCounterRef.current = 0;
         }
    };

    recognition.onerror = (event: any) => {
        const errorMsg = event.error ? String(event.error) : 'Unknown Error';
        if (errorMsg === 'no-speech') return;
        if (errorMsg === 'not-allowed') {
            setVoiceStatus('麦克风被禁用');
            setFatalError(true);
            recognition.stop();
        } else if (errorMsg === 'network') {
             setVoiceStatus('网络错误');
             setTimeout(() => { try { recognition.start(); } catch(e) {} }, 1000);
        } else if (errorMsg !== 'aborted') {
            setVoiceStatus(`错误: ${errorMsg}`);
        }
    };

    recognition.onend = () => {
        if (settings.isVoiceMode && !fatalError) {
           setTimeout(() => {
               if (recognitionRef.current && !fatalError) {
                  try { recognition.start(); } catch(e) {}
               }
           }, 250);
        } else { 
            setVoiceStatus(''); 
        }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) { console.error("Failed to start recognition", e); }

    return () => {
       if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [settings.isVoiceMode, fatalError, normalizedText]);

  useEffect(() => {
     if (settings.isVoiceMode) scrollToActiveSegment();
  }, [matchedIndex, settings.isVoiceMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (settings.isPlaying || settings.isVoiceMode || document.activeElement !== contentEditableRef.current) {
          e.preventDefault();
          togglePlay();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.isPlaying, settings.isVoiceMode, togglePlay]);

  const isReadOnlyMode = settings.isPlaying || settings.isVoiceMode;

  return (
    <div className="relative flex-1 overflow-hidden bg-black w-full h-full">
      {settings.isVoiceMode && (
          <div className="absolute top-20 right-4 z-30 flex items-center gap-2 pointer-events-none">
               <div className={`px-4 py-2 rounded-full text-xs font-mono shadow-lg flex items-center gap-2 transition-all ${fatalError ? 'bg-red-900/90 border border-red-500 text-red-100' : 'bg-purple-900/90 border border-purple-500 text-purple-100'}`}>
                  {!fatalError && <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>}
                  {voiceStatus}
               </div>
          </div>
      )}

      <div className="absolute top-1/2 left-0 right-0 z-20 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-full h-0 border-t-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
        <div className="absolute right-4 -top-3 text-red-500 text-xs font-mono uppercase tracking-widest bg-black px-1">Eye Level</div>
      </div>

      <div 
        ref={containerRef}
        className={`w-full h-full overflow-y-auto no-scrollbar relative z-10 scroll-smooth ${isReadOnlyMode ? 'cursor-none' : 'cursor-text'}`}
        onClick={() => { if(settings.isPlaying) togglePlay(); }}
      >
        <div style={{ height: '50vh' }}></div>
        
        <div 
          ref={contentEditableRef}
          contentEditable={!isReadOnlyMode}
          onInput={(e) => onTextChange(e.currentTarget.innerText)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          suppressContentEditableWarning={true}
          className={`
            max-w-4xl mx-auto px-8 outline-none
            ${settings.isMirrored ? 'scale-x-[-1]' : ''}
            ${isReadOnlyMode ? 'hidden' : 'block'}
            ${getFontFamily()}
          `}
          style={{ 
            fontSize: `${settings.fontSize}px`,
            lineHeight: 1.5,
            color: getTextColor(),
            textAlign: settings.isMirrored ? 'right' : 'left',
            whiteSpace: 'pre-wrap' 
          }}
        >
            {text}
        </div>

        {isReadOnlyMode && (
             <div 
                ref={readOnlyContentRef}
                className={`
                    max-w-4xl mx-auto px-8 outline-none
                    ${settings.isMirrored ? 'scale-x-[-1]' : ''}
                    ${getFontFamily()}
                `}
                style={{ 
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: 1.5,
                    textAlign: settings.isMirrored ? 'right' : 'left',
                    whiteSpace: 'pre-wrap',
                    color: getTextColor()
                }}
             >
                {segments.map((seg, i) => {
                    const isRead = readIndices.has(seg.normIndex);
                    const isActive = seg.isWordChar && seg.normIndex === matchedIndex;

                    let className = "transition-all duration-150 ease-in-out";
                    let style = {};

                    if (isRead) {
                        style = { color: '#4b5563' };
                    } 
                    
                    if (isActive) {
                        className += " bg-blue-600 text-white rounded shadow-lg scale-110 inline-block";
                    }

                    return (
                        <span 
                            key={i} 
                            data-active={isActive ? "true" : "false"}
                            className={className}
                            style={style}
                        >
                            {seg.char}
                        </span>
                    );
                })}
             </div>
        )}
        <div style={{ height: '50vh' }}></div>
      </div>

      {!isReadOnlyMode && !isFocused && text.trim().length === 0 && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-500">
             <span className="text-xl">Drop a text file or click to start typing...</span>
         </div>
      )}
    </div>
  );
};

export default TeleprompterDisplay;