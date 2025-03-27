// src/services/voipService.ts
import { create } from 'zustand';

// Define types
export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'active' | 'holding' | 'ended';

export interface Call {
  id: string;
  status: CallStatus;
  remoteIdentity: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  isIncoming: boolean;
  audioElement?: HTMLAudioElement;
}

export interface SipConfig {
  sipServer: string;
  sipUsername: string;
  sipPassword: string;
  displayName?: string;
}

// Define the store
interface VoipState {
  isRegistered: boolean;
  currentCall: Call | null;
  callHistory: Call[];
  registerSIP: (config: SipConfig) => Promise<void>;
  makeCall: (destination: string) => Promise<string>;
  hangupCall: () => void;
  answerCall: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  sendDTMF: (digit: string) => void;
}

// Create the Zustand store
export const useVoipStore = create<VoipState>((set, get) => ({
  isRegistered: false,
  currentCall: null,
  callHistory: [],
  
  registerSIP: async (config: SipConfig) => {
    // This would use the actual implementation with JsSIP
    // For now, we'll mock successful registration
    console.log('Registering SIP with config:', config);
    
    // In a real implementation, we would:
    // 1. Create a WebSocket connection to the SIP server
    // 2. Register with credentials
    // 3. Set up event handlers for incoming calls
    
    // Mock success after delay
    return new Promise((resolve) => {
      setTimeout(() => {
        set({ isRegistered: true });
        console.log('SIP registered successfully');
        resolve();
      }, 1000);
    });
  },
  
  makeCall: async (destination: string) => {
    console.log(`Making call to ${destination}`);
    if (!get().isRegistered) {
      throw new Error('Not registered with SIP server');
    }
    
    // Create a unique call ID
    const callId = `call-${Date.now()}`;
    
    // Create a new call object
    const call: Call = {
      id: callId,
      status: 'connecting',
      remoteIdentity: destination,
      startTime: new Date(),
      duration: 0,
      isIncoming: false,
    };
    
    set({ currentCall: call });
    
    // Mock call connection after delay
    setTimeout(() => {
      set({
        currentCall: {
          ...call,
          status: 'active'
        }
      });
      
      // Start call duration timer
      const intervalId = setInterval(() => {
        const currentCall = get().currentCall;
        if (currentCall && currentCall.id === callId) {
          set({
            currentCall: {
              ...currentCall,
              duration: (new Date().getTime() - currentCall.startTime.getTime()) / 1000
            }
          });
        } else {
          clearInterval(intervalId);
        }
      }, 1000);
    }, 1500);
    
    return callId;
  },
  
  hangupCall: () => {
    const { currentCall } = get();
    if (currentCall) {
      const endedCall: Call = {
        ...currentCall,
        status: 'ended',
        endTime: new Date(),
      };
      
      // Type-safe update function
      set((state) => ({
        currentCall: null,
        callHistory: [endedCall, ...state.callHistory].slice(0, 50) // Keep last 50 calls
      }));
    }
  },
  
  answerCall: () => {
    const { currentCall } = get();
    if (currentCall && currentCall.status === 'ringing') {
      set({
        currentCall: {
          ...currentCall,
          status: 'active'
        }
      });
      
      // Start call duration timer
      const intervalId = setInterval(() => {
        const updatedCall = get().currentCall;
        if (updatedCall && updatedCall.id === currentCall.id) {
          set({
            currentCall: {
              ...updatedCall,
              duration: (new Date().getTime() - updatedCall.startTime.getTime()) / 1000
            }
          });
        } else {
          clearInterval(intervalId);
        }
      }, 1000);
    }
  },
  
  toggleMute: () => {
    console.log('Toggle mute');
    // In real implementation, this would mute the audio track
  },
  
  toggleHold: () => {
    const { currentCall } = get();
    if (currentCall) {
      const newStatus: CallStatus = currentCall.status === 'holding' ? 'active' : 'holding';
      set({
        currentCall: {
          ...currentCall,
          status: newStatus
        }
      });
    }
  },
  
  sendDTMF: (digit: string) => {
    console.log('Sending DTMF:', digit);
    // In a real implementation, this would send DTMF tones
  }
}));

// Add a function to simulate incoming calls (for testing)
export const simulateIncomingCall = (phoneNumber: string) => {
  const { isRegistered, currentCall } = useVoipStore.getState();
  
  if (!isRegistered || currentCall) {
    return;
  }
  
  const call: Call = {
    id: `incoming-${Date.now()}`,
    status: 'ringing',
    remoteIdentity: phoneNumber,
    startTime: new Date(),
    duration: 0,
    isIncoming: true,
  };
  
  useVoipStore.setState({ currentCall: call });
  
  // Play ringtone (would be implemented in the IncomingCallModal component)
};