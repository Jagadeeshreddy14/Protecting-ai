import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { Button, Input, Card, Select } from '../components/UI';
import { Camera, CheckCircle, ShieldAlert, Zap } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Webcam Logic ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error", err);
      alert("Camera required for verification.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, 320, 240);
      setPhoto(canvas.toDataURL('image/jpeg'));
      // Stop camera to save resources
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate Network Delay & Validation
    setTimeout(() => {
      // Basic Validation
      if (!email || !password) {
        alert("Please fill all fields");
        setIsLoading(false);
        return;
      }

      if (isRegister && !photo && role === UserRole.STUDENT) {
        alert("Face capture is mandatory for student registration.");
        setIsLoading(false);
        return;
      }

      // One-User-One-Session Check (Simulation)
      // In real backend, this returns a session token.
      const sessionId = `sess_${Date.now()}`;
      localStorage.setItem('proctor_session_id', sessionId);
      
      const user: User = {
        id: email, // simple ID
        name: isRegister ? name : (email.includes('prof') ? 'Professor Smith' : 'John Doe'),
        email,
        role: email.includes('prof') || role === UserRole.PROFESSOR ? UserRole.PROFESSOR : UserRole.STUDENT,
        photoUrl: photo || undefined
      };
      
      onLogin(user);
      setIsLoading(false);
    }, 1500);
  };

  const handleDemoLogin = (demoRole: UserRole) => {
    const isProf = demoRole === UserRole.PROFESSOR;
    // 1x1 pixel transparent gif as dummy photo
    const dummyPhoto = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    
    const user: User = {
      id: isProf ? 'prof@demo.com' : 'student@demo.com',
      name: isProf ? 'Dr. Demo Professor' : 'Alex Demo Student',
      email: isProf ? 'prof@demo.com' : 'student@demo.com',
      role: demoRole,
      photoUrl: isProf ? undefined : dummyPhoto
    };

    localStorage.setItem('proctor_session_id', `sess_demo_${Date.now()}`);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
           <span className="bg-brand-100 text-brand-700 p-3 rounded-full inline-block mb-3">
             <ShieldAlert size={32} />
           </span>
           <h2 className="text-3xl font-extrabold text-gray-900">ProctorAI</h2>
           <p className="mt-2 text-sm text-gray-600">Secure Online Examination System</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegister && (
               <Input 
                label="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            )}
            
            <Input 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />

            {isRegister && (
               <Select
                label="Role"
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                options={[
                  { label: "Student", value: UserRole.STUDENT },
                  { label: "Professor", value: UserRole.PROFESSOR }
                ]}
               />
            )}

            {/* Face Capture Section for Student Registration/Login */}
            {(isRegister || role === UserRole.STUDENT) && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {isRegister ? "Face ID Registration" : "Face Verification"}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 relative">
                  {photo ? (
                    <div className="text-center">
                      <img src={photo} alt="Captured" className="mx-auto h-32 w-auto rounded-md" />
                      <button 
                        type="button" 
                        onClick={() => { setPhoto(null); startCamera(); }}
                        className="mt-2 text-sm text-brand-600 hover:text-brand-500"
                      >
                        Retake Photo
                      </button>
                      <div className="mt-2 flex items-center justify-center text-green-600 text-sm font-medium">
                        <CheckCircle size={16} className="mr-1" /> Verified
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <video ref={videoRef} autoPlay muted className="mx-auto h-32 w-full object-cover rounded bg-gray-200" />
                      {!videoRef.current?.srcObject ? (
                        <Button type="button" size="sm" onClick={startCamera} variant="secondary" icon={Camera}>
                          Start Camera
                        </Button>
                      ) : (
                        <Button type="button" size="sm" onClick={capturePhoto} variant="primary">
                          Capture Face
                        </Button>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Ensure your face is clearly visible.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                {isRegister ? "Register" : "Sign In"}
              </Button>
            </div>
          </form>

          {/* Demo Login Section */}
          <div className="mt-6">
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-medium">Quick Demo Access</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  icon={Zap}
                  onClick={() => handleDemoLogin(UserRole.STUDENT)}
                >
                  Student
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  icon={Zap}
                  onClick={() => handleDemoLogin(UserRole.PROFESSOR)}
                >
                  Professor
                </Button>
              </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isRegister ? "Already have an account?" : "New to ProctorAI?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => { setIsRegister(!isRegister); setPhoto(null); }}
              >
                {isRegister ? "Sign in instead" : "Create an account"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};