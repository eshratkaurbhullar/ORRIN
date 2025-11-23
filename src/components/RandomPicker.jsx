import React, { useState, useMemo, useRef } from 'react';
import { Shuffle, X, Play } from 'lucide-react';
import mediaData from '../data/mediaData';

/**
 * Pure-media version of SpinWheel
 * (All explore data removed)
 */

const CATEGORY_TABS = [
  { key: 'movies', label: 'Movies', typeFilter: 'film' },
  { key: 'series', label: 'Shows', typeFilter: 'show' },
  { key: 'anime', label: 'Anime', typeFilter: 'anime' },
  { key: 'documentaries', label: 'Documentaries', typeFilter: 'documentary' },
];

const getTypeFilterFromCategoryKey = (categoryKey) =>
  CATEGORY_TABS.find(c => c.key === categoryKey)?.typeFilter || null;

// Extract genres ONLY from media
const getGenresFromMedia = (media = [], typeFilter = null) => {
  const set = new Set();

  (media || []).forEach(m => {
    if (!m) return;

    const t = String(m.type || '').toLowerCase();
    const matchesType =
      !typeFilter ||
      t === typeFilter ||
      (typeFilter === 'film' && (t === 'film' || t === 'movie')) ||
      (typeFilter === 'show' && (t === 'show' || t === 'series'));

    if (!matchesType) return;

    // sources of genre
    if (Array.isArray(m.genres)) {
      m.genres.forEach(g => g && set.add(String(g).trim()));
    }
    if (typeof m.genre === 'string') {
      m.genre
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(g => set.add(g));
    }
    if (Array.isArray(m.tags)) {
      m.tags.forEach(g => g && set.add(String(g).trim()));
    }
  });

  return Array.from(set).sort();
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)] || null;

export default function SpinWheel({ media = mediaData, bottomOffset = 88 }) {
  const [open, setOpen] = useState(false);

  const [stage, setStage] = useState('askCategoryChoice');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [spinning, setSpinning] = useState(false);
  const [lastPickText, setLastPickText] = useState(null);

  const iconRef = useRef(null);

  const categoryKeys = CATEGORY_TABS.map(c => c.key);

  // genres based ONLY on media
  const mediaGenres = useMemo(
    () => getGenresFromMedia(media, getTypeFilterFromCategoryKey(selectedCategory)),
    [media, selectedCategory]
  );

  const animateIcon = (deg = 720, duration = 900) => {
    if (!iconRef.current) return;
    iconRef.current.style.transition = `transform ${duration}ms cubic-bezier(.2,.9,.2,1)`;
    iconRef.current.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
      if (iconRef.current) iconRef.current.style.transform = '';
    }, duration);
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handlePickCategory = async ({ manualCategory = null } = {}) => {
    setSpinning(true);
    animateIcon(720, 900);
    await sleep(850);

    const picked = manualCategory || pickRandom(categoryKeys);

    setSelectedCategory(picked);
    setSpinning(false);

    // if no genres exist for this category, skip genre selection
    const genresNow = getGenresFromMedia(media, getTypeFilterFromCategoryKey(picked));

    if (genresNow.length === 0) {
      setStage('askPickInside');
    } else {
      setStage('askGenreChoice');
    }
  };

  const handlePickGenre = async ({ manualGenre = null } = {}) => {
    setSpinning(true);
    animateIcon(900, 1000);
    await sleep(900);

    const picked = manualGenre || pickRandom(mediaGenres);

    setSelectedGenre(picked || null);
    setSpinning(false);
    setStage('askPickInside');
  };

  const handlePickItem = async () => {
    setSpinning(true);
    animateIcon(1080, 1400);
    await sleep(1200);

    let candidates = [];

    const typeFilter = getTypeFilterFromCategoryKey(selectedCategory);

    candidates = media.filter((m) => {
      const t = String(m.type || '').toLowerCase();
      const typeMatches =
        !typeFilter ||
        t === typeFilter ||
        (typeFilter === 'film' && (t === 'film' || t === 'movie')) ||
        (typeFilter === 'show' && (t === 'show' || t === 'series'));

      if (!typeMatches) return false;

      if (selectedGenre) {
        const gl = selectedGenre.toLowerCase();
        const fromArrays = [
          ...(m.genres || []).map(x => String(x).toLowerCase()),
          ...(m.tags || []).map(x => String(x).toLowerCase()),
        ];

        const fromString = (m.genre || '')
          .split(',')
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);

        const genreMatch =
          fromArrays.some(g => g.includes(gl)) ||
          fromString.some(g => g.includes(gl)) ||
          (m.title || '').toLowerCase().includes(gl) ||
          (m.description || '').toLowerCase().includes(gl);

        return genreMatch;
      }

      return true;
    });

    if (candidates.length === 0) {
      // fallback to any media
      candidates = [...media];
    }

    const picked = pickRandom(candidates);

    setSelectedItem(picked);
    setLastPickText(picked?.title || 'Unknown');
    setStage('showResult');
    setSpinning(false);
  };

  const resetFlow = () => {
    setStage('askCategoryChoice');
    setSelectedCategory(null);
    setSelectedGenre(null);
    setSelectedItem(null);
    setLastPickText(null);
  };

  const labelForCategory = (key) =>
    CATEGORY_TABS.find(c => c.key === key)?.label || key;

  return (
    <>
      {/* Floating button */}
      <div
        className="fixed z-50 right-4"
        style={{ bottom: `${bottomOffset}px` }}
      >
        <button
          onClick={() => {
            setOpen(true);
            resetFlow();
          }}
          className="w-12 h-12 rounded-full bg-[#076452] shadow-lg flex items-center justify-center"
        >
          <Shuffle size={18} className="text-white" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

          <div className="relative w-full max-w-md mb-6 mx-4">
            <div className="bg-[#0d0d0d] border border-[#222] rounded-xl overflow-hidden shadow-xl">

              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#111]">
                <div className="flex items-center gap-2">
                  <div ref={iconRef} className="w-9 h-9 rounded-full bg-[#153b31] grid place-items-center">
                    <Shuffle size={18} className="text-[#cfeee0]" />
                  </div>
                  <div className="text-sm font-semibold">Spin the Wheel</div>
                </div>
                <button className="text-[#999]" onClick={() => setOpen(false)}>
                  <X size={14}/>
                </button>
              </div>

              <div className="p-4">

                {/* CATEGORY: Ask if user cares */}
                {stage === 'askCategoryChoice' && (
                  <div className="space-y-3">
                    <p className="text-sm text-[#ccc]">Do you want to pick a category, or let me choose at random?</p>

                    <div className="flex gap-2">
                      <button className="flex-1 rounded-full border border-[#222] px-3 py-2" onClick={() => setStage('chooseCategory')}>
                        I'll pick
                      </button>
                      <button className="flex-1 rounded-full bg-[#076452] text-white px-3 py-2"
                        onClick={() => handlePickCategory({ manualCategory: null })}>
                        Spin across all
                      </button>
                    </div>

                    {lastPickText && (
                      <p className="text-xs text-[#999]">Last picked: {lastPickText}</p>
                    )}
                  </div>
                )}

                {/* CATEGORY: chooser */}
                {stage === 'chooseCategory' && (
                  <div className="space-y-3">
                    <p className="text-sm text-[#ccc]">Pick a category:</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_TABS.map(c => (
                        <button key={c.key}
                          onClick={() => handlePickCategory({ manualCategory: c.key })}
                          className="px-3 py-1 rounded-full border border-[#222] text-sm">
                          {c.label}
                        </button>
                      ))}
                    </div>

                    <button className="mt-2 px-3 py-1 rounded-full border border-[#333]"
                      onClick={() => setStage('askCategoryChoice')}>
                      Back
                    </button>
                  </div>
                )}

                {/* GENRE: ask */}
                {stage === 'askGenreChoice' && (
                  <div className="space-y-3">
                    <p className="text-sm text-[#ccc]">
                      Category: <strong>{labelForCategory(selectedCategory)}</strong>.  
                      Pick a genre or spin randomly?
                    </p>

                    <div className="flex gap-2">
                      <button className="flex-1 border border-[#222] px-3 py-2 rounded-full"
                        onClick={() => setStage('chooseGenre')}>
                        I'll pick
                      </button>
                      <button className="flex-1 bg-[#076452] text-white px-3 py-2 rounded-full"
                        onClick={() => handlePickGenre({ manualGenre: null })}>
                        Spin for genre
                      </button>
                    </div>
                  </div>
                )}

                {/* GENRE: chooser */}
                {stage === 'chooseGenre' && (
                  <div className="space-y-3">
                    <p className="text-sm text-[#ccc]">Pick a genre:</p>

                    <div className="flex flex-wrap gap-2">
                      {mediaGenres.map(g => (
                        <button key={g}
                          className="px-3 py-1 rounded-full border border-[#222] text-sm"
                          onClick={() => handlePickGenre({ manualGenre: g })}>
                          {g}
                        </button>
                      ))}
                      {mediaGenres.length === 0 && (
                        <p className="text-xs text-[#666]">No genres found in media.</p>
                      )}
                    </div>

                    <div className="flex justify-between mt-2">
                      <button className="px-3 py-1 border border-[#333] rounded-full"
                        onClick={() => setStage('askGenreChoice')}>
                        Back
                      </button>
                      <button className="px-3 py-1 bg-[#076452] text-white rounded-full"
                        onClick={() => handlePickGenre({ manualGenre: null })}>
                        Spin
                      </button>
                    </div>
                  </div>
                )}

                {/* ITEM: ask */}
                {stage === 'askPickInside' && (
                  <div className="space-y-3">
                    <p className="text-sm text-[#ccc]">
                      {selectedGenre
                        ? <>Genre <strong>{selectedGenre}</strong> selected.</>
                        : <>Choosing from <strong>{labelForCategory(selectedCategory)}</strong>.</>}
                      <br/>
                      Pick manually or spin?
                    </p>

                    <div className="flex gap-2">
                      <button className="flex-1 border border-[#222] rounded-full px-3 py-2"
                        onClick={() => setStage('chooseItem')}>
                        I'll pick
                      </button>
                      <button className="flex-1 bg-[#076452] text-white rounded-full px-3 py-2"
                        onClick={() => handlePickItem()}>
                        Spin for me
                      </button>
                    </div>
                  </div>
                )}

                {/* ITEM: chooser */}
                {stage === 'chooseItem' && (
                  <div className="space-y-3">

                    <p className="text-sm text-[#ccc]">Pick an item:</p>

                    <div className="max-h-52 overflow-y-auto grid gap-3">
                      {media
                        .filter((m) => {
                          const typeFilter = getTypeFilterFromCategoryKey(selectedCategory);
                          const t = (m.type || '').toLowerCase();

                          const typeMatches =
                            !typeFilter ||
                            t === typeFilter ||
                            (typeFilter === 'film' && (t === 'film' || t === 'movie')) ||
                            (typeFilter === 'show' && (t === 'show' || t === 'series'));

                          if (!typeMatches) return false;

                          if (!selectedGenre) return true;

                          const gl = selectedGenre.toLowerCase();
                          const genres = [
                            ...(m.genres || []).map(g => g.toLowerCase()),
                            ...(m.tags || []).map(g => g.toLowerCase()),
                            ...(m.genre || '')
                              .split(',')
                              .map(s => s.trim().toLowerCase())
                          ];

                          return (
                            genres.some(g => g.includes(gl)) ||
                            (m.title || '').toLowerCase().includes(gl)
                          );
                        })
                        .map((m) => (
                          <button key={m.id}
                            onClick={() => {
                              setSelectedItem(m);
                              setLastPickText(m.title);
                              setStage('showResult');
                            }}
                            className="p-2 border border-[#222] rounded-lg text-left flex gap-3 items-center hover:border-[#076452]"
                          >
                            <img src={m.poster} alt="" className="w-10 h-14 object-cover rounded-sm" />
                            <div>
                              <div className="font-semibold">{m.title}</div>
                              <div className="text-xs text-[#999]">{m.year} • {m.type}</div>
                            </div>
                          </button>
                        ))}
                    </div>

                    <div className="flex justify-between mt-2">
                      <button className="px-3 py-1 border border-[#333] rounded-full"
                        onClick={() => setStage('askPickInside')}>
                        Back
                      </button>
                      <button className="px-3 py-1 bg-[#076452] text-white rounded-full flex items-center gap-1"
                        onClick={() => handlePickItem()}>
                        <Play size={14}/> Spin
                      </button>
                    </div>
                  </div>
                )}

                {/* RESULT */}
                {stage === 'showResult' && selectedItem && (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <img src={selectedItem.poster} className="w-20 h-28 object-cover rounded-md" alt="" />
                      <div>
                        <h4 className="font-semibold text-lg">{selectedItem.title}</h4>
                        <p className="text-xs text-[#999]">{selectedItem.year} • {selectedItem.type}</p>
                        <p className="text-sm mt-2 line-clamp-3 text-[#ccc]">{selectedItem.description || ''}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a className="flex-1 text-center bg-[#076452] text-white rounded-full px-3 py-2" href={`#/${selectedItem.id}`}>
                        View
                      </a>
                      <button className="px-3 py-2 rounded-full border border-[#222]"
                        onClick={() => resetFlow()}>
                        Spin again
                      </button>
                      <button className="px-3 py-2 rounded-full border border-[#333]"
                        onClick={() => setOpen(false)}>
                        Close
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
