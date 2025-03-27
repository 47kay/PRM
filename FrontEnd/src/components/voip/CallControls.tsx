// src/components/voip/CallControls.tsx
import { useEffect, useState } from 'react';
import { useVoipStore } from '../../services/voipService';
import { Mic, MicOff, Pause, Phone } from 'lucide-react';

export function CallControls() {
  const { currentCall, hangupCall, toggleMute, toggleHold } = useVoipStore();
  // Removed sendDTMF since it's not being used yet
  
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  
  useEffect(() => {
    if (currentCall?.status === 'active') {
      const interval = setInterval(() => {
        setDuration((new Date().getTime() - currentCall.startTime.getTime()) / 1000);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentCall]);
  
  if (!currentCall) {
    return null;
  }
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleMute = () => {
    toggleMute();
    setIsMuted(!isMuted);
  };
  
  const handleHold = () => {
    toggleHold();
    setIsOnHold(!isOnHold);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl p-4 z-50">
      <div className="flex flex-col items-center mb-4">
        <h3 className="text-lg font-medium">{currentCall.remoteIdentity}</h3>
        <p className="text-gray-500">
          {currentCall.status === 'active' ? formatDuration(duration) : currentCall.status}
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={handleMute}
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            isMuted ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6 mb-1" /> : <Mic className="w-6 h-6 mb-1" />}
          <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
        
        <button
          onClick={handleHold}
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            isOnHold ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Pause className="w-6 h-6 mb-1" />
          <span className="text-xs">{isOnHold ? 'Resume' : 'Hold'}</span>
        </button>
        
        <button
          onClick={hangupCall}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
        >
          <Phone className="w-6 h-6 mb-1 transform rotate-225" />
          <span className="text-xs">End</span>
        </button>
      </div>
    </div>
  );
}