// src/components/voip/VoipSetup.tsx
import { useEffect, useState } from 'react';
import { useVoipStore } from '../../services/voipService';

export function VoipSetup() {
    const [isWebRtcSupported, setIsWebRtcSupported] = useState(true);
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

    useEffect(() => {
        // Check WebRTC support
        const isSupported = checkWebRtcSupport();
        setIsWebRtcSupported(isSupported);

        if (isSupported) {
            // Load saved config and try to connect
            const savedConfig = localStorage.getItem('voipConfig');

            if (savedConfig) {
                try {
                    const config = JSON.parse(savedConfig);
                    // Auto-register with saved config
                    useVoipStore.getState().registerSIP(config).catch(err => {
                        console.warn('Failed to auto-register SIP:', err);
                    });
                } catch (error) {
                    console.error('Invalid saved VoIP config:', error);
                }
            } else {
                // Show permission prompt if no saved config
                setShowPermissionPrompt(true);
            }
        }
    }, []);

    // Check browser compatibility for WebRTC
    // Check browser compatibility for WebRTC
    const checkWebRtcSupport = () => {
        return !!(
            navigator.mediaDevices &&
            (navigator.mediaDevices as any).getUserMedia &&
            window.RTCPeerConnection
        );
    };

    // Request microphone access
    const requestMicrophoneAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop tracks after check (we're just testing permission)
            stream.getTracks().forEach(track => track.stop());
            setShowPermissionPrompt(false);
            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            return false;
        }
    };

    if (!isWebRtcSupported) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Browser Not Supported</h3>
                <p className="text-yellow-700">
                    Your browser doesn't support WebRTC, which is required for voice calls.
                    Please use a modern browser like Chrome, Firefox, or Edge.
                </p>
            </div>
        );
    }

    if (showPermissionPrompt) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Microphone Access Required</h3>
                <p className="text-blue-700 mb-4">
                    To make and receive voice calls, you need to allow access to your microphone.
                    This permission is only used during active calls.
                </p>
                <button
                    onClick={requestMicrophoneAccess}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                    Allow Microphone Access
                </button>
            </div>
        );
    }

    return null;
}