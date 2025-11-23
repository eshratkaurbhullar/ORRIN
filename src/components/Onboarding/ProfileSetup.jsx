import React, { useState, useEffect } from 'react';

const ProfileSetup = ({ onComplete, onBack, onSkip }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [profileData, setProfileData] = useState({
    profilePicture: null,
    bio: '',
    interests: []
  });
  const [previewImage, setPreviewImage] = useState(null);

  const additionalInterests = [
    'Gaming',
    'Reading',
    'Music',
    'Sports',
    'Travel',
    'Cooking',
    'Photography',
    'Art',
    'Technology',
    'Fitness',
    'Fashion',
    'Nature'
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({ ...prev, profilePicture: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleComplete = () => {
    if (typeof onComplete === 'function') {
      onComplete(profileData);
    }
  };

  return (
  <div className="flex flex-col font-sans">

      <div className="flex flex-col px-2 pb-2 max-w-[600px] w-full mx-auto relative">
  <button onClick={onBack} aria-label="Back" className="absolute top-[2px] left-2 bg-black/50 border border-[rgba(10,54,34,0.35)] text-primary px-2 py-1 rounded-md text-sm hover:bg-black/85 transition">←</button>

        <div className="text-center mt-10 mb-3">
          <h1 className="text-white text-[1.6rem] font-bold mb-2 leading-snug">Complete your profile</h1>
          <p className="text-[#B3B3B3] text-sm">Add a profile picture and tell us more about yourself</p>
        </div>

        <div className="flex flex-col gap-4 mb-6 flex-1">
          <div className="flex justify-center">
            <div className="relative w-30 h-30 w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-primary cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(10,54,34,0.3)] group">
              {previewImage ? (
                <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                  <span className="text-5xl text-[#666]">👤</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-picture"
                />
                <label htmlFor="profile-picture" className="cursor-pointer text-white font-bold text-xs px-3 py-2 rounded-md bg-primary/80 hover:bg-primary transition">
                  📷 Upload Photo
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">Bio (Optional)</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us a bit about yourself..."
              maxLength={200}
              className="bg-black border border-[#333] rounded-lg p-3 text-white text-sm min-h-[80px] resize-y focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(10,54,34,0.3)] placeholder:text-[#666] transition"
            />
            <span className="text-[#666] text-[0.7rem] text-right">{profileData.bio.length}/200</span>
          </div>

            <div className="flex flex-col gap-3">
              <label className="text-white text-sm font-medium">Additional Interests (Optional)</label>
              <div className="grid [grid-template-columns:repeat(auto-fit,minmax(110px,1fr))] gap-2 max-md:[grid-template-columns:repeat(auto-fit,minmax(90px,1fr))] max-sm:grid-cols-2">
                {additionalInterests.map(interest => {
                  const active = profileData.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`text-center rounded-full px-3 py-2 text-[0.85rem] font-medium border transition-colors ${active
                        ? 'bg-[#0A3622] border-[#0A3622] text-white'
                        : 'bg-black border-[rgba(10,54,34,0.35)] text-white hover:bg-[#0A3622]/15 hover:border-[#0A3622]'}`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
        </div>

        <div className="flex gap-3 w-full mt-auto max-sm:flex-col">
          <button onClick={onSkip} className="flex-1 bg-[#1a1a1a] border border-[#444] text-gray-400 px-4 py-3 rounded-lg font-bold text-sm hover:border-[#666] hover:text-gray-300 transition">Skip for now</button>
          {(() => {
            const ready = true; // always allowed; adjust condition if needed
            const base = 'flex-[2] px-4 py-3 rounded-md font-semibold text-sm text-white disabled:bg-[#1a1a1a] disabled:text-gray-400 disabled:cursor-not-allowed';
            return (
              <button type="button" disabled={!ready} onClick={handleComplete} className={base} style={ready ? { backgroundColor: '#0A3622', border: 'none', boxShadow: 'none' } : {}}>
                {ready ? 'Complete Setup' : 'Complete Setup'}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
