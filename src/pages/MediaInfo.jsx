import React, { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "../components/Navbar";
import { Star, Eye, Plus, Check, XCircle, ChevronDown } from "lucide-react";
import { useListsContext } from "./ListsContext";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import mediaData from "../data/mediaData";

export default function MediaInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { statusLists, customLists, addToList, removeFromList, addToCustomList, removeFromCustomList } = useListsContext();
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [isDNF, setIsDNF] = useState(false);
  const [rating, setRating] = useState(0);
  const [customListsOpen, setCustomListsOpen] = useState(false);
  const [itemInCustomLists, setItemInCustomLists] = useState(new Set());
  const dropdownRef = useRef(null);

  // Where-to-watch removed per user request
  const [whereExpanded, setWhereExpanded] = useState(false);

  const { id: routeId } = useParams();

  // Prefer data passed from the Home page via `location.state` (faster),
  // otherwise look up the media by `routeId` from `mediaData`.
  const mediaItem =
    location?.state?.media || mediaData.find((m) => m.id === routeId) || mediaData.find((m) => m.id === "kill-bill");

  // --- Server-integration pieces (added) ---
  const memoizedMediaItem = useMemo(() => mediaItem, [mediaItem]);

  const normalizedMediaType = useMemo(() => {
    const t = (memoizedMediaItem.type || "").toLowerCase();
    if (t === "film" || t === "movie" || t === "films") return "film";
    if (t === "tv" || t === "show" || t === "shows" || t === "series") return "show";
    if (t === "anime") return "anime";
    if (t === "documentary" || t === "documentaries") return "documentary";
    return "film";
  }, [memoizedMediaItem.type]);

  // Map to the lists tabs keys (films/shows/anime/documentaries)
  const listsMediaType = useMemo(() => {
    if (normalizedMediaType === "film") return "films";
    if (normalizedMediaType === "show") return "shows";
    if (normalizedMediaType === "anime") return "anime";
    if (normalizedMediaType === "documentary") return "documentaries";
    return "films";
  }, [normalizedMediaType]);

  const [episodeCount, setEpisodeCount] = useState(1); // for shows/anime episodes watched

  // Map mediaItem.type to mediaType key (kept for compatibility with existing code)
  const getMediaType = () => {
    const type = (mediaItem && mediaItem.type) || "film";
    const typeMap = {
      film: "films",
      tv: "shows",
      anime: "anime",
      documentary: "documentaries"
    };
    return typeMap[type] || "films";
  };

  const mediaType = getMediaType();

  const ratingLabel = (() => {
    const t = (mediaItem && mediaItem.type) || "film";
    switch (t) {
      case "film":
        return "Rate this film";
      case "anime":
        return "Rate this anime";
      case "tv":
        return "Rate this show";
      case "documentary":
        return "Rate this documentary";
      default:
        return `Rate this ${t}`;
    }
  })();

  // Load initial states from context (keeps existing behaviour)
  useEffect(() => {
    const lists = statusLists[mediaType];
    if (lists) {
      setIsWatchlisted(lists.find((l) => l.label === "Want to Watch")?.items.some((i) => i.id === mediaItem.id) || false);
      setIsWatched(lists.find((l) => l.label === "Watched")?.items.some((i) => i.id === mediaItem.id) || false);
      setIsWatching(lists.find((l) => l.label === "Currently Watching")?.items.some((i) => i.id === mediaItem.id) || false);
      setIsDNF(lists.find((l) => l.label === "Did Not Finish")?.items.some((i) => i.id === mediaItem.id) || false);
    }

    // Check which custom lists contain this item
    const customListsForType = customLists[mediaType] || [];
    const inLists = new Set();
    customListsForType.forEach(list => {
      if (list.items.some(item => item.id === mediaItem.id)) {
        inLists.add(list.name);
      }
    });
    setItemInCustomLists(inLists);
  }, [statusLists, customLists, mediaType, mediaItem]);

  // Persist/load rating for this media item using localStorage (keeps existing behaviour)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`rating:${mediaItem.id}`);
      if (saved !== null) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed)) setRating(parsed);
        else setRating(0);
      } else {
        setRating(0);
      }
    } catch {
      setRating(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaItem.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCustomListsOpen(false);
      }
    };

    if (customListsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [customListsOpen]);

  const handleWatchlist = () => {
    if (isWatchlisted) {
      removeFromList(mediaType, "Want to Watch", mediaItem.id);
    } else {
      addToList(mediaType, "Want to Watch", mediaItem);
    }
    setIsWatchlisted(!isWatchlisted);
  };

  // --- Server-side watched update helpers (added) ---
  const parseRuntimeToMinutes = (runtime) => {
    if (!runtime || typeof runtime !== "string") return 0;
    const base = runtime.split("/")[0].trim();
    const hourMatch = base.match(/(\d+)h/i);
    const minMatch = base.match(/(\d+)m/i);
    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
    return hours * 60 + mins;
  };

  const recomputeProfileStats = async (userId) => {
    try {
      const watchedRes = await apiClient.get(`/watched?userId=${userId}`);
      const watched = Array.isArray(watchedRes.data)
        ? watchedRes.data
        : watchedRes.data
        ? [watchedRes.data]
        : [];

      let totalMinutes = 0;
      let films = 0;
      let showsCompleted = 0;
      let episodes = 0;
      let anime = 0;
      let documentaries = 0;

      watched.forEach((w) => {
        const type = (w.mediaType || "").toLowerCase();
        totalMinutes += w.runtimeMinutes || 0;

        if (type === "film") films += 1;
        else if (type === "show" || type === "shows") {
          episodes += w.episodes || 0;
          showsCompleted += 1;
        } else if (type === "anime") {
          episodes += w.episodes || 0;
          anime += 1;
        } else if (type === "documentary" || type === "documentaries") {
          documentaries += 1;
        }
      });

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const tvTime = `${hours}h ${minutes}m`;

      const statsPayload = {
        stats: {
          tvTime,
          episodes,
          films,
          shows: showsCompleted,
          showsStarted: showsCompleted,
          anime,
          documentaries,
          lastActive: "Active via app",
        },
      };

      try {
        await apiClient.patch(`/profileStats/${userId}`, statsPayload);
      } catch (err) {
        if (err?.response?.status === 404) {
          await apiClient.post("/profileStats", {
            id: userId,
            social: { followers: 0, following: 0, comments: 0 },
            ...statsPayload,
          });
        } else {
          throw err;
        }
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("profileStatsUpdated", { detail: { userId } })
        );
      }
    } catch (err) {
      console.warn("Could not recompute profile stats", err);
    }
  };

  const handleWatchedServerUpdate = async (nowWatched) => {
    try {
      const storedUser = localStorage.getItem("app:userData");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id;
      if (!userId) return;

      const perUnitMinutes = parseRuntimeToMinutes(mediaItem.runtime);
      const runtimeMinutes =
        normalizedMediaType === "film" || perUnitMinutes === 0
          ? perUnitMinutes
          : perUnitMinutes * Math.max(1, episodeCount || 1);

      if (nowWatched) {
        // Add or update watched record
        const existingRes = await apiClient.get(
          `/watched?userId=${userId}&mediaId=${mediaItem.id}`
        );
        const existing = Array.isArray(existingRes.data)
          ? existingRes.data
          : existingRes.data
          ? [existingRes.data]
          : [];

        if (existing.length > 0) {
          await apiClient.patch(`/watched/${existing[0].id}`, {
            mediaType: normalizedMediaType,
            runtimeMinutes,
          });
        } else {
          await apiClient.post("/watched", {
            userId,
            mediaId: mediaItem.id,
            mediaType: normalizedMediaType,
            episodes:
              normalizedMediaType === "show" || normalizedMediaType === "anime"
                ? Math.max(1, episodeCount || 1)
                : 0,
            runtimeMinutes,
          });
        }
      } else {
        // Remove watched record when user unmarks
        const existingRes = await apiClient.get(
          `/watched?userId=${userId}&mediaId=${mediaItem.id}`
        );
        const existing = Array.isArray(existingRes.data)
          ? existingRes.data
          : existingRes.data
          ? [existingRes.data]
          : [];
        await Promise.all(
          existing.map((rec) => apiClient.delete(`/watched/${rec.id}`))
        );
      }

      await recomputeProfileStats(userId);
    } catch (err) {
      console.warn("Could not update watched stats", err);
    }
  };

  const handleWatched = () => {
    if (isWatched) {
      removeFromList(mediaType, "Watched", mediaItem.id);
    } else {
      addToList(mediaType, "Watched", mediaItem);
    }
    setIsWatched(!isWatched);

    // Also persist watched info + recompute profile stats (fire-and-forget)
    try {
      handleWatchedServerUpdate(!isWatched);
    } catch (e) {
      // ignore errors in background
    }
  };

  const handleWatching = () => {
    if (isWatching) {
      removeFromList(mediaType, "Currently Watching", mediaItem.id);
    } else {
      addToList(mediaType, "Currently Watching", mediaItem);
    }
    setIsWatching(!isWatching);
  };

  const handleDNF = () => {
    if (isDNF) {
      removeFromList(mediaType, "Did Not Finish", mediaItem.id);
    } else {
      addToList(mediaType, "Did Not Finish", mediaItem);
    }
    setIsDNF(!isDNF);
  };

  const handleCustomListToggle = (listName) => {
    if (itemInCustomLists.has(listName)) {
      removeFromCustomList(mediaType, listName, mediaItem.id);
      setItemInCustomLists(prev => {
        const newSet = new Set(prev);
        newSet.delete(listName);
        return newSet;
      });
    } else {
      addToCustomList(mediaType, listName, mediaItem);
      setItemInCustomLists(prev => new Set(prev).add(listName));
    }
  };

  // Save rating to localStorage whenever user clicks a star
  const handleSetRating = (value) => {
    setRating(value);
    try {
      localStorage.setItem(`rating:${mediaItem.id}`, String(value));
    } catch {}
  };

  return (
    <>
      <Navbar isLoggedIn={true} />

      {/* Header */}
      <div className="relative w-full h-[70vh]">
        <img
          src={mediaItem.background}
          alt={`${mediaItem.title} Background`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 -mt-32 px-20 flex gap-10 max-w-7xl mx-auto text-white">
        {/* Poster */}
        <div className="w-64 flex-shrink-0 shadow-lg">
          <img src={mediaItem.poster} alt={`${mediaItem.title} Poster`} className="w-full h-[384px] object-cover rounded-lg" />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-1">{mediaItem.title}</h1>
          <p className="text-sm text-gray-400 mb-6">
            ({mediaItem.year}) • Directed by{" "}
            <span className="text-gray-200">{mediaItem.director}</span>
          </p>

          {mediaItem.description && (
            <>
              <p className="text-gray-300 mb-2 tracking-wide italic">{mediaItem.tagline || ""}</p>
              <p className="text-gray-400 mb-6 leading-relaxed">{mediaItem.description}</p>
            </>
          )}

          {/* Movie details */}
          <div className="text-gray-400 text-sm mb-6 space-y-2">
            <p>
              <span className="font-semibold text-gray-300">Starring:</span>{" "}
              {mediaItem.starring}
            </p>
            <p>
              <span className="font-semibold text-gray-300">Release date:</span> {mediaItem.releaseDate}
            </p>
            <p>
              <span className="font-semibold text-gray-300">Running time:</span>{" "}
              {mediaItem.runtime}
            </p>
            <p>
              <span className="font-semibold text-gray-300">Country:</span> {mediaItem.country}
            </p>
          </div>

          {/* Buttons - All in one line */}
          <div className="flex gap-4 items-center mb-8 flex-nowrap">
            {/* Add to Watchlist */}
            <button
              onClick={handleWatchlist}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition whitespace-nowrap
              ${
                isWatchlisted
                  ? "bg-gray-200 border-gray-200 text-black"
                  : "border-gray-400 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {isWatchlisted ? <Check size={18} /> : <Plus size={18} />}
              {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
            </button>

            {/* Watched */}
            <button
              onClick={handleWatched}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition whitespace-nowrap
              ${
                isWatched
                  ? "bg-gray-200 border-gray-200 text-black"
                  : "border-gray-400 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {isWatched ? <Check size={18} /> : <Eye size={18} />}
              {isWatched ? "Watched" : "Mark as Watched"}
            </button>

            {/* Currently Watching */}
            <button
              onClick={handleWatching}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition whitespace-nowrap
              ${
                isWatching
                  ? "bg-gray-200 border-gray-200 text-black"
                  : "border-gray-400 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {isWatching ? <Check size={18} /> : <Eye size={18} />}
              {isWatching ? "Currently Watching" : "Currently Watching"}
            </button>

            {/* Did Not Finish */}
            <button
              onClick={handleDNF}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition whitespace-nowrap
              ${
                isDNF
                  ? "bg-gray-200 border-gray-200 text-black"
                  : "border-gray-400 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {isDNF ? <Check size={18} /> : <XCircle size={18} />}
              {isDNF ? "Did Not Finish" : "Did Not Finish"}
            </button>

            {/* Add to Custom Lists - Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCustomListsOpen(!customListsOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-400 text-gray-300 hover:bg-gray-800 transition whitespace-nowrap"
              >
                <Plus size={18} />
                Add to List
                <ChevronDown size={18} className={`transition-transform ${customListsOpen ? "rotate-180" : ""}`} />
              </button>

              {customListsOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#232526] border border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {customLists[mediaType] && customLists[mediaType].length > 0 ? (
                    <div className="py-2">
                      {customLists[mediaType].map((list) => {
                        const isInList = itemInCustomLists.has(list.name);
                        return (
                          <button
                            key={list.name}
                            onClick={() => handleCustomListToggle(list.name)}
                            className={`w-full px-4 py-2 text-left hover:bg-[#2b2e2f] transition-colors flex items-center gap-2 ${
                              isInList ? "bg-[#2b2e2f]" : ""
                            }`}
                          >
                            {isInList ? <Check size={16} className="text-[#076452]" /> : <div className="w-4" />}
                            <span className={isInList ? "text-white" : "text-gray-300"}>{list.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-gray-400 text-sm text-center">
                      No custom lists yet. Create one from the Lists page.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Rating section */}
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-gray-400 uppercase tracking-wider">{ratingLabel}</p>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  stroke="#facc15"
                  fill={rating >= star ? "#facc15" : "none"}
                  className="cursor-pointer transition"
                  onClick={() => handleSetRating(star)}
                />
              ))}
              {rating > 0 && (
                <span className="ml-2 text-gray-300 text-sm">{rating} / 5</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black min-h-screen" />
    </>
  );
}
