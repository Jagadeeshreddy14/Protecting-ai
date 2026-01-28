import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, AlertTriangle, Eye, Activity, Mic, Monitor, Volume2, ArrowLeft, ArrowRight } from 'lucide-react';
import { ProctorLog } from '../types';
import { Button } from './UI';

interface ProctoringProps {
  isActive: boolean;
  onLog: (log: ProctorLog) => void;
  onTerminate?: () => void;
}

export const ProctoringWidget: React.FC<ProctoringProps> = ({ isActive, onLog, onTerminate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [warnings, setWarnings] = useState<number>(0);
  const [tabSwitches, setTabSwitches] = useState<number>(0);
  
  // Real-time Simulation State
  const [audioStatus, setAudioStatus] = useState<'Normal' | 'High' | 'Low'>('Normal');
  const [gazeStatus, setGazeStatus] = useState<'Centered' | 'Left' | 'Right' | 'Away'>('Centered');

  // --- 1. Audio/Video Monitoring (Simulation) ---
  useEffect(() => {
    if (!isActive) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    const startProctoring = async () => {
      try {
        const ms = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(ms);
        if (videoRef.current) {
          videoRef.current.srcObject = ms;
        }
      } catch (err) {
        console.error("Camera access denied", err);
        onLog({
          timestamp: new Date().toISOString(),
          type: 'NO_FACE',
          message: 'Camera/Microphone permission denied or hardware unavailable.'
        });
      }
    };

    startProctoring();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // --- Helper: Handle Warnings ---
  const handleWarning = useCallback((type: ProctorLog['type'], message: string) => {
    if (type === 'TAB_SWITCH') {
      setTabSwitches(prev => prev + 1);
    }
    setWarnings(prev => prev + 1);
    
    onLog({
      timestamp: new Date().toISOString(),
      type,
      message
    });
    
    // Hard limit: 5 warnings then terminate (simulation)
    if (warnings >= 4 && onTerminate) {
      onTerminate();
    }
  }, [onLog, onTerminate, warnings]);

  // --- 2. Random Real-time AI Checks (Simulation) ---
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
       // Simulate AI metrics fluctuation
       const r = Math.random();
       
       // Gaze Simulation
       if (r > 0.95) setGazeStatus('Away');
       else if (r > 0.90) setGazeStatus(Math.random() > 0.5 ? 'Left' : 'Right');
       else setGazeStatus('Centered');

       // Audio Simulation
       if (r > 0.98) setAudioStatus('High');
       else setAudioStatus('Normal');

       // Random Event Triggers (Simulation)
       if (r > 0.98) {
         handleWarning('MULTIPLE_FACES', 'Suspicious activity: Multiple people detected (Simulated)');
       } else if (r > 0.96 && r <= 0.98) {
         handleWarning('NO_FACE', 'Suspicious activity: Face not clearly visible (Simulated)');
       } else if (r > 0.94 && r <= 0.96) {
          handleWarning('GAZE_WARNING', 'Suspicious activity: Frequent off-screen gaze detected (Simulated)');
       }
       
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, handleWarning]);


  // --- 3. Tab Switching & Window Events ---
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleWarning('TAB_SWITCH', 'User switched tabs or minimized window.');
      }
    };

    const handleBlur = () => {
      handleWarning('TAB_SWITCH', 'Window lost focus.');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleWarning('COPY_PASTE_ATTEMPT', 'Copy/Paste is disabled.');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isActive, handleWarning]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-brand-500 w-56 relative group transition-all duration-300 hover:scale-105">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-36 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border border-white" title="Recording"></div>
        </div>
        
        {/* Status Bar */}
        <div className="p-2 bg-gray-900 text-white text-xs flex justify-between items-center border-t border-gray-800">
          <span className="flex items-center gap-1.5 font-medium"><Eye size={12} className="text-brand-400"/> Monitoring</span>
          <span className={`${warnings > 0 ? 'text-red-400' : 'text-green-400'} font-bold bg-gray-800 px-2 py-0.5 rounded-full`}>
            {warnings} Alerts
          </span>
        </div>
        
        {/* Expanded Details on Hover */}
        <div className="hidden group-hover:block absolute bottom-full mb-3 right-0 w-72 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 border border-brand-100 text-sm text-gray-800 z-50">
           <div className="font-bold mb-3 flex items-center gap-2 text-brand-700 border-b border-gray-100 pb-2">
             <Activity size={18}/> Real-time AI Analysis
           </div>
           <ul className="space-y-3">
             <li className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-600"><Volume2 size={14}/> Audio Level</span> 
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${audioStatus === 'High' ? 'bg-red-500 w-full' : 'bg-green-500 w-1/3'}`}
                        ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{audioStatus}</span>
                </div>
             </li>
             <li className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-600"><Eye size={14}/> Gaze</span> 
                <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                    {gazeStatus === 'Centered' && <span className="text-green-600">CENTER</span>}
                    {gazeStatus === 'Left' && <><ArrowLeft size={12}/> LEFT</>}
                    {gazeStatus === 'Right' && <>RIGHT <ArrowRight size={12}/></>}
                    {gazeStatus === 'Away' && <span className="text-red-600 flex items-center gap-1"><AlertTriangle size={12}/> AWAY</span>}
                </div>
             </li>
             <li className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-600"><Monitor size={14}/> Tab Switches</span> 
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${tabSwitches > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                   {tabSwitches} DETECTED
                </span>
             </li>
           </ul>
           <div className="mt-3 text-[10px] text-gray-400 text-center uppercase tracking-wider">
             AI Proctoring Active • Session ID: {Math.random().toString(36).substr(2, 9)}
           </div>
        </div>
      </div>
    </div>
  );
};