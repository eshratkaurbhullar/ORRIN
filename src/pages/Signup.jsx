import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import SignupCard from '../components/Auth/SignupCard.jsx';
import apiClient from '../api/axiosConfig';

export default function Signup({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [signupError, setSignupError] = useState(null);

  const handleSignup = async (data) => {
    setSignupError(null);
    try {
      // Check for existing user with same email
      const res = await apiClient.get(`/users?email=${encodeURIComponent(data.email)}`);
      const existing = res.data || [];
      if (existing.length > 0) {
        setSignupError('Email already in use. Try logging in.');
        return;
      }
      // No duplicate, proceed to onboarding
      navigate('/onboarding', { state: { signupData: data } });
    } catch (err) {
      // If API call fails, show friendly message and allow navigation as fallback
      setSignupError('Could not verify email; please try again.');
    }
  };

  const handleSwitchToLogin = () => {
    navigate('/login'); 
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/Signup.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {signupError && (
            <div className="mb-4 p-3 bg-red-700/20 text-red-200 rounded">{signupError}</div>
          )}
          <SignupCard 
            onSubmit={handleSignup} 
            onSwitchToLogin={handleSwitchToLogin}
          />
        </div>
      </div>
    </div>
  );
}
