// src/components/voip/VoipSettings.tsx
import { useState, useEffect } from 'react';
import { useVoipStore, SipConfig } from '../../services/voipService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function VoipSettings() {
  const { isRegistered, registerSIP } = useVoipStore();
  const [config, setConfig] = useState<SipConfig>({
    sipServer: '',
    sipUsername: '',
    sipPassword: '',
    displayName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Load config from local storage
    const savedConfig = localStorage.getItem('voipConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await registerSIP(config);
      localStorage.setItem('voipConfig', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to register SIP:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">VoIP Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="sipServer">SIP Server</Label>
            <Input
              id="sipServer"
              name="sipServer"
              value={config.sipServer}
              onChange={handleInputChange}
              placeholder="sip.example.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="sipUsername">Username</Label>
            <Input
              id="sipUsername"
              name="sipUsername"
              value={config.sipUsername}
              onChange={handleInputChange}
              placeholder="your_username"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="sipPassword">Password</Label>
            <Input
              id="sipPassword"
              name="sipPassword"
              type="password"
              value={config.sipPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="displayName">Display Name (Optional)</Label>
            <Input
              id="displayName"
              name="displayName"
              value={config.displayName}
              onChange={handleInputChange}
              placeholder="Your Name"
            />
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div>
            {isRegistered && (
              <span className="inline-flex items-center text-sm text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                Registered
              </span>
            )}
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Connecting...' : isRegistered ? 'Update' : 'Connect'}
          </Button>
        </div>
      </form>
    </div>
  );
}