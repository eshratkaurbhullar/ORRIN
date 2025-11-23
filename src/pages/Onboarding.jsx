import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingFlow from '../components/Onboarding/OnboardingFlow';
import apiClient from '../api/axiosConfig';
export default function Onboarding({ onLoginSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const location = useLocation();
  const signupData = location.state?.signupData || {};

  // Derive first/last name
  const fullName = (signupData.fullName || '').trim();
  const parts = fullName.split(/\s+/);
  const initialForOnboarding = {
    ...signupData,
    firstName: signupData.firstName || parts[0] || '',
    lastName: signupData.lastName || parts.slice(1).join(' ') || '',
    dateOfBirth: signupData.date || signupData.dateOfBirth || ''
  };

  const handleComplete = async (onboardingData) => {
  setError(null); setIsSubmitting(true);
  // Combine data as you did before
  // Normalize startPreference ids from onboarding to the app's internal values
  const startPrefMap = {
    'movies': 'films',
    'tv-series': 'shows',
    'anime': 'anime',
    'documentaries': 'documentaries',
    'any': 'films'
  };

  const normalizedStart = startPrefMap[onboardingData.startPreference?.id] || onboardingData.startPreference?.id || 'films';

  // Convert any uploaded File to a data URL so json-server can persist it in db.json
  const fileToDataUrl = (file) => new Promise((resolve) => {
    if (!file) return resolve(null);
    // If it's already a string (e.g., data URL or URL), return as-is
    if (typeof file === 'string') return resolve(file);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

  const profilePicFile = onboardingData?.profileSetup?.profilePicture || null;
  let profilePictureData = null;
  try {
    profilePictureData = await fileToDataUrl(profilePicFile);
  } catch (e) {
    // If conversion fails, continue without blocking onboarding
    profilePictureData = null;
  }
  const finalUserData = {
    email: signupData.email,
    password: signupData.password, // Ensure password is passed!
    fullName: signupData.fullName,
    firstName: onboardingData.basicInfo.firstName,
    lastName: onboardingData.basicInfo.lastName,
    dateOfBirth: onboardingData.basicInfo.dateOfBirth,
    gender: onboardingData.basicInfo.gender,
    location: onboardingData.basicInfo.location,
    profile: { bio: onboardingData.profileSetup.bio || '', profilePicture: profilePictureData || null },
    preferences: {
      startPreference: normalizedStart,
      genres: onboardingData.genrePreferences?.genres || [],
      additionalInterests: onboardingData.profileSetup?.interests || []
    }
  };
  // Add username derived from name if needed by your structure
  finalUserData.username = finalUserData.firstName || 'User';

  try {
    // POST to /users creates a new user in db.json
    const response = await apiClient.post('/users', finalUserData);
    const user = response.data; // The new user with auto-generated ID
    const fakeToken = 'json-server-token-' + user.id;
    localStorage.setItem('authToken', fakeToken);

    // Create a default profileStats entry for the new user so ProfilePage can fetch
    // per-user stats without triggering a 404. This is best-effort and won't block signup.
    const defaultProfileStats = {
      id: user.id,
      social: { following: 0, followers: 0, comments: 0 },
      stats: { tvTime: '0', episodes: 0, films: 0, shows: 0, showsStarted: 0, anime: 0, documentaries: 0, lastActive: 'New user' }
    };
    try {
      await apiClient.post('/profileStats', defaultProfileStats);
      // created default profileStats for the user (best-effort)
    } catch (psErr) {
      // Not critical — continue without blocking signup
    }

    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess({ type: 'user', data: user, isNewUser: true });
    }
  } catch (err) {
    console.error("JSON Server Register Error:", err);
    setError("Could not complete setup.");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleCancel = () => navigate('/', { replace: true });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/Signup.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div
          ref={cardRef}
          className="w-full max-w-3xl bg-black/60 text-white rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[rgba(10,54,34,0.35)] overflow-y-auto max-h-[90vh]"
        >
          {error && (
  <div className="bg-red-800/50 border border-red-600 text-white p-3 rounded-lg mb-4 text-center">
    <strong>Setup Failed:</strong> {error}
  </div>
)}

          <OnboardingFlow
            initialUserData={initialForOnboarding}
            onComplete={handleComplete}
            onCancel={handleCancel}
            scrollToTop={() => cardRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
