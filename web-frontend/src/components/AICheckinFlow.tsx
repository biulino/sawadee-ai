import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Check,
  X,
  AlertCircle,
  User,
  CreditCard,
  Key,
  Smartphone,
  QrCode,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';

interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
}

interface CheckinStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface PassportData {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  expiryDate: string;
  confidence: number;
}

interface CheckinRecord {
  id?: string;
  userId: string;
  guestEmail: string;
  passportData?: PassportData;
  passportVerified: boolean;
  faceioSessionId?: string;
  livenessVerified: boolean;
  status: string;
  verificationErrors?: string;
}

const AICheckinFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [checkinRecord, setCheckinRecord] = useState<CheckinRecord>({
    userId: '',
    guestEmail: '',
    passportVerified: false,
    livenessVerified: false,
    status: 'PENDING'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [faceVerificationInProgress, setFaceVerificationInProgress] = useState(false);
  const [digitalKeyReady, setDigitalKeyReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions for tenant theming
  const createColorStyle = (color?: string): React.CSSProperties => ({
    color: color || '#3B82F6'
  });

  const createBackgroundStyle = (color?: string): React.CSSProperties => ({
    backgroundColor: color || '#3B82F6'
  });

  const createBorderStyle = (color?: string): React.CSSProperties => ({
    borderColor: color || '#3B82F6'
  });

  // Extract tenant configuration
  useEffect(() => {
    const extractTenantConfig = async () => {
      try {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        const urlParams = new URLSearchParams(window.location.search);
        const tenantParam = urlParams.get('tenant');
        
        let tenantKey = null;
        
        // Check URL parameter first (for testing)
        if (tenantParam) {
          tenantKey = tenantParam;
        } else if (subdomain && subdomain !== 'www' && subdomain !== hostname) {
          tenantKey = subdomain;
        }
        
        if (tenantKey) {
          // Fetch tenant config from API
          const response = await fetch(`/api/tenants/key/${tenantKey}`);
          if (response.ok) {
            const tenant = await response.json();
            setTenantConfig({
              id: tenant.tenantKey,
              name: tenant.name,
              domain: tenant.domain,
              primaryColor: tenant.primaryColor || '#3B82F6',
              secondaryColor: tenant.secondaryColor || '#1E40AF',
              logo: tenant.logo
            });
            return;
          }
        }
        
        // Use default config if no tenant found
        setTenantConfig({
          id: 'default',
          name: 'AI Check-in',
          domain: 'hotelsaas.com',
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        });
      } catch (error) {
        console.error('Error fetching tenant config:', error);
        // Fallback to default
        setTenantConfig({
          id: 'default',
          name: 'AI Check-in',
          domain: 'hotelsaas.com',
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        });
      }
    };

    extractTenantConfig();
  }, []);

  const steps: CheckinStep[] = [
    {
      id: 'identification',
      title: 'Guest Identification',
      description: 'Enter your email to begin check-in',
      icon: User,
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending'
    },
    {
      id: 'passport',
      title: 'Passport Verification',
      description: 'Upload and verify your passport',
      icon: CreditCard,
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 'face',
      title: 'Face Verification',
      description: 'Complete liveness check for security',
      icon: Camera,
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 'completion',
      title: 'Digital Key',
      description: 'Receive your digital room key',
      icon: Key,
      status: currentStep === 3 ? 'active' : 'pending'
    }
  ];

  useEffect(() => {
    // Initialize FaceIO SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.faceio.net/fio.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleEmailSubmit = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkin/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Key': getCurrentTenantKey()
        },
        body: JSON.stringify({ 
          guestEmail: email,
          userId: generateUserId()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCheckinRecord({ ...checkinRecord, ...data, guestEmail: email });
        setCurrentStep(1);
      } else {
        throw new Error('Failed to start check-in process');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePassportUpload = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('passport', file);
      formData.append('checkinId', checkinRecord.id || '');

      const response = await fetch('/api/checkin/passport', {
        method: 'POST',
        headers: {
          'X-Tenant-Key': getCurrentTenantKey()
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCheckinRecord({ ...checkinRecord, ...data });
        
        if (data.passportVerified) {
          setCurrentStep(2);
        } else {
          setError('Passport verification failed. Please try again with a clearer image.');
        }
      } else {
        throw new Error('Failed to upload passport');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process passport');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceVerification = async () => {
    setFaceVerificationInProgress(true);
    setError(null);

    try {
      // Initialize FaceIO
      const faceIO = new (window as any).faceIO('fioa-your-app-id');
      
      // Enroll or authenticate
      const userInfo = await faceIO.enroll({
        locale: 'auto',
        payload: {
          checkinId: checkinRecord.id,
          email: checkinRecord.guestEmail
        }
      });

      // Send result to backend
      const response = await fetch('/api/checkin/face-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Key': getCurrentTenantKey()
        },
        body: JSON.stringify({
          checkinId: checkinRecord.id,
          faceioSessionId: userInfo.facialId,
          faceioResponse: JSON.stringify(userInfo)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCheckinRecord({ ...checkinRecord, ...data });
        
        if (data.livenessVerified) {
          setCurrentStep(3);
          setTimeout(() => setDigitalKeyReady(true), 1500);
        } else {
          setError('Face verification failed. Please try again.');
        }
      } else {
        throw new Error('Failed to complete face verification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Face verification failed');
    } finally {
      setFaceVerificationInProgress(false);
    }
  };

  const getCurrentTenantKey = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return subdomain && subdomain !== 'www' && subdomain !== hostname ? subdomain : 'default';
  };

  const generateUserId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const StepIndicator: React.FC = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div 
            className={`
              flex items-center justify-center w-12 h-12 rounded-full border-2 text-white
              ${step.status === 'completed' 
                ? 'bg-green-500 border-green-500' 
                : step.status === 'error'
                ? 'bg-red-500 border-red-500'
                : step.status === 'active'
                ? ''
                : 'bg-gray-200 border-gray-300 text-gray-500'
              }
            `}
            style={step.status === 'active' ? createBackgroundStyle(tenantConfig?.primaryColor) : {}}
          >
            {step.status === 'completed' ? (
              <Check className="h-6 w-6" />
            ) : step.status === 'error' ? (
              <X className="h-6 w-6" />
            ) : (
              <step.icon className="h-6 w-6" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`w-16 h-0.5 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const EmailStep: React.FC = () => {
    const [email, setEmail] = useState('');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to {tenantConfig?.name || 'AI Check-in'}
          </h2>
          <p className="text-gray-600">Enter your email address to begin the contactless check-in process</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-lg"
            style={{
              borderColor: tenantConfig?.primaryColor || '#3B82F6',
              '--tw-ring-color': tenantConfig?.primaryColor || '#3B82F6'
            } as React.CSSProperties}
          />
          <button
            onClick={() => handleEmailSubmit(email)}
            disabled={!email || loading}
            className="w-full mt-4 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={createBackgroundStyle(tenantConfig?.primaryColor)}
            onMouseEnter={(e) => {
              if (!loading && email) {
                e.currentTarget.style.backgroundColor = tenantConfig?.secondaryColor || '#1E40AF';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && email) {
                e.currentTarget.style.backgroundColor = tenantConfig?.primaryColor || '#3B82F6';
              }
            }}
          >
            {loading ? 'Starting Check-in...' : 'Start Check-in'}
          </button>
        </div>
      </motion.div>
    );
  };

  const PassportStep: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Passport Verification</h2>
        <p className="text-gray-600">Upload a clear photo of your passport information page</p>
      </div>

      <div className="max-w-lg mx-auto">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors"
          onClick={() => fileInputRef.current?.click()}
          style={{
            borderColor: tenantConfig?.primaryColor || '#3B82F6'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = tenantConfig?.secondaryColor || '#1E40AF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = tenantConfig?.primaryColor || '#3B82F6';
          }}
        >
          <Upload 
            className="h-12 w-12 mx-auto mb-4" 
            style={createColorStyle(tenantConfig?.primaryColor)}
          />
          <p className="text-lg text-gray-600 mb-2">Click to upload passport photo</p>
          <p className="text-sm text-gray-500">Supports JPEG, PNG up to 10MB</p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setPassportFile(file);
              handlePassportUpload(file);
            }
          }}
          className="hidden"
        />

        {passportFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{passportFile.name}</span>
              {loading && (
                <div 
                  className="animate-spin h-4 w-4 border-2 rounded-full border-r-transparent"
                  style={{ borderColor: tenantConfig?.primaryColor || '#3B82F6' }}
                />
              )}
            </div>
          </div>
        )}

        {checkinRecord.passportData && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Passport Verified</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Name: {checkinRecord.passportData.firstName} {checkinRecord.passportData.lastName}</div>
              <div>Passport: {checkinRecord.passportData.passportNumber}</div>
              <div>Nationality: {checkinRecord.passportData.nationality}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const FaceVerificationStep: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Face Verification</h2>
        <p className="text-gray-600">Complete the liveness check for secure authentication</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="relative bg-gray-100 rounded-lg p-8 mb-6">
          <Camera 
            className="h-16 w-16 mx-auto mb-4" 
            style={createColorStyle(tenantConfig?.primaryColor)}
          />
          <p className="text-gray-600 mb-4">Position your face in the camera frame</p>
          
          {faceVerificationInProgress ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div 
                  className="h-32 w-32 rounded-full mx-auto mb-4"
                  style={createBackgroundStyle(tenantConfig?.primaryColor + '33')} // 33 for opacity
                ></div>
                <p style={createColorStyle(tenantConfig?.primaryColor)}>Analyzing your face...</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleFaceVerification}
              className="text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              style={createBackgroundStyle(tenantConfig?.primaryColor)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tenantConfig?.secondaryColor || '#1E40AF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tenantConfig?.primaryColor || '#3B82F6';
              }}
            >
              Start Face Verification
            </button>
          )}
        </div>

        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1" />
            Secure
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            30 seconds
          </div>
        </div>
      </div>
    </motion.div>
  );

  const CompletionStep: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Check-in Complete!</h2>
        <p className="text-gray-600">Your digital room key is ready</p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div 
          className="text-white p-6 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${tenantConfig?.primaryColor || '#3B82F6'}, ${tenantConfig?.secondaryColor || '#1E40AF'})`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <Smartphone className="h-8 w-8" />
            <QrCode className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Digital Room Key</h3>
          <p className="text-white/80 text-sm mb-4">Room 204 • 3rd Floor</p>
          <div className="bg-white/20 p-3 rounded-lg">
            <div className="grid grid-cols-4 gap-2">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="h-2 bg-white/40 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Next Steps:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Take the elevator to the 3rd floor</li>
            <li>• Use your phone to unlock Room 204</li>
            <li>• Download our hotel app for room service</li>
          </ul>
        </div>

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
          Open Digital Key
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <StepIndicator />
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
          >
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            {currentStep === 0 && <EmailStep />}
            {currentStep === 1 && <PassportStep />}
            {currentStep === 2 && <FaceVerificationStep />}
            {currentStep === 3 && <CompletionStep />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AICheckinFlow;
