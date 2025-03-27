// src/components/voip/Dialer.tsx
import { useState } from 'react';
import { useVoipStore } from '../../services/voipService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function Dialer() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { makeCall, isRegistered } = useVoipStore();
  
  const handleCall = async () => {
    if (phoneNumber.trim()) {
      try {
        await makeCall(phoneNumber.trim());
      } catch (error) {
        console.error('Failed to initiate call:', error);
      }
    }
  };
  
  const dialPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];
  
  const addDigit = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Dialer</h2>
      
      <div className="mb-4">
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
          className="text-lg text-center"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {dialPad.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-between">
            {row.map(digit => (
              <button
                key={digit}
                onClick={() => addDigit(digit)}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-medium"
              >
                {digit}
              </button>
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={handleCall}
          disabled={!isRegistered || !phoneNumber.trim()}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        </Button>
      </div>
    </div>
  );
}