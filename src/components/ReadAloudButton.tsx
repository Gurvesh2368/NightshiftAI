import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { tts, SupportedLang } from '../lib/tts';

interface ReadAloudButtonProps {
  getTextToRead: () => string;
  lang?: SupportedLang;
  className?: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  getTextToRead,
  lang = 'en',
  className = ''
}) => {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      tts.stop();
    };
  }, []);

  const toggleSpeech = () => {
    if (speaking) {
      tts.stop();
      setSpeaking(false);
    } else {
      const text = getTextToRead();
      if (!text) return;

      setSpeaking(true);
      tts.speak(text, {
        lang,
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false)
      });
    }
  };

  return (
    <button
      onClick={toggleSpeech}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#2E3236] text-[#ECEEF3] hover:bg-[#383d42] active:scale-95 transition-all ${
        speaking ? 'ring-2 ring-emerald-500 text-emerald-400 animate-pulse' : ''
      } ${className}`}
      title={speaking ? 'Stop speech' : 'Read aloud in current language'}
      aria-label="Read aloud button"
    >
      {speaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
};

