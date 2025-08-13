import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Hand, Zap } from 'lucide-react';
import { Button } from './button';

interface VoiceSearchProps {
  onSearch: (query: string) => void;
  onCommand?: (command: string) => void;
}

export const VoiceSearch = ({ onSearch, onCommand }: VoiceSearchProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);

        if (event.results[current].isFinal) {
          processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const processVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Voice commands
    if (lowerText.includes('search for') || lowerText.includes('find')) {
      const searchQuery = text.replace(/search for|find/gi, '').trim();
      onSearch(searchQuery);
    } else if (lowerText.includes('show me') || lowerText.includes('display')) {
      onCommand?.(text);
    } else if (lowerText.includes('calculate') || lowerText.includes('mortgage')) {
      onCommand?.('open-calculator');
    } else if (lowerText.includes('chat') || lowerText.includes('help')) {
      onCommand?.('open-chat');
    } else {
      // Default to search
      onSearch(text);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={isListening ? stopListening : startListening}
        className={`relative overflow-hidden ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-black hover:bg-gray-800'
        } text-white rounded-full p-3`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        
        {/* Voice wave animation */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-red-400 rounded-full animate-ping opacity-20"></div>
          </div>
        )}
      </Button>

      {/* Transcript Display */}
      {transcript && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap z-50">
          {transcript}
        </div>
      )}
    </div>
  );
};

// Gesture Controls
export const GestureControls = ({ onGesture }: { onGesture: (gesture: string) => void }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState('');
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!isActive) return;
      
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isActive || !touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      // Gesture recognition
      if (velocity > 0.5 && distance > 50) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            setCurrentGesture('swipe-right');
            onGesture('next-property');
          } else {
            setCurrentGesture('swipe-left');
            onGesture('prev-property');
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            setCurrentGesture('swipe-down');
            onGesture('scroll-down');
          } else {
            setCurrentGesture('swipe-up');
            onGesture('scroll-up');
          }
        }

        // Clear gesture after animation
        setTimeout(() => setCurrentGesture(''), 1000);
      }

      touchStartRef.current = null;
    };

    // Mouse gestures for desktop
    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive) return;
      
      // Simple mouse tracking for eye-tracking simulation
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      // Update CSS custom properties for cursor-following elements
      document.documentElement.style.setProperty('--mouse-x', `${deltaX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${deltaY}px`);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isActive, onGesture]);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={() => setIsActive(!isActive)}
        className={`relative ${
          isActive 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-gray-600 hover:bg-gray-700'
        } text-white rounded-full p-3`}
      >
        <Hand className="w-5 h-5" />
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </Button>

      {/* Gesture feedback */}
      {currentGesture && (
        <div className="absolute bottom-full mb-2 right-0 bg-black text-white px-3 py-1 rounded-lg text-sm">
          {currentGesture.replace('-', ' ')}
        </div>
      )}
    </div>
  );
};

// Eye-tracking simulation component
export const EyeTrackingElements = () => {
  return (
    <>
      <style jsx>{`
        .eye-follow {
          transform: translate(calc(var(--mouse-x, 0px) * 0.05), calc(var(--mouse-y, 0px) * 0.05));
          transition: transform 0.1s ease-out;
        }
        
        .cursor-magnetic {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .cursor-magnetic:hover {
          transform: translate(calc(var(--mouse-x, 0px) * 0.1), calc(var(--mouse-y, 0px) * 0.1));
        }
      `}</style>
    </>
  );
};

// Haptic Feedback (for mobile)
export const useHapticFeedback = () => {
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  return { triggerHaptic };
};
