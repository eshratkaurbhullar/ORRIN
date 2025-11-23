import React, { useState } from 'react';

const GenrePreferences = ({ onNext, onBack }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);

  const genres = [
    'Action & Adventure',
    'Animation',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Family',
    'History',
    'Kids',
    'Music',
    'Musical',
    'Mystery',
    'News',
    'Reality',
    'Romance',
    'Sci-Fi & Fantasy',
    'Soap',
    'Talk',
    'War & Politics',
    'Western',
    'Horror',
    'Thriller',
    'Biography',
    'Sport',
    'Game Show'
  ];

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const handleNext = () => {
    // Pass only the genres array; the flow will store under 'genrePreferences'
    onNext({ genres: selectedGenres });
  };

  return (
  <div className="flex flex-col font-sans">

      <div className="flex flex-col px-2 pb-2 max-w-[800px] w-full mx-auto relative">
  <button onClick={onBack} aria-label="Back" className="absolute top-[2px] left-2 bg-black/50 border border-[rgba(10,54,34,0.35)] text-primary px-2 py-1 rounded-md text-sm hover:bg-black/85 transition">←</button>

        <div className="text-center mt-10 mb-3">
          <h1 className="text-white text-[1.6rem] font-bold mb-2 leading-snug">What do you usually like to watch?</h1>
          <p className="text-[#B3B3B3] text-sm">Select your favorite genres to get personalized recommendations</p>
        </div>

        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] gap-3 mb-5 flex-1 max-md:[grid-template-columns:repeat(auto-fit,minmax(140px,1fr))] max-sm:grid-cols-2">
          {genres.map(genre => {
            const active = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`text-center rounded-full px-4 py-2.5 text-[0.9rem] font-medium border transition-colors duration-200 ${active
                  ? 'bg-[#0A3622] border-[#0A3622] text-white'
                  : 'bg-black border-[rgba(10,54,34,0.35)] text-white hover:bg-[#0A3622]/15 hover:border-[#0A3622]'}`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        <div className="w-full">
          {(() => {
            const canContinue = selectedGenres.length > 0;
            const base = 'w-full py-3.5 rounded-md text-lg font-semibold text-white disabled:bg-[#1a1a1a] disabled:text-gray-400 disabled:cursor-not-allowed';
            return (
              <button
                onClick={handleNext}
        disabled={!canContinue}
                className={base}
                style={canContinue ? { backgroundColor: '#0A3622', border: 'none', boxShadow: 'none' } : {}}
              >
        {canContinue ? 'Continue' : 'Select at least one genre'}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default GenrePreferences;
