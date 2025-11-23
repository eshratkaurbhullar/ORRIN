import React, { useState, useEffect } from 'react';
import BasicInfo from './BasicInfo';
import GenrePreferences from './GenrePreferences';
import StartPreference from './StartPreference';
import ProfileSetup from './ProfileSetup';

const OnboardingFlow = ({ onComplete, initialUserData, onCancel, scrollToTop }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    basicInfo: initialUserData || {},
    genrePreferences: { genres: [] },
    startPreference: { id: '' },
    profileSetup: { bio: '', interests: [], profilePicture: null }
  });

  const steps = [
    { component: BasicInfo, title: 'Basic Information' },
    { component: GenrePreferences, title: 'Genre Preferences' },
    { component: StartPreference, title: 'Start Preference' },
    { component: ProfileSetup, title: 'Profile Setup' }
  ];

  const handleNext = (stepData) => {
    // Determine which step we're on and normalize payload under that key
    const step = steps[currentStep];
    let patch = {};
    if (step.component === GenrePreferences) {
      // stepData: { genres: [] }
      patch = { genrePreferences: { genres: stepData.genres || [] } };
    } else if (step.component === StartPreference) {
      // stepData: { id: 'movies' | 'tv-series' | ... }
      patch = { startPreference: { id: stepData.id || '' } };
    } else if (step.component === BasicInfo) {
      patch = { basicInfo: stepData };
    } else if (step.component === ProfileSetup) {
      patch = { profileSetup: stepData };
    }

    setOnboardingData(prev => ({
      ...prev,
      ...patch
    }));

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding: include latest patch
      const finalData = {
        ...onboardingData,
        ...patch
      };
      onComplete(finalData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      // if at the first step, call onCancel so parent can navigate back
      if (typeof onCancel === 'function') onCancel();
    }
  };

  const handleSkip = () => {
    // Skip profile setup and complete onboarding
    onComplete(onboardingData);
  };

  const CurrentComponent = steps[currentStep].component;

  // helper to call overall onComplete from ProfileSetup
  const handleFinalComplete = (profileData) => {
    const finalData = {
      ...onboardingData,
      profileSetup: profileData
    };
    onComplete(finalData);
  };

  // Ensure the scrollable card starts at the top whenever the step changes
  useEffect(() => {
    if (typeof scrollToTop === 'function') {
      scrollToTop();
    } else {
      // Fallback scroll
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    }
  }, [currentStep, scrollToTop]);

  return (
    <div className="flex flex-col font-sans">
      <div className="bg-transparent px-2 py-3 border-b border-white/10">
        <div className="flex justify-center gap-2 mb-2">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`rounded-full transition-all duration-300 ${index <= currentStep ? 'bg-primary shadow-[0_0_6px_rgba(10,54,34,0.5)]' : 'bg-[#333]'} ${index <= currentStep ? 'w-2.5 h-2.5' : 'w-2.5 h-2.5'}`}
            />
          ))}
        </div>
        <div className="w-full h-[4px] bg-[#1a1a1a] rounded mb-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-emerald-600 to-primary shadow-[0_0_6px_rgba(10,54,34,0.6)] transition-[width] duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            aria-valuenow={(currentStep + 1)}
            aria-valuemin={1}
            aria-valuemax={steps.length}
            role="progressbar"
          />
        </div>
        <h2 className="text-white text-base font-bold text-center m-0">{steps[currentStep].title}</h2>
      </div>

      <div className="flex-1 mt-2">
        <CurrentComponent
          userData={onboardingData.basicInfo}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          onComplete={currentStep === steps.length - 1 ? handleFinalComplete : undefined}
        />
      </div>
    </div>
  );
};

export default OnboardingFlow;
