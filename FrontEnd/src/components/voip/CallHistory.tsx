// src/components/voip/CallHistory.tsx
import { useVoipStore, } from '../../services/voipService';

export function CallHistory() {
  const { callHistory, makeCall } = useVoipStore();
  
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Call History</h2>
      
      {callHistory.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No call history yet</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {callHistory.map((call) => (
            <li key={call.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{call.remoteIdentity}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{call.isIncoming ? 'Incoming' : 'Outgoing'}</span>
                    <span className="mx-1">•</span>
                    <span>{formatDateTime(call.startTime)}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-3">
                    {formatDuration(call.duration)}
                  </span>
                  
                  <button
                    onClick={() => makeCall(call.remoteIdentity)}
                    className="text-green-500 hover:text-green-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}