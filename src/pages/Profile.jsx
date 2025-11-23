import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Film, Tv, Clapperboard, FileText, Users, UserPlus, CheckCircle2, TrendingDown, Trophy, Award } from 'lucide-react';
import apiClient from '../api/axiosConfig';

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

const Profile = ({ userData, onUpdateProfile, onLogout }) => {
  const { userId: urlUserId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('Posts');
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    gender: '',
    location: '',
  });

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
          const data = response.data;
          setViewingUserData(data);
        } catch (err) {
          console.error('Error fetching user data:', err);
          navigate('/profile', { replace: true });
        }
      };
      fetchUserData();
    } else {
      setViewingUserData(null);
    }
  }, [urlUserId, currentUserId, navigate]);

  // Initialize edit form when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const data = displayUserData;
      setEditForm({
        firstName: data?.firstName || '',
        lastName: data?.lastName || '',
        bio: data?.profile?.bio || '',
        gender: data?.gender || '',
        location: data?.location || '',
      });
    }
  }, [isEditing, displayUserData]);

  // --- userData from App.jsx (passed as prop) or fetched user data ---
  const username = useMemo(() => {
    const data = displayUserData;
    if (data?.username && String(data.username).trim()) return data.username;
    const first = data?.firstName || 'User';
    const last = data?.lastName ? ` ${data.lastName}` : '';
    return `${first}${last}`;
  }, [displayUserData]);

  const [genres, setGenres] = useState(displayUserData?.preferences?.genres || []);
  const [startPref, setStartPref] = useState(displayUserData?.preferences?.startPreference || 'films');
  const [additionalInterests] = useState(displayUserData?.preferences?.additionalInterests || []);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);

  // Keep local preference state in sync if user/profile changes
  useEffect(() => {
    setGenres(displayUserData?.preferences?.genres || []);
    setStartPref(displayUserData?.preferences?.startPreference || 'films');
  }, [displayUserData]);

  // --- Static Data ---
  const contentTypes = [
    { id: 'films', label: 'Films', Icon: Film },
    { id: 'shows', label: 'Shows', Icon: Tv },
    { id: 'anime', label: 'Anime', Icon: Clapperboard },
    { id: 'documentaries', label: 'Documentary', Icon: FileText }
  ];
  const tabs = ['Posts', 'Likes'];

  // --- API Calls ---
  const fetchProfileStats = async () => {
    setStatsLoading(true); setStatsError(null);
    try {
      const userId = targetUserId || 'user_mock_login';
      let response;
      try {
        response = await apiClient.get(`/profileStats/${userId}`);
      } catch (e) {
        response = await apiClient.get('/profileStats');
      }

      let data = response.data;
      if (Array.isArray(data)) {
        const found = data.find((d) => String(d.id) === String(userId));
        data = found || data[0] || {};
      }

      setProfileData(data || {});
      try {
        const [fResp, fgResp] = await Promise.all([
          apiClient.get(`/followers?userId=${userId}`),
          apiClient.get(`/following?userId=${userId}`)
        ]);
        const followersArr = Array.isArray(fResp.data) ? fResp.data : (fResp.data ? [fResp.data] : []);
        const followingArr = Array.isArray(fgResp.data) ? fgResp.data : (fgResp.data ? [fgResp.data] : []);
        setProfileData(prev => ({ ...(prev || {}), social: { ...(prev?.social || {}), followers: followersArr.length, following: followingArr.length } }));
      } catch (e) {
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
        console.warn('Could not fetch follow counts', err);
      }
    };
    fetchFollowCounts();
  }, [targetUserId]);

  useEffect(() => { // Fetch tab content when tab or user changes
    const fetchTabContent = async () => {
      setTabLoading(true); setTabError(null); setTabContent([]);
      const userId = targetUserId || 'user_mock_login';

      if (selectedTab.toLowerCase() === 'likes') {
        try {
          const likesResponse = await apiClient.get(`/likes?userId=${userId}`);
          const likes = Array.isArray(likesResponse.data) ? likesResponse.data : (likesResponse.data ? [likesResponse.data] : []);
          if (likes.length === 0) { setTabContent([]); setTabLoading(false); return; }
          const postIds = likes.map(like => like.postId).filter(Boolean);
          if (postIds.length === 0) { setTabContent([]); setTabLoading(false); return; }
          const [postResponses, usersResponse] = await Promise.all([
            Promise.all(postIds.map(postId => apiClient.get(`/postsApi/${postId}`).catch(() => null))),
            apiClient.get('/users').catch(() => ({ data: [] }))
          ]);
          const posts = postResponses.filter(res => res && res.data).map(res => res.data);
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
            const userInfo = userId && usersByKey.get(userId) || { id: post.userId, name: 'Unknown Creator', avatar: '/src/assets/LOGO.png' };
            return { ...post, user: userInfo };
          });
          setTabContent(enrichedPosts);
        } catch (err) {
          console.error('Likes Error:', err);
          setTabError('Could not load likes.');
          setTabContent([]);
        } finally { setTabLoading(false); }
        return;
      }

      let endpoint = '';
      switch (selectedTab.toLowerCase()) {
        case 'posts': endpoint = `/postsApi?userId=${userId}`; break;
        default: setTabLoading(false); return;
      }
      try {
        const response = await apiClient.get(endpoint);
        const data = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
        setTabContent(data);
      } catch (err) { console.error(`${selectedTab} Error:`, err); setTabError(`Could not load ${selectedTab}.`); }
      finally { setTabLoading(false); }
    };
    fetchTabContent();
  }, [selectedTab, targetUserId]);

  useEffect(() => {
    const handlePostLiked = async (e) => {
      const { postId } = e.detail || {};
      if (!postId) return;
      if (selectedTab === 'Posts' || selectedTab === 'Likes') {
        const userId = targetUserId || 'user_mock_login';
        if (selectedTab === 'Posts') {
          try { const response = await apiClient.get(`/postsApi?userId=${userId}`); const data = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []); setTabContent(data); } catch (err) { console.error('Error refreshing posts:', err); }
        } else if (selectedTab === 'Likes') {
          try {
            const likesResponse = await apiClient.get(`/likes?userId=${userId}`);
            const likes = Array.isArray(likesResponse.data) ? likesResponse.data : (likesResponse.data ? [likesResponse.data] : []);
            if (likes.length === 0) { setTabContent([]); return; }
            const postIds = likes.map(like => like.postId).filter(Boolean);
            if (postIds.length === 0) { setTabContent([]); return; }
            const [postResponses, usersResponse] = await Promise.all([
              Promise.all(postIds.map(postId => apiClient.get(`/postsApi/${postId}`).catch(() => null))),
              apiClient.get('/users').catch(() => ({ data: [] }))
            ]);
            const posts = postResponses.filter(res => res && res.data).map(res => res.data);
            const users = Array.isArray(usersResponse.data) ? usersResponse.data : (usersResponse.data ? [usersResponse.data] : []);
            const usersByKey = new Map();
            users.forEach(u => { const keyId = u.id != null ? String(u.id) : null; if (keyId) usersByKey.set(keyId, { id: u.id, name: u.username || u.fullName || u.firstName || u.email || 'Unknown', avatar: u.profile?.profilePicture || '/src/assets/LOGO.png' }); });
            const enrichedPosts = posts.map(post => { const userId = post.userId != null ? String(post.userId) : null; const userInfo = userId && usersByKey.get(userId) || { id: post.userId, name: 'Unknown Creator', avatar: '/src/assets/LOGO.png' }; return { ...post, user: userInfo }; });
            setTabContent(enrichedPosts);
          } catch (err) { console.error('Error refreshing likes:', err); }
        }
      }
    };

    const handlePostCommented = handlePostLiked;
    window.addEventListener('postLiked', handlePostLiked);
    window.addEventListener('postCommented', handlePostCommented);
    return () => { window.removeEventListener('postLiked', handlePostLiked); window.removeEventListener('postCommented', handlePostCommented); };
  }, [selectedTab, targetUserId]);

  // --- Modal Fetch Functions ---
  const openFollowersModal = async () => {
    setShowFollowers(true); if (followersList.length > 0 && !statsError) return;
    setFollowersLoading(true);
    const userId = targetUserId || 'user_mock_login';
    try {
      const response = await apiClient.get(`/followers?userId=${userId}`);
      const baseList = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      const enriched = await Promise.all(baseList.map(async (entry) => {
        const followerId = entry.followerId ?? entry.userId ?? entry.id;
        if (!followerId) return entry;
        try {
          const userRes = await apiClient.get(`/users/${followerId}`);
          const u = userRes.data;
          return { ...entry, username: u.username || u.fullName || u.firstName || u.email, avatarUrl: u.profile?.profilePicture || entry.avatarUrl, profile: u.profile || entry.profile };
        } catch { return entry; }
      }));
      setFollowersList(enriched);
    } catch (err) { console.error("Followers Error:", err); }
    finally { setFollowersLoading(false); }
  };

  const openFollowingModal = async () => {
    setShowFollowing(true); if (followingList.length > 0 && !statsError) return;
    setFollowingLoading(true);
    const userId = targetUserId || 'user_mock_login';
    try {
      const response = await apiClient.get(`/following?userId=${userId}`);
      const raw = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      const enriched = await Promise.all(raw.map(async (entry) => {
        const followId = entry.followingId ?? entry.userId ?? entry.id;
        if (!followId) return entry;
        try { const userRes = await apiClient.get(`/users/${followId}`); const u = userRes.data; return { ...entry, username: u.username || u.fullName || u.firstName || u.email, avatarUrl: u.profile?.profilePicture || entry.avatarUrl, profile: u.profile || entry.profile }; } catch { return entry; }
      }));
      const map = new Map(); enriched.forEach((rec) => { const key = String(rec.followingId ?? rec.id ?? rec.userId ?? rec.username ?? JSON.stringify(rec)); if (!map.has(key)) map.set(key, rec); });
      const unique = Array.from(map.values());
      setFollowingList(unique);
      setProfileData(prev => ({ ...prev, social: { ...(prev.social || {}), following: unique.length } }));
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn('Followers/Following endpoint not found; treating as empty for user', userId);
        setFollowingList([]);
        setProfileData((prev) => ({ ...prev, social: { ...(prev.social || {}), following: 0 } }));
      } else { console.error("Following Error:", err); }
    }
    finally { setFollowingLoading(false); }
  };

  useEffect(() => {
    const handler = async (e) => {
      const changedUserId = e?.detail?.userId;
      if (!changedUserId) return;
      const currentUserId = userData?.id || 'user_mock_login';
      if (String(changedUserId) === String(currentUserId)) {
        fetchProfileStats();
        try {
          const [fResp, fgResp] = await Promise.all([apiClient.get(`/followers?userId=${currentUserId}`), apiClient.get(`/following?userId=${currentUserId}`)]);
          const followersArr = Array.isArray(fResp.data) ? fResp.data : (fResp.data ? [fResp.data] : []);
          const followingArr = Array.isArray(fgResp.data) ? fgResp.data : (fgResp.data ? [fgResp.data] : []);
          setProfileData(prev => ({ ...(prev || {}), social: { ...(prev?.social || {}), followers: followersArr.length, following: followingArr.length } }));
        } catch (err) { console.warn('Could not refresh follow counts after event', err); }
        if (showFollowing) {
          try { setFollowingLoading(true); const resp = await apiClient.get(`/following?userId=${currentUserId}`); setFollowingList(Array.isArray(resp.data) ? resp.data : (resp.data || [])); } catch (err) { console.warn('Could not refresh following list after event', err); } finally { setFollowingLoading(false); }
        }
        if (showFollowers) {
          try { setFollowersLoading(true); const resp = await apiClient.get(`/followers?userId=${currentUserId}`); setFollowersList(Array.isArray(resp.data) ? resp.data : (resp.data || [])); } catch (err) { console.warn('Could not refresh followers list after event', err); } finally { setFollowersLoading(false); }
        }
      }
    };
    const listHandler = async (e) => {
      const uid = e?.detail?.userId; if (!uid) return; const currentUserId = userData?.id || 'user_mock_login'; if (String(uid) === String(currentUserId)) {
        if (showFollowing) { try { setFollowingLoading(true); const resp = await apiClient.get(`/following?userId=${currentUserId}`); setFollowingList(Array.isArray(resp.data) ? resp.data : (resp.data || [])); } catch (err) { console.warn('Could not refresh following after list event', err); } finally { setFollowingLoading(false); } }
        if (showFollowers) { try { setFollowersLoading(true); const resp = await apiClient.get(`/followers?userId=${currentUserId}`); setFollowersList(Array.isArray(resp.data) ? resp.data : (resp.data || [])); } catch (err) { console.warn('Could not refresh followers after list event', err); } finally { setFollowersLoading(false); } }
      }
    };
    window.addEventListener('profileStatsUpdated', handler);
    window.addEventListener('followListChanged', listHandler);
    return () => { window.removeEventListener('profileStatsUpdated', handler); window.removeEventListener('followListChanged', listHandler); };
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

  const prefLabelMap = {
    films: 'Films',
    shows: 'TV Series',
    anime: 'Anime',
    documentaries: 'Documentary',
    any: 'All'
  };

  const prefLabel = prefLabelMap[startPref] || 'Enthusiast';
  const statusTitle = prefLabel;
  const lastActive = statsLoading ? 'Loading...' : (stats.lastActive || 'Active...');

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

  // Helper to unfollow a user given their id (the target being followed)
  const unfollowUser = async (targetUserId) => {
    const currentUserId = userData?.id || 'user_mock_login';
    try {
      const fRes = await apiClient.get(`/following?userId=${currentUserId}&followingId=${targetUserId}`);
      const followRecords = fRes.data || [];
      await Promise.all(followRecords.map(rec => apiClient.delete(`/following/${rec.id}`)));
      try {
        const frRes = await apiClient.get(`/followers?userId=${targetUserId}&followerId=${currentUserId}`);
        const followerRecords = frRes.data || [];
        await Promise.all(followerRecords.map(rec => apiClient.delete(`/followers/${rec.id}`)));
      } catch (e) { console.warn('Could not remove follower records:', e); }
      try {
        await apiClient.get(`/profileStats/${currentUserId}`);
      } catch (e) { /* ignore */ }
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
        window.dispatchEvent(new CustomEvent('profileStatsUpdated', { detail: { userId: currentUserId } }));
        window.dispatchEvent(new CustomEvent('profileStatsUpdated', { detail: { userId: targetUserId } }));
        window.dispatchEvent(new CustomEvent('followListChanged', { detail: { userId: currentUserId, targetUserId, action: 'unfollow' } }));
      } catch (e) { console.warn('Error refreshing after unfollow:', e); }
    } catch (err) {
      console.error('Unfollow action failed:', err);
      alert('Could not unfollow. Try again.');
    }
  };

  // --- Render Component ---
  return (
    <>
      <Navbar isLoggedIn={true} />
      <div className="min-h-screen bg-black text-white font-sans px-5 pt-14 flex flex-col">
        {/* Header */}
        <header className="mt-6 mb-3 px-4 pt-4 pb-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            {/* LEFT: Avatar + main info */}
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl border-4 border-[#076452] bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                {displayUserData?.profile?.profilePicture ? (
                  <img src={displayUserData.profile.profilePicture} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl/none opacity-80">👤</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">{username}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 bg-[#3ba55d26] border border-[#076452] px-3 py-1 rounded-full text-[0.7rem] font-semibold">🎬 {statsLoading ? '...' : statusTitle}</span>
                    {achievements.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 border border-[#053c2f] px-2 py-1 rounded-full text-[0.65rem] bg-[#0b0b0b]"><a.icon size={14} /> {a.label}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[#aaaaaa] text-[0.8rem]">{lastActive}</span>
                  {additionalInterests?.map((interest) => (
                    <span key={interest} className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[0.65rem] font-medium border border-[#222] bg-[#0b0b0b]">{interest}</span>
                  ))}
                  {displayUserData?.gender && (<span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[0.65rem] font-medium border border-[#222] bg-[#0b0b0b]">{displayUserData.gender}</span>)}
                  {displayUserData?.location && (<span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[0.65rem] font-medium border border-[#222] bg-[#0b0b0b]">{displayUserData.location}</span>)}
                </div>

                {displayUserData?.profile?.bio && (<p className="text-sm text-[#aaaaaa] max-w-[44ch] leading-snug">{displayUserData.profile.bio}</p>)}
              </div>
            </div>

            {/* RIGHT: Edit Profile button only */}
            <div className="flex gap-3 self-stretch md:self-auto md:ml-auto">
              {isViewingOwnProfile && (
                <button onClick={() => setIsEditing((v) => !v)} className="px-5 py-2 rounded-full bg-[#076452] font-semibold text-sm hover:shadow-[0_0_12px_#07645273] hover:-translate-y-[1px] transition">{isEditing ? 'Done' : 'Edit Profile'}</button>
              )}
            </div>
          </div>
        </header>

        {/* Simple Edit Profile Form */}
        {isEditing && isViewingOwnProfile && (
          <section className="border border-[#222] rounded-xl p-4 mb-4 bg-[#050505]">
            <h3 className="text-sm font-extrabold mb-3 pb-1 border-b border-[#222]">Edit Profile</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <label className="block text-xs text-[#aaaaaa]">First Name</label>
                <input className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm text-white" value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-[#aaaaaa]">Last Name</label>
                <input className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm text-white" value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs text-[#aaaaaa]">Bio</label>
                <textarea rows={3} className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm text-white" value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-[#aaaaaa]">Gender</label>
                <input className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm text-white" value={editForm.gender} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-[#aaaaaa]">Location</label>
                <input className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm text-white" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2 rounded-full border border-[#333] text-sm" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="px-5 py-2 rounded-full bg-[#076452] text-sm font-semibold" onClick={async () => {
                if (!currentUserId) return;
                const namePattern = /^[A-Za-z0-9 ]+$/;
                if (editForm.firstName && !namePattern.test(editForm.firstName.trim())) { alert('First name can only contain letters, numbers and spaces.'); return; }
                if (editForm.lastName && !namePattern.test(editForm.lastName.trim())) { alert('Last name can only contain letters, numbers and spaces.'); return; }
                try {
                  const existingRes = await apiClient.get(`/users/${currentUserId}`);
                  const existing = existingRes.data || {};
                  const updated = { ...existing, firstName: editForm.firstName, lastName: editForm.lastName, gender: editForm.gender, location: editForm.location, profile: { ...(existing.profile || {}), bio: editForm.bio } };
                  await apiClient.put(`/users/${currentUserId}`, updated);
                  localStorage.setItem('app:userData', JSON.stringify(updated));
                  if (onUpdateProfile) onUpdateProfile(updated);
                  setIsEditing(false);
                } catch (e) { console.error('Failed to save profile', e); alert('Could not save profile changes.'); }
              }}>Save Changes</button>
            </div>
          </section>
        )}

        {/* Social Stats Row */}
        <section className="w-full mb-3">
          <div className="w-full grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: 'Following', value: statsLoading ? '...' : (social.following ?? 0), on: openFollowingModal },
              { icon: UserPlus, label: 'Followers', value: statsLoading ? '...' : (social.followers ?? 0), on: openFollowersModal },
            ].map((s, i) => (
              <button key={i} onClick={s.on} className="group relative border border-[#222] rounded-lg p-3 bg-transparent hover:border-[#076452] hover:shadow-[0_0_10px_#07645255] transition grid grid-cols-[auto_1fr] grid-rows-2 gap-x-2 text-left w-full">
                <s.icon size={16} className="text-[#076452] col-start-1 row-start-1" />
                <span className="text-xs text-[#aaaaaa] col-start-1 row-start-2">{s.label}</span>
                <span className="col-start-2 row-span-2 justify-self-end self-center font-extrabold text-lg">{s.value}</span>
              </button>
            ))}
          </div>
        </section>
        <div className="h-px bg-[#111] my-2 rounded-full" />

        {/* Display Stats Error if any */}
        {statsError && (<div className="text-center text-red-500 p-3 mb-3 bg-red-800/20 rounded-lg"><strong>Error:</strong> {statsError}</div>)}

        {/* User Stats Section (episodes removed; layout adjusted to a 3-column grid) */}
        <section className="border border-[#222] rounded-xl overflow-hidden mb-3 divide-y divide-[#111]">
            <div className="grid md:grid-cols-3">
            <div className="flex items-center gap-3 p-4">
              <Film size={20} className="text-[#076452]" />
              <div className="flex flex-col text-sm">
                <span className="text-[#aaaaaa] uppercase tracking-wide text-[0.65rem]">Films Watched</span>
                <span className="font-semibold text-white">{statsLoading ? '...' : (stats.films ?? 0)}</span>
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

            <div className="flex items-center gap-3 p-4">
              <Tv size={20} className="text-[#076452]" />
              <div className="flex flex-col text-sm">
                <span className="text-[#aaaaaa] uppercase tracking-wide text-[0.65rem]">TV Time</span>
                <span className="font-semibold text-white text-sm">{statsLoading ? '...' : (stats.tvTime || 'N/A')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4">
              <Clapperboard size={20} className="text-[#076452]" />
              <div className="flex flex-col text-sm">
                <span className="text-[#aaaaaa] uppercase tracking-wide text-[0.65rem]">Anime Watched</span>
                <span className="font-semibold text-white">{statsLoading ? '...' : (stats.anime ?? 0)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4">
              <FileText size={20} className="text-[#076452]" />
              <div className="flex flex-col text-sm">
                <span className="text-[#aaaaaa] uppercase tracking-wide text-[0.65rem]">Documentaries Watched</span>
                <span className="font-semibold text-white">{statsLoading ? '...' : (stats.documentaries ?? 0)}</span>
              </div>
            </div>

          </div>
        </section>

        <div className="h-px bg-[#111] my-2 rounded-full" />

        {/* Preferences Section - editable */}
        <section className="border border-[#222] rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#222]">
            <h3 className="text-sm font-extrabold">Preferences</h3>
            {isViewingOwnProfile && (
              <button className="text-xs px-3 py-1 rounded-full border border-[#076452] text-[#76f5d2] hover:bg-[#076452]/10" onClick={() => setIsEditingPreferences(v => !v)}>{isEditingPreferences ? 'Done' : 'Edit Preferences'}</button>
            )}
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-bold">Genres</h4>
              {!isEditingPreferences && (
                <div className="flex flex-wrap gap-2">{genres.length ? genres.map(g => (<span key={g} className="inline-flex items-center gap-1 bg-[#076452]/10 border border-[#076452] text-white px-3 py-1 rounded-full text-xs font-medium"><span>{genreIcon(g)}</span>{g}</span>)) : <span className="text-[#666] italic text-sm">No genres selected</span>}</div>
              )}
              {isEditingPreferences && (
                <div className="flex flex-wrap gap-2 text-xs">{['Action & Adventure','Comedy','Drama','Horror','Romance','Sci-Fi','Documentary','Animation','Fantasy','Music','Musical'].map(g => { const active = genres.includes(g); return (<button key={g} type="button" onClick={() => { setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]); }} className={`px-3 py-1 rounded-full border text-xs ${active ? 'bg-[#076452] border-[#076452] text-white' : 'border-[#333] text-[#ccc] hover:border-[#076452]'}`}>{g}</button>); })}</div>
              )}
            </div>
            <div className="space-y-3">
              <h4 className="font-bold">Content Type</h4>
              <div className="grid grid-cols-2 gap-3">
                {contentTypes.map(p => {
                  const active = startPref === p.id;
                  return (
                    <button key={p.id} type="button" disabled={!isViewingOwnProfile || !isEditingPreferences} onClick={() => isViewingOwnProfile && isEditingPreferences && setStartPref(p.id)} className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border transition text-center ${active ? 'bg-[#076452]/15 border-[#076452] shadow-[0_0_10px_#07645255]' : 'border-[#053c2f] hover:border-[#076452] hover:bg-[#076452]/10'}`}>
                      <p.Icon size={20} />
                      <span className="text-xs font-medium">{p.label}</span>
                    </button>
                  );
                })}
              </div>
              {isViewingOwnProfile && isEditingPreferences && (
                <div className="flex justify-end mt-3">
                  <button className="px-4 py-1.5 rounded-full bg-[#076452] text-xs font-semibold" type="button" onClick={async () => {
                    if (!currentUserId) return;
                    try {
                      const existingRes = await apiClient.get(`/users/${currentUserId}`);
                      const existing = existingRes.data || {};
                      const updated = { ...existing, preferences: { ...(existing.preferences || {}), genres, startPreference: startPref } };
                      await apiClient.put(`/users/${currentUserId}`, updated);
                      localStorage.setItem('app:userData', JSON.stringify(updated));
                      if (onUpdateProfile) onUpdateProfile(updated);
                      setIsEditingPreferences(false);
                    } catch (e) { console.error('Failed to save preferences', e); alert('Could not save preferences.'); }
                  }}>Save Preferences</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <nav className="flex border-b border-[#222] mt-2 mb-4" role="tablist" aria-label="Profile tabs">
          {tabs.map(t => (
            <button key={t} onClick={() => setSelectedTab(t)} role="tab" aria-selected={selectedTab === t} className={`relative flex-1 px-2 py-3 text-center font-semibold text-sm transition ${selectedTab === t ? 'text-white' : 'text-[#aaaaaa] hover:text-white'}`}>{t}{selectedTab === t && <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] bg-[#076452] rounded-full shadow-[0_0_8px_#07645280]" />}</button>
          ))}
        </nav>

        {/* Tab content */}
        <main className="mt-2 mb-12">
          <section className="mb-6">
            <h3 className="text-sm font-extrabold mb-3 pb-1 border-b border-[#222]">{selectedTab}</h3>
            {tabLoading && (<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, idx) => <TabSkeletonLoader key={idx} />)}</div>)}
            {tabError && !tabLoading && (<div className="text-center text-red-500 p-10 bg-red-800/20 rounded-lg"><strong>Error:</strong> {tabError}</div>)}
            {!tabLoading && !tabError && tabContent.length === 0 && (<div className="text-center text-gray-400 p-10">No {selectedTab.toLowerCase()} found yet.</div>)}

            {!tabLoading && !tabError && tabContent.length > 0 && selectedTab === 'Posts' && (
              <div className="grid gap-3">{tabContent.map((post) => (
                <article key={post.id} className="border border-[#053c2f] rounded-xl p-4 bg-black/60 hover:shadow-[0_0_12px_#07645250] transition">
                  <div className="flex items-center justify-between mb-2"><h4 className="font-bold">{post.title || post.name || post.id}</h4><div className="flex gap-4 text-xs text-[#aaaaaa]"><span>❤️ {post.likesCount ?? post.likes ?? 0}</span><span>💬 {post.commentsCount ?? post.comments ?? 0}</span></div></div>
                  <p className="text-sm text-[#aaaaaa]">{post.contentPreview ?? post.content ?? post.description ?? ''}</p>
                </article>
              ))}</div>
            )}

            {!tabLoading && !tabError && tabContent.length > 0 && selectedTab === 'Likes' && (
              <div className="grid gap-3">{tabContent.map((post) => (
                <article key={post.id} className="border border-[#053c2f] rounded-xl p-4 bg-black/60 hover:shadow-[0_0_12px_#07645250] transition">
                  <div className="flex items-center gap-3 mb-3"><img src={post.user?.avatar || '/src/assets/LOGO.png'} alt="avatar" className="w-10 h-10 rounded-full border-2 border-[#076452] object-cover" /><div className="flex flex-col flex-1"><span className="font-bold text-white text-sm">{post.user?.name || 'Unknown Creator'}</span>{post.time && <span className="text-[#aaa] text-xs">{post.time}</span>}</div></div>
                  <div className="flex items-center justify-between mb-2"><h4 className="font-bold">{post.title || post.name || post.id}</h4><div className="flex gap-4 text-xs text-[#aaaaaa]"><span>❤️ {post.likesCount ?? post.likes ?? 0}</span><span>💬 {post.commentsCount ?? post.comments ?? 0}</span></div></div>
                  <p className="text-sm text-[#aaaaaa]">{post.contentPreview ?? post.content ?? post.description ?? ''}</p>
                </article>
              ))}</div>
            )}
          </section>
        </main>

        {/* Followers/FOLLOWING Modals */}
        {showFollowers && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-50" role="dialog" aria-modal="true" onClick={() => setShowFollowers(false)}>
            <div className="w-[min(520px,92vw)] bg-[#0d0d0d] border border-[#222] rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]"><h4 className="font-semibold">Followers</h4><button onClick={() => setShowFollowers(false)} className="w-8 h-8 rounded-full border border-[#076452] text-[#076452] grid place-items-center hover:bg-[#076452]/10">✖</button></div>
              <div className="max-h-[60vh] overflow-auto p-3 grid gap-2">{followersLoading ? (<ModalSpinner />) : followersList.length === 0 ? (<div className="text-center p-8 text-gray-400">No followers found.</div>) : (followersList.map((entry) => { const uid = String(entry.followerId ?? entry.id ?? entry.userId ?? entry.followerId); const name = entry.username || entry.name || entry.fullName || entry.firstName || uid; const avatar = entry.avatarUrl || entry.profile?.profilePicture || 'https://placehold.co/40x40/777/FFF?text=U'; return (<div key={uid} className="flex items-center gap-3 px-3 py-2 bg-black border border-[#222] rounded-lg text-sm"><img src={avatar} alt="avatar" className="w-8 h-8 rounded-full bg-gray-700 object-cover" /><div className="flex flex-col"><span className="font-semibold">{name}</span>{entry.profile?.bio && <span className="text-xs text-[#999]">{entry.profile.bio}</span>}</div></div>); }))}</div>
            </div>
          </div>
        )}

        {showFollowing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-50" role="dialog" aria-modal="true" onClick={() => setShowFollowing(false)}>
            <div className="w-[min(520px,92vw)] bg-[#0d0d0d] border border-[#222] rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]"><h4 className="font-semibold">Following</h4><button onClick={() => setShowFollowing(false)} className="w-8 h-8 rounded-full border border-[#076452] text-[#076452] grid place-items-center hover:bg-[#076452]/10">✖</button></div>
              <div className="max-h-[60vh] overflow-auto p-3 grid gap-2">{followingLoading ? (<ModalSpinner />) : followingList.length === 0 ? (<div className="text-center p-8 text-gray-400">Not following anyone.</div>) : (() => { const map = new Map(); (followingList || []).forEach((entry) => { const key = String(entry.followingId ?? entry.id ?? entry.userId ?? entry.username ?? entry); if (!map.has(key)) map.set(key, entry); }); return Array.from(map.values()).map((entry) => { const key = String(entry.followingId ?? entry.id ?? entry.userId ?? entry.username ?? entry); const name = entry.username || entry.name || entry.fullName || entry.firstName || key; const avatar = entry.avatarUrl || entry.profile?.profilePicture || 'https://placehold.co/40x40/999/FFF?text=U'; const followingUserId = entry.followingId ?? entry.id ?? entry.userId; return (<div key={key} className="flex items-center justify-between gap-3 px-3 py-2 bg-black border border-[#222] rounded-lg text-sm hover:bg-[#1a1a1a] transition cursor-pointer" onClick={() => { if (followingUserId) { navigate(`/profile/${followingUserId}`); setShowFollowing(false); } }}><div className="flex items-center gap-3 flex-1"><img src={avatar} alt="avatar" className="w-8 h-8 rounded-full bg-gray-700 object-cover" /><div className="flex flex-col"><span className="font-semibold">{name}</span>{entry.profile?.bio && <span className="text-xs text-[#999]">{entry.profile.bio}</span>}</div></div>{isViewingOwnProfile && (<div onClick={(e) => e.stopPropagation()}><button onClick={() => unfollowUser(entry.followingId ?? entry.id ?? entry.userId ?? key)} className="px-3 py-1 rounded-full bg-[#170f0f] border border-[#663] text-[#f3f3f3] hover:bg-[#2a1a1a] text-sm">Unfollow</button></div>)}</div>); }) })()}</div>
            </div>
          </div>
        )}

      </div>
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

export default Profile;
