// src/components/voip/IncomingCallModal.tsx
import { useEffect, useState } from 'react';
import { useVoipStore } from '../../services/voipService';
import { Phone, X } from 'lucide-react';

export function IncomingCallModal() {
  const { currentCall, answerCall, hangupCall } = useVoipStore();
  const [ringtone] = useState(new Audio('/sounds/ringtone.mp3'));
  
  const isIncoming = currentCall?.isIncoming && currentCall?.status === 'ringing';
  
  useEffect(() => {
    if (isIncoming) {
      ringtone.loop = true;
      ringtone.play().catch(e => console.log('Could not play ringtone:', e));
    } else {
      ringtone.pause();
      ringtone.currentTime = 0;
    }
    
    return () => {
      ringtone.pause();
    };
  }, [isIncoming, ringtone]);
  
  if (!isIncoming) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Incoming Call</h3>
          <p className="text-lg font-medium">{currentCall.remoteIdentity}</p>
        </div>
        
        <div className="flex justify-center space-x-8">
          <button
            onClick={hangupCall}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
              <X size={28} />
            </div>
            <span className="text-sm">Decline</span>
          </button>
          
          <button
            onClick={answerCall}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
              <Phone size={28} />
            </div>
            <span className="text-sm">Answer</span>
          </button>
        </div>
      </div>
    </div>
  );
}