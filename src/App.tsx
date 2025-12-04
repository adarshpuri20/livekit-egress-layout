import { useEffect, useState } from 'react';
import { Room, RoomEvent, Track, VideoPresets } from 'livekit-client';
import EgressHelper from '@livekit/egress-sdk';
import './App.css';

function App() {
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        console.log('[LAYOUT] Starting egress layout...');
        setStatus('Preparing egress room...');

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
        });

        console.log('[LAYOUT] Room created. Setting up EgressHelper...');
        EgressHelper.setRoom(room);

        let hasStarted = false;

        // Track subscription handler
        room.on(RoomEvent.TrackSubscribed, (track) => {
          console.log('[LAYOUT] Track subscribed:', track.kind);
          setStatus(`Track subscribed: ${track.kind}`);
          
          if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
            const element = track.attach();
            document.getElementById('grid-area')?.appendChild(element);
            console.log('[LAYOUT] Media element attached to DOM');

            if (!hasStarted) {
              console.log('[LAYOUT] First media track detected. Sending START_RECORDING...');
              EgressHelper.startRecording();
              hasStarted = true;
              console.log('[LAYOUT] START_RECORDING signal sent successfully.');
              setStatus('Recording signal sent.');
            }
          }
        });

        // Fallback: Start recording after connection even if tracks are slow
        room.on(RoomEvent.Connected, () => {
          console.log('[LAYOUT] Room connected successfully.');
          setStatus('Connected to room.');
          
          // Wait 2 seconds for tracks, then start anyway
          setTimeout(() => {
            if (!hasStarted) {
              console.log('[LAYOUT] Timeout reached. Starting recording without waiting for tracks...');
              EgressHelper.startRecording();
              hasStarted = true;
              console.log('[LAYOUT] START_RECORDING sent via timeout fallback.');
              setStatus('Recording started (fallback).');
            }
          }, 2000);
        });

        // Get connection params
        console.log('[LAYOUT] Getting LiveKit URL from EgressHelper...');
        const url = EgressHelper.getLiveKitURL();
        console.log('[LAYOUT] URL:', url);

        console.log('[LAYOUT] Getting access token from EgressHelper...');
        const token = EgressHelper.getAccessToken();
        console.log('[LAYOUT] Token received. Length:', token?.length);

        if (!url || !token) {
          throw new Error('URL or token not provided by EgressHelper');
        }

        console.log('[LAYOUT] Connecting to room...');
        setStatus('Connecting to room...');
        await room.connect(url, token);
        
        console.log('[LAYOUT] Connection initiated. Waiting for tracks...');
        setStatus('Connected. Waiting for tracks...');

      } catch (e: any) {
        console.error('[LAYOUT] ERROR:', e?.message, e);
        setError(e?.message || 'Unknown error');
        setStatus('Error');
      }
    };

    run();
  }, []);

  return (
    <div className="layout-container">
      <div id="grid-area" />
      <div
        className="status-overlay"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000,
          maxWidth: '400px',
        }}
      >
        <p><b>Egress Layout Status:</b> {status}</p>
        {error && <p style={{ color: 'red' }}><b>Error:</b> {error}</p>}
      </div>
    </div>
  );
}

export default App;