// src/pages/VoIP.tsx
import { useState } from 'react';
import { Dialer } from '../components/voip/Dialer';
import { CallHistory } from '../components/voip/CallHistory';
import { VoipSettings } from '../components/voip/VoipSettings';
import { VoipSetup } from '../components/voip/VoipSetup';

const VoIP = () => {
  const [activeTab, setActiveTab] = useState<'dialer' | 'history' | 'settings'>('dialer');
  
  return (
    <div className="container mx-auto">
      <VoipSetup />
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('dialer')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'dialer'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              Dialer
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('history')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              Call History
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('settings')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </li>
        </ul>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeTab === 'dialer' && (
          <>
            <div className="md:col-span-1">
              <Dialer />
            </div>
            <div className="md:col-span-2">
              <CallHistory />
            </div>
          </>
        )}
        
        {activeTab === 'history' && (
          <div className="md:col-span-3">
            <CallHistory />
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="md:col-span-3">
            <VoipSettings />
          </div>
        )}
      </div>
    </div>
  );
};

export default VoIP;