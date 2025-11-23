import React, { useState, useEffect } from 'react';
import { MovieIcon, TVIcon, AnimeIcon, DocIcon, AnyIcon } from './CategoryIcons';

const StartPreference = ({ onNext, onBack }) => {
  const [selectedPreference, setSelectedPreference] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const preferences = [
    { id: 'movies', title: 'Movies', description: 'Feature films and cinema', icon: <MovieIcon className="w-7 h-7" />, illustration: <MovieIcon className="w-12 h-12" /> },
    { id: 'tv-series', title: 'TV Series', description: 'Episodic television shows', icon: <TVIcon className="w-7 h-7" />, illustration: <TVIcon className="w-12 h-12" /> },
    { id: 'anime', title: 'Anime', description: 'Japanese animated series and films', icon: <AnimeIcon className="w-7 h-7" />, illustration: <AnimeIcon className="w-12 h-12" /> },
    { id: 'documentaries', title: 'Documentary', description: 'Non-fiction educational content', icon: <DocIcon className="w-7 h-7" />, illustration: <DocIcon className="w-12 h-12" /> },
    { id: 'any', title: 'Any', description: 'No preference - show me everything', icon: <AnyIcon className="w-7 h-7" />, illustration: <AnyIcon className="w-12 h-12" /> }
  ];

  const handlePreferenceSelect = (id) => setSelectedPreference(id);
  const handleNext = () => onNext({ id: selectedPreference });

  return (
  <div className="flex flex-col font-sans">

      <div className="flex flex-col px-2 pb-2 max-w-[700px] w-full mx-auto relative">
  <button onClick={onBack} aria-label="Back" className="absolute top-[2px] left-2 bg-black/50 border border-[rgba(10,54,34,0.35)] text-primary px-2 py-1 rounded-md text-sm hover:bg-black/85 transition">←</button>

        <div className="text-center mt-10 mb-3">
          <h1 className="text-white text-[1.6rem] font-bold mb-2 leading-snug">What would you like to explore?</h1>
          <p className="text-[#B3B3B3] text-sm">Choose your preferred content type to get started</p>
        </div>

        <div className="flex flex-col gap-3 mb-5 flex-1">
          {preferences.map(pref => {
            const active = selectedPreference === pref.id;
            return (
              <div
                key={pref.id}
                onClick={() => handlePreferenceSelect(pref.id)}
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${active
                  ? 'bg-[#0A3622] border-[#0A3622] text-white'
                  : 'bg-[#1a1a1a] border-[rgba(10,54,34,0.35)] text-white hover:bg-[#0A3622]/15 hover:border-[#0A3622]'}`}
              >
                <div className={`flex items-center justify-center w-[50px] h-[50px] rounded-full border ${active ? 'border-white bg-black' : 'border-[#0A3622] bg-black'}`}>{pref.illustration}</div>
                <div className="flex items-center gap-3 flex-1 max-sm:flex-col max-sm:text-center">
                  <h3 className="font-bold text-white text-[1.1rem] m-0">{pref.title}</h3>
                  <p className={`text-xs m-0 ${active ? 'text-white' : 'text-[#B3B3B3]'}`}>{pref.description}</p>
                </div>
                <div className={`text-[1.3rem] font-bold ${active ? 'text-white' : 'text-[#0A3622]'}`}>→</div>
              </div>
            );
          })}
        </div>

        <div className="w-full">
          {(() => {
            const canContinue = !!selectedPreference;
            const base = 'w-full py-3.5 rounded-md text-lg font-semibold text-white disabled:bg-[#1a1a1a] disabled:text-gray-400 disabled:cursor-not-allowed';
            return (
              <button
                onClick={handleNext}
        disabled={!canContinue}
                className={base}
                style={canContinue ? { backgroundColor: '#0A3622', border: 'none', boxShadow: 'none' } : {}}
              >
                {canContinue ? 'Continue' : 'Select an option'}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default StartPreference;
