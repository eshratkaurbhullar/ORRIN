import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { Film, Tv, Clapperboard, FileText, Bell, Play, CheckCircle2, Users, UserPlus, MessageCircle, TrendingUp, TrendingDown, Trophy, Award } from 'lucide-react';
import apiClient from '../../api/axiosConfig';

// Helper: Loading spinner for modals
const ModalSpinner = () => (
 <div className="flex justify-center items-center h-32">
  <div className="w-8 h-8 border-4 border-[#076452] border-t-transparent rounded-full animate-spin"></div>
 </div>
);

// Helper: Simple skeleton loader for tab content
const TabSkeletonLoader = () => (
 <div className="rounded-xl h-40 bg-gray-800 animate-pulse"></div>
);

const ProfilePage = ({ userData, onUpdateProfile, onLogout }) => {
 const { userId: urlUserId } = useParams();
 const navigate = useNavigate();
 const [selectedTab, setSelectedTab] = useState('Reviews');
 const [showFollowers, setShowFollowers] = useState(false);
 const [showFollowing, setShowFollowing] = useState(false);
 const [isEditing, setIsEditing] = useState(false);

 // --- State for API Data ---
 const [profileData, setProfileData] = useState({ social: {}, stats: {} });
 const [statsLoading, setStatsLoading] = useState(true);
 const [statsError, setStatsError] = useState(null);
 const [tabContent, setTabContent] = useState([]);
 const [tabLoading, setTabLoading] = useState(true);
 const [tabError, setTabError] = useState(null);
 const [followersList, setFollowersList] = useState([]);
 const [followersLoading, setFollowersLoading] = useState(false);
 const [followingList, setFollowingList] = useState([]);
 const [followingLoading, setFollowingLoading] = useState(false);
 const [viewingUserData, setViewingUserData] = useState(null); // For viewing other users' profiles

 // Determine which user's profile we're viewing
 const currentUserId = userData?.id;
 const targetUserId = urlUserId || currentUserId;
 const isViewingOwnProfile = !urlUserId || String(urlUserId) === String(currentUserId);
 const displayUserData = isViewingOwnProfile ? userData : viewingUserData;

 // Fetch user data if viewing another user's profile
 useEffect(() => {
  const isOwnProfile = !urlUserId || String(urlUserId) === String(currentUserId);
  if (urlUserId && !isOwnProfile) {
   const fetchUserData = async () => {
    try {
     const response = await apiClient.get(`/users/${urlUserId}`);
     setViewingUserData(response.data);
    } catch (err) {
     console.error('Error fetching user data:', err);
     // If user not found, redirect to own profile
     navigate('/profile', { replace: true });
    }
   };
   fetchUserData();
  } else {
   setViewingUserData(null);
  }
 }, [urlUserId, currentUserId, navigate]);

 // --- userData from App.jsx (passed as prop) or fetched user data ---
 const username = useMemo(() => {
  const data = displayUserData;
  if (data?.username && String(data.username).trim()) return data.username;
  const first = data?.firstName || 'User';
  const last = data?.lastName ? ` ${data.lastName}` : '';
  return `${first}${last}`;
 }, [displayUserData]);

 const genres = displayUserData?.preferences?.genres || [];
 const startPref = displayUserData?.preferences?.startPreference || 'films';
 const additionalInterests = displayUserData?.preferences?.additionalInterests || [];

 // --- Static Data ---
 const contentTypes = [
  { id: 'films', label: 'Films', Icon: Film },
  { id: 'shows', label: 'Shows', Icon: Tv },
  { id: 'anime', label: 'Anime', Icon: Clapperboard },
  { id: 'documentaries', label: 'Documentary', Icon: FileText }
 ];
 const tabs = ['Reviews', 'Posts', 'Likes'];

// --- API Calls ---
// Function to fetch profile stats (used on mount and when events arrive)
const fetchProfileStats = async () => {
    setStatsLoading(true); setStatsError(null);
    try {
        const userId = targetUserId || 'user_mock_login'; // Use target user's ID
        // Try to fetch by id (old behavior) but fall back to fetching the whole resource
        let response;
        try {
            response = await apiClient.get(`/profileStats/${userId}`);
        } catch (e) {
            // If a 404 or the resource isn't shaped as an array, try the collection endpoint
            response = await apiClient.get('/profileStats');
        }

        // Normalize response: json-server may return an object or an array
        let data = response.data;
        if (Array.isArray(data)) {
            // Find the stats object matching the userId
            const found = data.find((d) => String(d.id) === String(userId));
            data = found || data[0] || {};
        }

        setProfileData(data || {});
        // Also fetch authoritative follower/following lists and use their lengths to set social counts
        try {
            const [fResp, fgResp] = await Promise.all([
                apiClient.get(`/followers?userId=${userId}`),
                apiClient.get(`/following?userId=${userId}`)
            ]);
            const followersArr = Array.isArray(fResp.data) ? fResp.data : (fResp.data ? [fResp.data] : []);
            const followingArr = Array.isArray(fgResp.data) ? fgResp.data : (fgResp.data ? [fgResp.data] : []);
            setProfileData(prev => ({ ...(prev || {}), social: { ...(prev?.social || {}), followers: followersArr.length, following: followingArr.length } }));
        } catch (e) {
            // If these endpoints aren't available, leave profileStats as-is
            console.warn('Could not load followers/following counts; using profileStats as fallback', e);
        }
    } catch (err) {
        console.error("Stats Error:", err);
        setStatsError("Could not load profile stats.");
    }
    finally { setStatsLoading(false); }
};

useEffect(() => {
    fetchProfileStats();
    // Also fetch followers/following counts so social numbers are accurate
    const fetchFollowCounts = async () => {
        const userId = targetUserId || 'user_mock_login';
        try {
            const [fResp, fgResp] = await Promise.all([
                apiClient.get(`/followers?userId=${userId}`),
                apiClient.get(`/following?userId=${userId}`)
            ]);
            const followersArr = Array.isArray(fResp.data) ? fResp.data : (fResp.data ? [fResp.data] : []);
            const followingArr = Array.isArray(fgResp.data) ? fgResp.data : (fgResp.data ? [fgResp.data] : []);
            setProfileData(prev => ({ ...(prev || {}), social: { ...(prev?.social || {}), followers: followersArr.length, following: followingArr.length } }));
        } catch (err) {
            // If endpoints missing, keep defaults
            console.warn('Could not fetch follow counts', err);
        }
    };
    fetchFollowCounts();
}, [targetUserId]); // Refetch if targetUserId changes

 useEffect(() => { // Fetch tab content when tab or user changes
  const fetchTabContent = async () => {
   setTabLoading(true); setTabError(null); setTabContent([]); // Reset content
   const userId = targetUserId || 'user_mock_login';
   
   if (selectedTab.toLowerCase() === 'likes') {
    // For likes, fetch likes first, then fetch the posts and user info
    try {
     const likesResponse = await apiClient.get(`/likes?userId=${userId}`);
     const likes = Array.isArray(likesResponse.data) ? likesResponse.data : (likesResponse.data ? [likesResponse.data] : []);
     
     if (likes.length === 0) {
      setTabContent([]);
      setTabLoading(false);
      return;
     }
     
     // Fetch all posts that were liked
     const postIds = likes.map(like => like.postId).filter(Boolean);
     if (postIds.length === 0) {
      setTabContent([]);
      setTabLoading(false);
      return;
     }
     
     // Fetch each post and users
     const [postResponses, usersResponse] = await Promise.all([
      Promise.all(postIds.map(postId => 
       apiClient.get(`/postsApi/${postId}`).catch(() => null)
      )),
      apiClient.get('/users').catch(() => ({ data: [] }))
     ]);
     
     const posts = postResponses
      .filter(res => res && res.data)
      .map(res => res.data);
     
     // Map user info to posts
     const users = Array.isArray(usersResponse.data) ? usersResponse.data : (usersResponse.data ? [usersResponse.data] : []);
     const usersByKey = new Map();
     users.forEach(u => {
      const keyId = u.id != null ? String(u.id) : null;
      if (keyId) {
       usersByKey.set(keyId, {
        id: u.id,
        name: u.username || u.fullName || u.firstName || u.email || 'Unknown',
        avatar: u.profile?.profilePicture || '/src/assets/LOGO.png'
       });
      }
     });
     
     // Enrich posts with user info
     const enrichedPosts = posts.map(post => {
      const userId = post.userId != null ? String(post.userId) : null;
      const userInfo = userId && usersByKey.get(userId) || {
       id: post.userId,
       name: 'Unknown Creator',
       avatar: '/src/assets/LOGO.png'
      };
      return {
       ...post,
       user: userInfo
      };
     });
     
     setTabContent(enrichedPosts);
    } catch (err) {
     console.error('Likes Error:', err);
     setTabError('Could not load likes.');
     setTabContent([]);
    } finally {
     setTabLoading(false);
    }
    return;
   }
   
   let endpoint = '';
   switch (selectedTab.toLowerCase()) {
    case 'reviews': endpoint = `/reviews?userId=${userId}`; break;
    case 'posts': endpoint = `/postsApi?userId=${userId}`; break; // Use postsApi from db.json
    default: setTabLoading(false); return; // Exit if tab is unrecognized
   }
   console.log(`Attempting API call: GET ${endpoint}`); // Log
   try {
    const response = await apiClient.get(endpoint);
    console.log(`API Response (${selectedTab}):`, response.data); // Log
    const data = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
    setTabContent(data);
   } catch (err) { console.error(`${selectedTab} Error:`, err); setTabError(`Could not load ${selectedTab}.`); }
   finally { setTabLoading(false); }
  };
  fetchTabContent();
 }, [selectedTab, targetUserId]); // Refetch if tab or targetUserId changes

 // Listen for post like/comment events to refresh tab content
 useEffect(() => {
  const handlePostLiked = async (e) => {
   const { postId } = e.detail || {};
   if (!postId) return;
   
   // Refresh Posts and Likes tabs if they're currently selected
   if (selectedTab === 'Posts' || selectedTab === 'Likes') {
    // Refetch the current tab content
    const userId = targetUserId || 'user_mock_login';
    
    if (selectedTab === 'Posts') {
     try {
      const response = await apiClient.get(`/postsApi?userId=${userId}`);
      const data = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      setTabContent(data);
     } catch (err) {
      console.error('Error refreshing posts:', err);
     }
    } else if (selectedTab === 'Likes') {
     // Refetch likes
     try {
      const likesResponse = await apiClient.get(`/likes?userId=${userId}`);
      const likes = Array.isArray(likesResponse.data) ? likesResponse.data : (likesResponse.data ? [likesResponse.data] : []);
      
      if (likes.length === 0) {
       setTabContent([]);
       return;
      }
      
      const postIds = likes.map(like => like.postId).filter(Boolean);
      if (postIds.length === 0) {
       setTabContent([]);
       return;
      }
      
      const [postResponses, usersResponse] = await Promise.all([
       Promise.all(postIds.map(postId => 
        apiClient.get(`/postsApi/${postId}`).catch(() => null)
       )),
       apiClient.get('/users').catch(() => ({ data: [] }))
      ]);
      
      const posts = postResponses
       .filter(res => res && res.data)
       .map(res => res.data);
      
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : (usersResponse.data ? [usersResponse.data] : []);
      const usersByKey = new Map();
      users.forEach(u => {
       const keyId = u.id != null ? String(u.id) : null;
       if (keyId) {
        usersByKey.set(keyId, {
         id: u.id,
         name: u.username || u.fullName || u.firstName || u.email || 'Unknown',
         avatar: u.profile?.profilePicture || '/src/assets/LOGO.png'
        });
       }
      });
      
      const enrichedPosts = posts.map(post => {
       const userId = post.userId != null ? String(post.userId) : null;
       const userInfo = userId && usersByKey.get(userId) || {
        id: post.userId,
        name: 'Unknown Creator',
        avatar: '/src/assets/LOGO.png'
       };
       return {
        ...post,
        user: userInfo
       };
      });
      
      setTabContent(enrichedPosts);
     } catch (err) {
      console.error('Error refreshing likes:', err);
     }
    }
   }
  };

  const handlePostCommented = handlePostLiked; // Same refresh logic for comments

  window.addEventListener('postLiked', handlePostLiked);
  window.addEventListener('postCommented', handlePostCommented);
  
  return () => {
   window.removeEventListener('postLiked', handlePostLiked);
   window.removeEventListener('postCommented', handlePostCommented);
  };
 }, [selectedTab, targetUserId]);

 // --- Modal Fetch Functions ---
 const openFollowersModal = async () => {
  setShowFollowers(true); if (followersList.length > 0 && !statsError) return;
  setFollowersLoading(true);
  const userId = targetUserId || 'user_mock_login';
  console.log(`Attempting API call: GET /followers?userId=${userId}`); // Log
  try {
   const response = await apiClient.get(`/followers?userId=${userId}`);
   console.log("API Response (Followers):", response.data); // Log
     setFollowersList(Array.isArray(response.data) ? response.data : (response.data || []));
  } catch (err) { console.error("Followers Error:", err); /* TODO: Set modal error state */ }
  finally { setFollowersLoading(false); }
 };
 const openFollowingModal = async () => {
  setShowFollowing(true); if (followingList.length > 0 && !statsError) return;
  setFollowingLoading(true);
  const userId = targetUserId || 'user_mock_login';
  console.log(`Attempting API call: GET /following?userId=${userId}`); // Log
  try {
   const response = await apiClient.get(`/following?userId=${userId}`);
   console.log("API Response (Following):", response.data); // Log
        // Normalize to array
        const raw = Array.isArray(response.data) ? response.data : (response.data || []);
        // Deduplicate by followingId or id to ensure unique entries
        const map = new Map();
        raw.forEach((rec) => {
            const key = String(rec.followingId ?? rec.id ?? rec.userId ?? rec.username ?? JSON.stringify(rec));
            if (!map.has(key)) map.set(key, rec);
        });
        const unique = Array.from(map.values());
        setFollowingList(unique);
        // Keep profileData.social.following in sync with actual unique following count
        setProfileData((prev) => ({ ...prev, social: { ...(prev.social || {}), following: unique.length } }));
    } catch (err) {
        // If the resource isn't present (404) treat as empty list so UI shows "No followers/following"
        if (err?.response?.status === 404) {
            console.warn('Followers/Following endpoint not found; treating as empty for user', userId);
            setFollowingList([]);
            setProfileData((prev) => ({ ...prev, social: { ...(prev.social || {}), following: 0 } }));
        } else {
            console.error("Following Error:", err);
            // TODO: Set modal error state if desired
        }
    }
  finally { setFollowingLoading(false); }
 };

// Listen for profile/follow events so the page updates live
useEffect(() => {
    const handler = async (e) => {
        const changedUserId = e?.detail?.userId;
        if (!changedUserId) return;
        const currentUserId = userData?.id || 'user_mock_login';
        // If the changed stats belong to the profile we're viewing, refresh them
        if (String(changedUserId) === String(currentUserId)) {
            fetchProfileStats();
            // Refresh follower/following counts
            try {
                const [fResp, fgResp] = await Promise.all([
                    apiClient.get(`/followers?userId=${currentUserId}`),
                    apiClient.get(`/following?userId=${currentUserId}`)
                ]);
                const followersArr = Array.isArray(fResp.data) ? fResp.data : (fResp.data ? [fResp.data] : []);
                const followingArr = Array.isArray(fgResp.data) ? fgResp.data : (fgResp.data ? [fgResp.data] : []);
                setProfileData(prev => ({ ...(prev || {}), social: { ...(prev?.social || {}), followers: followersArr.length, following: followingArr.length } }));
            } catch (err) {
                console.warn('Could not refresh follow counts after event', err);
            }
            // If modals are open, refresh their lists too
            if (showFollowing) {
                try {
                    setFollowingLoading(true);
                    const resp = await apiClient.get(`/following?userId=${currentUserId}`);
                    setFollowingList(Array.isArray(resp.data) ? resp.data : (resp.data || []));
                } catch (err) {
                    console.warn('Could not refresh following list after event', err);
                } finally { setFollowingLoading(false); }
            }
            if (showFollowers) {
                try {
                    setFollowersLoading(true);
                    const resp = await apiClient.get(`/followers?userId=${currentUserId}`);
                    setFollowersList(Array.isArray(resp.data) ? resp.data : (resp.data || []));
                } catch (err) {
                    console.warn('Could not refresh followers list after event', err);
                } finally { setFollowersLoading(false); }
            }
        }
    };
    window.addEventListener('profileStatsUpdated', handler);
    // Also handle explicit followListChanged if needed to refresh lists
    const listHandler = async (e) => {
        const uid = e?.detail?.userId;
        if (!uid) return;
        const currentUserId = userData?.id || 'user_mock_login';
        if (String(uid) === String(currentUserId)) {
            if (showFollowing) {
                try {
                    setFollowingLoading(true);
                    const resp = await apiClient.get(`/following?userId=${currentUserId}`);
                    setFollowingList(Array.isArray(resp.data) ? resp.data : (resp.data || []));
                } catch (err) { console.warn('Could not refresh following after list event', err); }
                finally { setFollowingLoading(false); }
            }
            if (showFollowers) {
                try {
                    setFollowersLoading(true);
                    const resp = await apiClient.get(`/followers?userId=${currentUserId}`);
                    setFollowersList(Array.isArray(resp.data) ? resp.data : (resp.data || []));
                } catch (err) { console.warn('Could not refresh followers after list event', err); }
                finally { setFollowersLoading(false); }
            }
        }
    };
    window.addEventListener('followListChanged', listHandler);
    return () => {
        window.removeEventListener('profileStatsUpdated', handler);
        window.removeEventListener('followListChanged', listHandler);
    };
}, [userData, showFollowing, showFollowers]);

 // --- Derived State (Calculated AFTER potential API response) ---
 const social = profileData.social || {}; // Use fetched data with fallback
 const stats = profileData.stats || {};   // Use fetched data with fallback

 const achievements = useMemo(() => {
  const list = [];
  if ((stats.films ?? 0) >= 100) list.push({ icon: Trophy, label: 'Watched 100 Films' });
  if ((genres?.length || 0) >= 5) list.push({ icon: Award, label: 'Genre Explorer' });
  return list;
 }, [stats.films, genres]);

 const xpPercent = Math.min(100, ((stats.episodes ?? 0) % 100));
// Use the user's selected start preference as the header badge when available
const prefLabelMap = {
    films: 'Films',
    shows: 'TV Series',
    anime: 'Anime',
    documentaries: 'Documentary',
    any: 'All'
};

// Helper to increment a numeric field under profileStats.social
const incrementProfileStat = async (userId, field, delta) => {
    if (!userId) return;
    try {
        // Try patching specific resource first
        const res = await apiClient.get(`/profileStats/${userId}`);
        const data = res.data || {};
        const social = data.social || { followers: 0, following: 0, comments: 0 };
        const newVal = Math.max(0, (social[field] || 0) + delta);
        const patched = { ...social, [field]: newVal };
        await apiClient.patch(`/profileStats/${userId}`, { social: patched });
        return;
    } catch (err) {
        // If not found, try collection lookup or create
        if (err?.response?.status === 404) {
            try {
                const col = await apiClient.get('/profileStats');
                const body = col.data;
                if (Array.isArray(body)) {
                    const found = body.find(d => String(d.id) === String(userId));
                    if (found) {
                        const social = found.social || { followers: 0, following: 0, comments: 0 };
                        const newVal = Math.max(0, (social[field] || 0) + delta);
                        await apiClient.patch(`/profileStats/${found.id}`, { social: { ...social, [field]: newVal } });
                        return;
                    }
                } else if (body && String(body.id) === String(userId)) {
                    const social = body.social || { followers: 0, following: 0, comments: 0 };
                    const newVal = (social[field] || 0) + delta;
                    await apiClient.patch(`/profileStats/${body.id}`, { social: { ...social, [field]: newVal } });
                    return;
                }
                // Not found in collection: create a new profileStats entry
                const newStats = {
                    id: userId,
                    social: { followers: 0, following: 0, comments: 0, [field]: Math.max(0, delta) },
                    stats: { tvTime: '0', episodes: 0, films: 0, shows: 0, showsStarted: 0, anime: 0, documentaries: 0, lastActive: 'Active via app' }
                };
                await apiClient.post('/profileStats', newStats);
                return;
            } catch (e2) {
                console.warn('incrementProfileStat fallback failed', e2);
            }
        } else {
            console.warn('incrementProfileStat failed', err);
        }
    }
};

// Helper to unfollow a user given their id (the target being followed)
const unfollowUser = async (targetUserId) => {
    const currentUserId = userData?.id || 'user_mock_login';
    try {
        // Find and delete following records where currentUser -> target
        const fRes = await apiClient.get(`/following?userId=${currentUserId}&followingId=${targetUserId}`);
        const followRecords = fRes.data || [];
        await Promise.all(followRecords.map(rec => apiClient.delete(`/following/${rec.id}`)));

        // Find and delete follower records where target -> currentUser
        try {
            const frRes = await apiClient.get(`/followers?userId=${targetUserId}&followerId=${currentUserId}`);
            const followerRecords = frRes.data || [];
            await Promise.all(followerRecords.map(rec => apiClient.delete(`/followers/${rec.id}`)));
        } catch (e) {
            console.warn('Could not remove follower records:', e);
        }

        // Update profileStats counts for both users
        try {
            await incrementProfileStat(currentUserId, 'following', -1);
            await incrementProfileStat(targetUserId, 'followers', -1);
        } catch (e) { console.warn('Failed to decrement stats:', e); }

        // Refresh lists and counts locally
        try {
            const [fResp, fgResp] = await Promise.all([
                apiClient.get(`/followers?userId=${currentUserId}`),
                apiClient.get(`/following?userId=${currentUserId}`)
            ]);
            setFollowersList(Array.isArray(fResp.data) ? fResp.data : (fResp.data || []));
            const raw = Array.isArray(fgResp.data) ? fgResp.data : (fgResp.data || []);
            const map = new Map(); raw.forEach((rec) => { const key = String(rec.followingId ?? rec.id ?? rec.userId ?? rec.username ?? JSON.stringify(rec)); if (!map.has(key)) map.set(key, rec); });
            const unique = Array.from(map.values());
            setFollowingList(unique);
            setProfileData(prev => ({ ...(prev || {}), social: { ...(prev?.social || {}), following: unique.length, followers: (prev?.social?.followers ?? 0) } }));
            // Notify other parts of app
            window.dispatchEvent(new CustomEvent('profileStatsUpdated', { detail: { userId: currentUserId } }));
            window.dispatchEvent(new CustomEvent('profileStatsUpdated', { detail: { userId: targetUserId } }));
            window.dispatchEvent(new CustomEvent('followListChanged', { detail: { userId: currentUserId, targetUserId, action: 'unfollow' } }));
        } catch (e) { console.warn('Error refreshing after unfollow:', e); }
    } catch (err) {
        console.error('Unfollow action failed:', err);
        alert('Could not unfollow. Try again.');
    }
};
const prefLabel = prefLabelMap[startPref] || 'Enthusiast';
const statusTitle = prefLabel;
 const lastActive = statsLoading ? 'Loading...' : (stats.lastActive || 'Active...');

 // Local helper: contentTypeCount depends on component state (statsLoading)
 const contentTypeCount = (id) => {
  if (statsLoading || !stats || Object.keys(stats).length === 0) return '...';
  switch (id) {
   case 'films': return stats.films ?? 0;
   case 'shows': return stats.shows ?? 0;
   case 'anime': return stats.anime ?? 0;
   case 'documentaries': return stats.documentaries ?? 0;
   default: return 0;
  }
 };


 // --- Render Component ---
 return (
  <>
   <Navbar isLoggedIn={true} />
   <div className="min-h-screen bg-black text-white font-sans px-5 pt-14 flex flex-col">
    {/* Header */}
    <header className="mt-8 mb-3 p-3">
     <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
    <div className="flex gap-3 items-start">
       <div className="flex flex-col gap-2 items-start">
        {/* Profile Picture */}
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl border-4 border-[#076452] bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
         {displayUserData?.profile?.profilePicture ? (
          <img src={displayUserData.profile.profilePicture} alt="avatar" className="w-full h-full object-cover" />
         ) : (
          <span className="text-6xl/none opacity-80">👤</span>
         )}
        </div>
        {/* Last Active & Interests */}
        <div className="flex flex-col gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[#aaaaaa] text-[0.8rem]">{lastActive}</span>
                    {additionalInterests?.map(interest => (
                     <span key={interest} className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[0.65rem] font-medium border border-[#222] bg-[#0b0b0b]">{interest}</span>
                    ))}
                    {/* Show gender and location if available */}
                    {displayUserData?.gender && (
                        <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[0.65rem] font-medium border border-[#222] bg-[#0b0b0b]">{displayUserData.gender}</span>
                    )}
                    {displayUserData?.location && (
                        <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[0.65rem] font-medium border border-[#222] bg-[#0b0b0b]">{displayUserData.location}</span>
                    )}
                 </div>
         {/* Bio */}
         {displayUserData?.profile?.bio && (
          <p className="text-sm text-[#aaaaaa] max-w-[44ch] leading-snug">{displayUserData.profile.bio}</p>
         )}
        </div>
       </div>
       {/* Username, Title, Achievements, XP */}
    <div className="flex flex-col gap-1">
     <h1 className="text-3xl md:text-4xl font-bold leading-tight">{username}</h1>
    <div className="flex flex-wrap items-center gap-2 mt-1">
         <span className="inline-flex items-center gap-1 bg-[#3ba55d26] border border-[#076452] px-3 py-1 rounded-full text-[0.7rem] font-semibold">
          🎬 {statsLoading ? '...' : statusTitle}
         </span>
         {achievements.map((a, i) => (
          <span key={i} className="inline-flex items-center gap-1 border border-[#053c2f] px-2 py-1 rounded-full text-[0.65rem] bg-[#0b0b0b]"> <a.icon size={14} /> {a.label}</span>
         ))}
        </div>
        {/* XP Bar */}
        <div className="mt-2">
         <div className="w-28 h-2 rounded-full border border-[#053c2f] bg-[#0b0b0b] overflow-hidden" role="progressbar" aria-valuenow={xpPercent} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: statsLoading ? '0%' : `${xpPercent}%` }} className="h-full bg-gradient-to-r from-[#053c2f] to-[#076452] shadow-[0_0_8px_#3ba55d80] transition-all duration-500" />
         </div>
        </div>
       </div>
      </div>
      {/* Buttons */}
    <div className="flex gap-3 self-stretch md:self-auto md:ml-auto">
       <button className="w-10 h-10 rounded-full border border-[#076452] text-[#076452] grid place-items-center hover:bg-[#076452]/10 transition" aria-label="Notifications">
        <Bell size={20} />
       </button>
       {isViewingOwnProfile && (
        <button onClick={() => setIsEditing(v=>!v)} className="px-5 py-2 rounded-full bg-[#076452] font-semibold text-sm hover:shadow-[0_0_12px_#07645273] hover:-translate-y-[1px] transition">{isEditing ? 'Done' : 'Edit Profile'}</button>
       )}
      </div>
     </div>
    </header>

    {/* 2️⃣ Social Stats Row - Uses fetched 'social' */}
    <section className="grid grid-cols-3 gap-3 mb-3">
     {[
      { icon: Users, label: 'Following', value: statsLoading ? '...' : (social.following ?? 0), on: openFollowingModal },
      { icon: UserPlus, label: 'Followers', value: statsLoading ? '...' : (social.followers ?? 0), on: openFollowersModal },
      { icon: MessageCircle, label: 'Comments', value: statsLoading ? '...' : (social.comments ?? 0), on: ()=>console.log('Comments list') },
     ].map((s,i)=> (
      <button key={i} onClick={s.on} className="group relative border border-[#222] rounded-lg p-3 bg-transparent hover:border-[#076452] hover:shadow-[0_0_10px_#07645255] transition grid grid-cols-[auto_1fr] grid-rows-2 gap-x-2 text-left">
       <s.icon size={16} className="text-[#076452] col-start-1 row-start-1" />
       <span className="text-xs text-[#aaaaaa] col-start-1 row-start-2">{s.label}</span>
       <span className="col-start-2 row-span-2 justify-self-end self-center font-extrabold text-lg">{s.value}</span>
      </button>
     ))}
    </section>
    <div className="h-px bg-[#111] my-2 rounded-full" />

    {/* Display Stats Error if any */}
    {statsError && (
     <div className="text-center text-red-500 p-3 mb-3 bg-red-800/20 rounded-lg">
      <strong>Error:</strong> {statsError}
     </div>
    )}

    {/* 3️⃣ User Stats Section - Uses fetched 'stats' */}
    <section className="border border-[#222] rounded-xl overflow-hidden mb-3 divide-y divide-[#111]">
     <div className="grid md:grid-cols-2">
      <div className="flex items-center gap-3 p-4">
       <Tv size={20} className="text-[#076452]" />
       <div className="flex flex-col text-sm">
        <span className="text-[#aaaaaa] uppercase tracking-wide text-[0.65rem]">TV Time</span>
        <span className="font-semibold text-white text-sm">{statsLoading ? '...' : (stats.tvTime || 'N/A')}</span>
       </div>
      </div>
      <div className="flex items-center gap-3 p-4">
       <Film size={20} className="text-[#076452]" />
       <div className="flex flex-col text-sm">
        <span className="text-[#aaaaaa] uppercase tracking-wide text-[0.65rem]">Films Watched</span>
        <span className="font-semibold text-white">{statsLoading ? '...' : (stats.films ?? 0)}</span>
       </div>
      </div>
     </div>
     <div className="grid md:grid-cols-2">
      <div className="flex items-center gap-3 p-4">
       <Play size={20} className="text-[#076452]" />
       <div className="flex flex-col text-sm">
        <span className="text-[#aaaaaa] uppercase tracking-wide text-[0.65rem]">Episodes Watched</span>
        <span className="inline-flex items-center gap-1 font-semibold">{statsLoading ? '...' : (stats.episodes ?? 0)}<TrendingUp size={14} className="text-[#3BA55D]" /></span>
        <div className="w-40 h-1.5 rounded-full border border-[#053c2f] bg-[#0b0b0b] overflow-hidden mt-1">
         <div style={{ width: statsLoading ? '0%' : `${Math.min(100, (stats.episodes ?? 0) / 10)}%` }} className="h-full bg-[#076452] shadow-[0_0_6px_#3ba55d70]" />
        </div>
       </div>
      </div>
      <div className="flex items-center gap-3 p-4">
       <CheckCircle2 size={20} className="text-[#076452]" />
       <div className="flex flex-col text-sm">
        <span className="text-[#aaaaaa] uppercase tracking-wide text-[0.65rem]">Shows Completed</span>
        <span className="inline-flex items-center gap-1 font-semibold">{statsLoading ? '...' : (stats.shows ?? 0)}<TrendingDown size={14} className="text-[#cc4444]" /></span>
        <div className="w-40 h-1.5 rounded-full border border-[#053c2f] bg-[#0b0b0b] overflow-hidden mt-1">
         <div style={{ width: statsLoading ? '0%' : `${Math.min(100, ((stats.shows ?? 0) / Math.max(1, (stats.showsStarted || 1))) * 100)}%` }} className="h-full bg-[#076452] shadow-[0_0_6px_#3ba55d70]" />
        </div>
       </div>
      </div>
     </div>
    </section>
    <div className="h-px bg-[#111] my-2 rounded-full" />

    {/* 4️⃣ Preferences Section - Uses fetched 'stats' */}
    <section className="border border-[#222] rounded-xl p-5 mb-4">
     <h3 className="text-sm font-extrabold mb-3 pb-1 border-b border-[#222]">Preferences</h3>
     <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
       <h4 className="font-bold">Genres</h4>
       <div className="flex flex-wrap gap-2">
        {genres.length ? genres.map(g => (
         <span key={g} className="inline-flex items-center gap-1 bg-[#076452]/10 border border-[#076452] text-white px-3 py-1 rounded-full text-xs font-medium"><span>{genreIcon(g)}</span>{g}</span>
        )) : <span className="text-[#666] italic text-sm">No genres selected</span>}
       </div>
      </div>
      <div className="space-y-3">
       <h4 className="font-bold">Content Type</h4>
       <div className="grid grid-cols-2 gap-3">
        {contentTypes.map(p => {
         const active = startPref === p.id;
         return (
          <div key={p.id} className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border transition text-center ${active ? 'bg-[#076452]/15 border-[#076452] shadow-[0_0_10px_#07645255]' : 'border-[#053c2f] hover:border-[#076452] hover:bg-[#076452]/10'}` }>
           <p.Icon size={20} />
           <span className="text-xs font-medium">{p.label}</span>
           <span className="absolute top-1 right-1 text-[0.6rem] text-[#aaaaaa] bg-black/60 px-2 py-[2px] rounded-full border border-[#222]">{contentTypeCount(p.id, stats)}</span>
          </div>
         );
        })}
       </div>
      </div>
     </div>
    </section>

    {/* 5️⃣ Tabs Section (No change needed) */}
    <nav className="flex border-b border-[#222] mt-2 mb-4" role="tablist" aria-label="Profile tabs">
     {tabs.map(t => (
      <button key={t} onClick={()=>setSelectedTab(t)} role="tab" aria-selected={selectedTab===t}
       className={`relative flex-1 px-2 py-3 text-center font-semibold text-sm transition ${selectedTab===t ? 'text-white' : 'text-[#aaaaaa] hover:text-white'}`}> {t}
       {selectedTab===t && <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] bg-[#076452] rounded-full shadow-[0_0_8px_#07645280]" />}
      </button>
     ))}
    </nav>

    {/* 6️⃣ Tab content - Updated with Loading/Error/Data */}
    <main className="mt-2 mb-12">
     <section className="mb-6">
      <h3 className="text-sm font-extrabold mb-3 pb-1 border-b border-[#222]">{selectedTab}</h3>
      {/* Loading State */}
      {tabLoading && (
       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => <TabSkeletonLoader key={idx} />)}
       </div>
      )}
      {/* Error State */}
      {tabError && !tabLoading && (
       <div className="text-center text-red-500 p-10 bg-red-800/20 rounded-lg">
        <strong>Error:</strong> {tabError}
       </div>
      )}
      {/* Empty State */}
      {!tabLoading && !tabError && tabContent.length === 0 && (
       <div className="text-center text-gray-400 p-10">
        No {selectedTab.toLowerCase()} found yet.
       </div>
      )}
      {/* Content: Posts */}
    {!tabLoading && !tabError && tabContent.length > 0 && selectedTab === 'Posts' && (
     <div className="grid gap-3">
      {tabContent.map((post) => (
       <article key={post.id} className="border border-[#053c2f] rounded-xl p-4 bg-black/60 hover:shadow-[0_0_12px_#07645250] transition">
        <div className="flex items-center justify-between mb-2">
         <h4 className="font-bold">{post.title || post.name || post.id}</h4>
         <div className="flex gap-4 text-xs text-[#aaaaaa]">
        <span>❤️ {post.likesCount ?? post.likes ?? 0}</span><span>💬 {post.commentsCount ?? post.comments ?? 0}</span>
         </div>
        </div>
        <p className="text-sm text-[#aaaaaa]">{post.contentPreview ?? post.content ?? post.description ?? ''}</p>
       </article>
      ))}
     </div>
    )}
      {/* Content: Likes (posts format with user info) */}
    {!tabLoading && !tabError && tabContent.length > 0 && selectedTab === 'Likes' && (
     <div className="grid gap-3">
      {tabContent.map((post) => (
       <article key={post.id} className="border border-[#053c2f] rounded-xl p-4 bg-black/60 hover:shadow-[0_0_12px_#07645250] transition">
        {/* User Profile Section */}
        <div className="flex items-center gap-3 mb-3">
         <img 
          src={post.user?.avatar || '/src/assets/LOGO.png'} 
          alt="avatar" 
          className="w-10 h-10 rounded-full border-2 border-[#076452] object-cover" 
         />
         <div className="flex flex-col flex-1">
          <span className="font-bold text-white text-sm">{post.user?.name || 'Unknown Creator'}</span>
          {post.time && <span className="text-[#aaa] text-xs">{post.time}</span>}
         </div>
        </div>
        {/* Post Content */}
        <div className="flex items-center justify-between mb-2">
         <h4 className="font-bold">{post.title || post.name || post.id}</h4>
         <div className="flex gap-4 text-xs text-[#aaaaaa]">
        <span>❤️ {post.likesCount ?? post.likes ?? 0}</span><span>💬 {post.commentsCount ?? post.comments ?? 0}</span>
         </div>
        </div>
        <p className="text-sm text-[#aaaaaa]">{post.contentPreview ?? post.content ?? post.description ?? ''}</p>
       </article>
      ))}
     </div>
    )}
      {/* Content: Reviews */}
            {!tabLoading && !tabError && tabContent.length > 0 && selectedTab === 'Reviews' && (
             <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {tabContent.map((item) => {
                    const title = item.title || item.name || item.id;
                    const desc = item.description ?? item.contentPreview ?? item.content ?? '';
                    return (
                        <article key={item.id ?? title} className="rounded-xl overflow-hidden border border-[#053c2f] bg-gradient-to-b from-[#111] to-black hover:shadow-[0_0_12px_#07645255] transition">
                            <div className="pt-[56%] bg-gray-700" />
                            <div className="p-3">
                             <h4 className="m-0 mb-1 font-semibold">{title}</h4>
                             <p className="text-xs text-[#aaaaaa]">{desc}</p>
                            </div>
                        </article>
                    );
                })}
             </div>
            )}
     </section>
    </main>


    {/* Followers/FOLLOWING Modals - Updated with Loading/Data */}
    {showFollowers && (
     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-50" role="dialog" aria-modal="true" onClick={()=>setShowFollowers(false)}>
      <div className="w-[min(520px,92vw)] bg-[#0d0d0d] border border-[#222] rounded-xl overflow-hidden" onClick={e=>e.stopPropagation()}>
       <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
        <h4 className="font-semibold">Followers</h4>
        <button onClick={()=>setShowFollowers(false)} className="w-8 h-8 rounded-full border border-[#076452] text-[#076452] grid place-items-center hover:bg-[#076452]/10">✖</button>
       </div>
       <div className="max-h-[60vh] overflow-auto p-3 grid gap-2">
                {followersLoading ? (
                 <ModalSpinner />
                ) : followersList.length === 0 ? (
                 <div className="text-center p-8 text-gray-400">No followers found.</div>
                ) : (
                 // Render resolved follower entries: entries may be 'follower' records or full user objects
                 followersList.map((entry) => {
                     const uid = String(entry.followerId ?? entry.id ?? entry.userId ?? entry.followerId);
                     const name = entry.username || entry.name || entry.fullName || entry.firstName || uid;
                     const avatar = entry.avatarUrl || entry.profile?.profilePicture || 'https://placehold.co/40x40/777/FFF?text=U';
                     return (
                         <div key={uid} className="flex items-center gap-3 px-3 py-2 bg-black border border-[#222] rounded-lg text-sm">
                             <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full bg-gray-700 object-cover" />
                             <div className="flex flex-col">
                                 <span className="font-semibold">{name}</span>
                                 {entry.profile?.bio && <span className="text-xs text-[#999]">{entry.profile.bio}</span>}
                             </div>
                         </div>
                     );
                 })
                )}
       </div>
      </div>
     </div>
    )}
    {showFollowing && (
     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-50" role="dialog" aria-modal="true" onClick={()=>setShowFollowing(false)}>
      <div className="w-[min(520px,92vw)] bg-[#0d0d0d] border border-[#222] rounded-xl overflow-hidden" onClick={e=>e.stopPropagation()}>
       <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
        <h4 className="font-semibold">Following</h4>
        <button onClick={()=>setShowFollowing(false)} className="w-8 h-8 rounded-full border border-[#076452] text-[#076452] grid place-items-center hover:bg-[#076452]/10">✖</button>
       </div>
       <div className="max-h-[60vh] overflow-auto p-3 grid gap-2">
        {followingLoading ? (
         <ModalSpinner />
        ) : followingList.length === 0 ? (
         <div className="text-center p-8 text-gray-400">Not following anyone.</div>
                ) : (
                 // Deduplicate followingList by followingId or id to avoid duplicate entries
                 (() => {
                     const map = new Map();
                     (followingList || []).forEach((entry) => {
                         const key = String(entry.followingId ?? entry.id ?? entry.userId ?? entry.username ?? entry);
                         if (!map.has(key)) map.set(key, entry);
                     });
                     return Array.from(map.values()).map((entry) => {
                         const key = String(entry.followingId ?? entry.id ?? entry.userId ?? entry.username ?? entry);
                         const name = entry.username || entry.name || entry.fullName || entry.firstName || key;
                         const avatar = entry.avatarUrl || entry.profile?.profilePicture || 'https://placehold.co/40x40/999/FFF?text=U';
                         const followingUserId = entry.followingId ?? entry.id ?? entry.userId;
                         return (
                                                         <div key={key} className="flex items-center justify-between gap-3 px-3 py-2 bg-black border border-[#222] rounded-lg text-sm hover:bg-[#1a1a1a] transition cursor-pointer" onClick={() => {
                                                             if (followingUserId) {
                                                                 navigate(`/profile/${followingUserId}`);
                                                                 setShowFollowing(false);
                                                             }
                                                         }}>
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full bg-gray-700 object-cover" />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-semibold">{name}</span>
                                                                        {entry.profile?.bio && <span className="text-xs text-[#999]">{entry.profile.bio}</span>}
                                                                    </div>
                                                                </div>
                                                                {isViewingOwnProfile && (
                                                                    <div onClick={(e) => e.stopPropagation()}>
                                                                        <button onClick={() => unfollowUser(entry.followingId ?? entry.id ?? entry.userId ?? key)} className="px-3 py-1 rounded-full bg-[#170f0f] border border-[#663] text-[#f3f3f3] hover:bg-[#2a1a1a] text-sm">Unfollow</button>
                                                                    </div>
                                                                )}
                                                         </div>
                         );
                     });
                 })()
                )}
       </div>
      </div>
     </div>
    )}
   </div>

   {/* Footer */}
   <Footer isLoggedIn={true} />
  </>
 );
};

// Helpers
function genreIcon(name) {
 const map = {
  'Drama': '🎭', 'Sci-Fi': '🤖', 'Science Fiction': '🤖', 'Action': '🔥',
  'Comedy': '😂', 'Horror': '👻', 'Romance': '❤️', 'Thriller': '🕵️',
  'Animation': '🎨', 'Fantasy': '🧙', 'Documentary': '🎥'
 };
 return map[name] || '🎬';
}

// Updated Helper Function to accept stats and handle loading
// contentTypeCount is implemented inside the component so it can access statsLoading/stats

export default ProfilePage;