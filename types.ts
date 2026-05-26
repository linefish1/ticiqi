export interface PrompterSettings {
  speed: number;
  fontSize: number;
  isMirrored: boolean;
  isPlaying: boolean;
  isEditing: boolean;
  isVoiceMode: boolean;
  fontFamily: 'sans' | 'serif' | 'mono';
  textColor: 'white' | 'yellow' | 'green' | 'cyan';
  bgOpacity: number;
  textOpacity: number;
}

export interface ScriptSuggestion {
  title: string;
  content: string;
}

export enum AppMode {
  EDIT = 'EDIT',
  PROMPT = 'PROMPT'
}