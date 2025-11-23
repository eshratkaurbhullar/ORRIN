import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import apiClient from '../api/axiosConfig';

const Posts = () => {
  const [activeTab, setActiveTab] = useState("for-you");
  const [posts, setPosts] = useState([]);
  const [usersMap, setUsersMap] = useState({}); // userId -> { name, avatar }
  const [followingIds, setFollowingIds] = useState(new Set());
  const [liked, setLiked] = useState({}); // { [postId]: true }
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5); // how many posts we show
  const [showComments, setShowComments] = useState({}); // { [postId]: true }
  const [comments, setComments] = useState({}); // { [postId]: [comments] }
  const [newComment, setNewComment] = useState({}); // { [postId]: text }

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('app:userData') || 'null'); } catch { return null; }
  })();

  // Keep a ref of posts to compare newest id inside poll without recreating interval
  const postsRef = React.useRef(posts);
  useEffect(() => { postsRef.current = posts; }, [posts]);

  // Fetch posts, users and following list from json-server
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [postsRes, usersRes] = await Promise.all([
          apiClient.get('/postsApi'),
          apiClient.get('/users')
        ]);
        if (!mounted) return;
        const postsData = postsRes.data || [];
        const users = usersRes.data || [];
        const map = {};
        // Build lookup maps by id, username and email to handle various shapes
        const usersByKey = new Map();
        users.forEach(u => {
          const keyId = u.id != null ? String(u.id) : null;
          const keyUsername = u.username ? String(u.username) : null;
          const keyEmail = u.email ? String(u.email) : null;
          const display = { id: u.id, name: u.username || u.fullName || u.firstName || u.email, avatar: u.profile?.profilePicture || '/src/assets/LOGO.png' };
          if (keyId) usersByKey.set(keyId, display);
          if (keyUsername) usersByKey.set(keyUsername, display);
          if (keyEmail) usersByKey.set(keyEmail, display);
          // also place into simple map for any direct key lookups elsewhere
          map[keyId || keyUsername || keyEmail] = display;
        });
        setUsersMap(map);

        // Determine following IDs for current user
        let followingSet = new Set();
        if (currentUser && currentUser.id) {
          try {
            const fRes = await apiClient.get(`/following?userId=${currentUser.id}`);
            const fList = fRes.data || [];
            fList.forEach(f => followingSet.add(String(f.followingId)));
          } catch (e) {
            console.warn('Could not fetch following list', e);
          }
        }
        setFollowingIds(followingSet);

        // Load existing likes for current user
        if (currentUser && currentUser.id) {
          try {
            const likesRes = await apiClient.get(`/likes?userId=${currentUser.id}`);
            const likesList = Array.isArray(likesRes.data) ? likesRes.data : (likesRes.data ? [likesRes.data] : []);
            const likedMap = {};
            likesList.forEach(like => {
              if (like.postId) {
                likedMap[like.postId] = true;
              }
            });
            setLiked(likedMap);
          } catch (e) {
            console.warn('Could not fetch likes', e);
          }
        }

        // Map posts to include user info and isFollowing
        const enriched = postsData.map(p => {
          const key = p.userId != null ? String(p.userId) : null;
          const userDisplay = (key && usersByKey.get(key)) || null;
          // fallback: try to find by matching common fields
          let userInfo = userDisplay;
          if (!userInfo) {
            const found = users.find(u => String(u.username) === key || String(u.email) === key || String(u.id) === key);
            if (found) userInfo = { id: found.id, name: found.username || found.fullName || found.firstName || found.email, avatar: found.profile?.profilePicture || '/src/assets/LOGO.png' };
          }
          return {
            ...p,
            user: userInfo || { id: p.userId, name: 'Unknown Creator', avatar: '/src/assets/LOGO.png' },
            isFollowing: followingSet.has(String(p.userId)),
          };
        });
        setPosts(enriched.reverse()); // show newest first if id is incremental
      } catch (err) {
        console.error('Error loading posts/users:', err);
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Poll for new posts so other users' posts appear without a full manual refresh
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const postsRes = await apiClient.get('/postsApi');
        const postsData = postsRes.data || [];
        // Map user info from usersMap; if missing, leave fallback
        const enriched = postsData.map(p => {
          const key = p.userId != null ? String(p.userId) : null;
          const userDisplay = (key && usersMap[key]) || { id: p.userId, name: String(p.userId), avatar: '/src/assets/LOGO.png' };
          return { ...p, user: userDisplay, isFollowing: followingIds.has(String(p.userId)) };
        }).reverse();

        const newestId = enriched[0]?.id;
        const currentNewest = postsRef.current?.[0]?.id;
        if (String(newestId) !== String(currentNewest)) {
          if (!cancelled) setPosts(enriched);
        }
      } catch (err) {
        // polling should not crash the app
        console.warn('Polling error:', err);
      }
    };

    const id = setInterval(poll, 8000);
    // run immediately once
    poll();
    return () => { cancelled = true; clearInterval(id); };
  }, [usersMap, followingIds]);

  const visibleSource = activeTab === "following" ? posts.filter((p) => p.isFollowing) : posts;
  const visiblePosts = visibleSource.slice(0, visibleCount);

  useEffect(() => {
    // Reset how many posts are visible whenever tab changes or posts list changes
    setVisibleCount(5);
  }, [activeTab, posts.length]);

  // Helper to refresh a post from server and update local state, then broadcast
  const refreshPost = async (postId) => {
    try {
      const res = await apiClient.get(`/postsApi/${postId}`);
      const fresh = res.data || {};
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: fresh.likesCount ?? p.likesCount, commentsCount: fresh.commentsCount ?? p.commentsCount } : p));
      try { window.dispatchEvent(new CustomEvent('postUpdated', { detail: { postId } })); } catch {}
    } catch (e) {
      console.warn('Could not refresh post', postId, e);
    }
  };

  const toggleLike = async (postId) => {
    if (!currentUser || !currentUser.id) {
      alert('You must be logged in to like posts.');
      return;
    }

    const isCurrentlyLiked = liked[postId];
    const post = posts.find(p => p.id === postId);
    const currentLikesCount = post?.likesCount ?? 0;
    
    // Optimistically update UI
    setLiked((prev) => ({ ...prev, [postId]: !isCurrentlyLiked }));
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, likesCount: currentLikesCount + (isCurrentlyLiked ? -1 : 1) }
        : p
    ));

    try {
      if (isCurrentlyLiked) {
        // Unlike: find and delete the like record
        try {
          const likesRes = await apiClient.get(`/likes?userId=${currentUser.id}&postId=${postId}`);
          const likesList = Array.isArray(likesRes.data) ? likesRes.data : (likesRes.data ? [likesRes.data] : []);
          // Delete all matching like records
          await Promise.all(likesList.map(like => apiClient.delete(`/likes/${like.id}`)));
          
          // Update post likesCount in database
          try {
            await apiClient.patch(`/postsApi/${postId}`, {
              likesCount: Math.max(0, currentLikesCount - 1)
            });
          } catch (e) {
            console.warn('Could not update post likes count:', e);
          }
        } catch (err) {
          console.error('Error unliking post:', err);
          // Revert optimistic update on error
          setLiked((prev) => ({ ...prev, [postId]: true }));
          setPosts(prev => prev.map(p => 
            p.id === postId ? { ...p, likesCount: currentLikesCount } : p
          ));
        }
      } else {
        // Like: create a new like record
        try {
          await apiClient.post('/likes', {
            userId: currentUser.id,
            postId: postId
          });
          
          // Update post likesCount in database
          try {
            await apiClient.patch(`/postsApi/${postId}`, {
              likesCount: currentLikesCount + 1
            });
          } catch (e) {
            console.warn('Could not update post likes count:', e);
          }
        } catch (err) {
          console.error('Error liking post:', err);
          // Revert optimistic update on error
          setLiked((prev) => ({ ...prev, [postId]: false }));
          setPosts(prev => prev.map(p => 
            p.id === postId ? { ...p, likesCount: currentLikesCount } : p
          ));
        }
      }
      
      // Notify profile page to refresh and also refresh this specific post
      try { window.dispatchEvent(new CustomEvent('postLiked', { detail: { postId } })); } catch {}
      await refreshPost(postId);
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert optimistic update on error
      setLiked((prev) => ({ ...prev, [postId]: isCurrentlyLiked }));
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likesCount: currentLikesCount } : p
      ));
    }
  };

  // Comment handlers
  const handleCommentClick = (post) => {
    setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }));
    // Load comments if not already loaded
    if (!comments[post.id] && !showComments[post.id]) {
      loadComments(post.id);
    }
  };

  const loadComments = async (postId) => {
    try {
      const response = await apiClient.get(`/comments?postId=${postId}`);
      const commentsList = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      // Fetch user info for each comment
      const commentsWithUsers = await Promise.all(commentsList.map(async (comment) => {
        try {
          const userRes = await apiClient.get(`/users/${comment.userId}`);
          const user = userRes.data;
          return {
            ...comment,
            user: {
              id: user.id,
              name: user.username || user.fullName || user.firstName || user.email || 'Unknown',
              avatar: user.profile?.profilePicture || '/src/assets/LOGO.png'
            }
          };
        } catch (e) {
          return {
            ...comment,
            user: {
              id: comment.userId,
              name: 'Unknown',
              avatar: '/src/assets/LOGO.png'
            }
          };
        }
      }));
      setComments(prev => ({ ...prev, [postId]: commentsWithUsers }));
    } catch (err) {
      console.error('Error loading comments:', err);
      setComments(prev => ({ ...prev, [postId]: [] }));
    }
  };

  const handleAddComment = async (postId) => {
    if (!currentUser || !currentUser.id) {
      alert('You must be logged in to comment.');
      return;
    }

    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    try {
      const commentPayload = {
        postId: postId,
        userId: currentUser.id,
        content: commentText,
        time: 'Just now'
      };
      const response = await apiClient.post('/comments', commentPayload);
      const createdComment = response.data;
      
      // Add user info to comment
      const userInfo = {
        id: currentUser.id,
        name: currentUser.username || currentUser.firstName || currentUser.email || 'You',
        avatar: currentUser.profile?.profilePicture || '/src/assets/LOGO.png'
      };
      
      const commentWithUser = { ...createdComment, user: userInfo };
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), commentWithUser]
      }));
      
      // Update post commentsCount
      const post = posts.find(p => p.id === postId);
      const newCount = (post?.commentsCount ?? 0) + 1;
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, commentsCount: newCount } : p
      ));
      
      // Update in database
      try {
        await apiClient.patch(`/postsApi/${postId}`, {
          commentsCount: newCount
        });
      } catch (e) {
        console.warn('Could not update post comments count:', e);
      }
      
      // Clear comment input
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      
      // Notify profile page to refresh
      try { window.dispatchEvent(new CustomEvent('postCommented', { detail: { postId } })); } catch {}
      await refreshPost(postId);
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Could not add comment. Try again.');
    }
  };

  // Share handler
  const handleShare = async (post) => {
    const postUrl = `${window.location.origin}/posts#post-${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Check out this post',
          text: post.contentPreview || post.content || '',
          url: postUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback to copy
          copyToClipboard(postUrl);
        }
      }
    } else {
      // Fallback to copy to clipboard
      copyToClipboard(postUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Link copied to clipboard!');
      } catch (err) {
        alert('Could not copy link. Please copy manually: ' + text);
      }
      document.body.removeChild(textArea);
    });
  };

  // Follow handler: create /following and /followers entries and update UI
  const handleFollow = async (post) => {
    if (!currentUser || !currentUser.id) return alert('You must be logged in to follow creators.');
    const targetUserId = post.user.id || post.userId;
    try {
      // POST to /following for current user
      const followPayload = {
        userId: currentUser.id,
        followingId: targetUserId,
        username: post.user.name,
        avatarUrl: post.user.avatar
      };
      await apiClient.post('/following', followPayload);

      // Also add a follower record for the target user (so their followers list can be fetched)
      const followerPayload = {
        userId: targetUserId,
        followerId: currentUser.id,
        username: currentUser.username || currentUser.firstName || currentUser.email,
        avatarUrl: currentUser.profile?.profilePicture || null
      };
      try { await apiClient.post('/followers', followerPayload); } catch (e) { console.warn('Could not create follower record:', e); }

      // Update local state so button disappears on ALL posts by this user and post shows in following tab
      setPosts(prev => prev.map(p => (String(p.user?.id || p.userId) === String(targetUserId) ? { ...p, isFollowing: true } : p)));
      setFollowingIds(prev => new Set(Array.from(prev).concat(String(targetUserId))));
      // Also increment profileStats counts for both users (best-effort)
      try {
        // currentUser: increment 'following'
        await incrementProfileStat(currentUser.id, 'following', 1);
        // target user: increment 'followers'
        await incrementProfileStat(targetUserId, 'followers', 1);
        // Notify other parts of the app that profile stats changed for both users
        try {
          window.dispatchEvent(new CustomEvent('profileStatsUpdated', { detail: { userId: currentUser.id } }));
          window.dispatchEvent(new CustomEvent('profileStatsUpdated', { detail: { userId: targetUserId } }));
          window.dispatchEvent(new CustomEvent('followListChanged', { detail: { userId: currentUser.id, targetUserId, action: 'follow' } }));
        } catch (e) { /* ignore in older browsers */ }
      } catch (e) { console.warn('ProfileStats increment failed', e); }
    } catch (err) {
      console.error('Follow error:', err);
      alert('Could not follow. Try again.');
    }
  };

  // Unfollow handler: remove /following and /followers entries and update UI
  const handleUnfollow = async (post) => {
    if (!currentUser || !currentUser.id) return alert('You must be logged in to unfollow creators.');
    const targetUserId = post.user.id || post.userId;
    try {
      // Find matching following records for current user -> target
      const fRes = await apiClient.get(`/following?userId=${currentUser.id}&followingId=${targetUserId}`);
      const followRecords = fRes.data || [];
      // Delete each following record
      await Promise.all(followRecords.map(rec => apiClient.delete(`/following/${rec.id}`)));

      // Find matching follower records for target user -> current
      try {
        const frRes = await apiClient.get(`/followers?userId=${targetUserId}&followerId=${currentUser.id}`);
        const followerRecords = frRes.data || [];
        await Promise.all(followerRecords.map(rec => apiClient.delete(`/followers/${rec.id}`)));
      } catch (e) {
        // Non-critical: continue even if follower records not present
        console.warn('Could not remove follower records:', e);
      }

      // Update local UI state for ALL posts by this user
      setPosts(prev => prev.map(p => (String(p.user?.id || p.userId) === String(targetUserId) ? { ...p, isFollowing: false } : p)));
      setFollowingIds(prev => {
        const s = new Set(Array.from(prev).filter(x => String(x) !== String(targetUserId)));
        return s;
      });

      // Decrement profileStats counts for both users (best-effort)
      try {
        await incrementProfileStat(currentUser.id, 'following', -1);
        await incrementProfileStat(targetUserId, 'followers', -1);
        // Notify other parts of the app that profile stats changed for both users
        try {
          window.dispatchEvent(new CustomEvent('profileStatsUpdated', { detail: { userId: currentUser.id } }));
          window.dispatchEvent(new CustomEvent('profileStatsUpdated', { detail: { userId: targetUserId } }));
          window.dispatchEvent(new CustomEvent('followListChanged', { detail: { userId: currentUser.id, targetUserId, action: 'unfollow' } }));
        } catch (e) { /* ignore in older browsers */ }
      } catch (e) { console.warn('ProfileStats decrement failed', e); }

    } catch (err) {
      console.error('Unfollow error:', err);
      alert('Could not unfollow. Try again.');
    }
  };

  // Helper: increment a numeric field under profileStats.social (best-effort)
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

  // Listen to post updates from anywhere and refresh this list's copy
  useEffect(() => {
    const handler = async (e) => {
      const id = e?.detail?.postId;
      if (!id) return;
      await refreshPost(id);
    };
    window.addEventListener('postLiked', handler);
    window.addEventListener('postCommented', handler);
    window.addEventListener('postUpdated', handler);
    return () => {
      window.removeEventListener('postLiked', handler);
      window.removeEventListener('postCommented', handler);
      window.removeEventListener('postUpdated', handler);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white font-sans">
        <Navbar isLoggedIn={true} />
        <div className="flex-grow grid place-items-center">Loading posts...</div>
        <Footer isLoggedIn={true} />
      </div>
    );
  }

  return (
  <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      {/* Navbar */}
      <Navbar isLoggedIn={true} />

      {/* Content */}
  <div className="flex-grow mt-6 mb-6 flex flex-col items-center">
        {/* Tabs */}
        <div className="fixed top-[70px] w-[80vw] max-w-[820px] flex items-center justify-between mt-4 bg-[#0f0f0f] border border-[#222] rounded-2xl overflow-hidden z-[100] text-sm font-semibold">
          {[
            { key: 'for-you', label: 'For you' },
            { key: 'following', label: 'Following' }
          ].map(t => (
            <button key={t.key} onClick={()=>setActiveTab(t.key)}
              className={`flex-1 py-3 text-center transition relative ${activeTab===t.key ? 'text-white bg-gradient-to-r from-[#3ba55d1f] to-transparent' : 'text-[#bdbdbd] hover:text-white'}`}>{t.label}</button>
          ))}
        </div>

        {/* Posts list */}
        <div className="w-[80vw] max-w-[820px] flex flex-col gap-7 mt-[120px]">
          {visiblePosts.length === 0 ? (
            <div className="bg-[#131313] border border-[#222] p-7 rounded-xl text-center text-[#d0d0d0]">
              <h3 className="text-white font-bold mb-2">No posts from people you follow yet</h3>
              <p className="text-[#aaa] m-0">Follow some creators to see their posts here.</p>
            </div>
          ) : (
            visiblePosts.map((post) => (
              <div key={post.id} className="bg-[#111] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.1)] flex flex-col gap-3 border border-[#222]">
                <div className="flex items-center gap-4 mb-1">
                  <img
                    src={post.user.avatar || '/src/assets/LOGO.png'}
                    alt="avatar"
                    className="w-11 h-11 rounded-full border-2 border-[#076452] object-cover"
                  />
                  <div className="flex flex-col flex-1 leading-tight">
                    <span className="font-bold text-white text-base">{post.user.name}</span>
                    <span className="text-[#aaa] text-xs">{post.time || ''}</span>
                  </div>
                  {post.user.id !== (currentUser && currentUser.id) && (
                    !post.isFollowing ? (
                      <button onClick={() => handleFollow(post)} className="bg-gradient-to-r from-[#076452] to-[#1a1a1a] text-white rounded-full px-5 py-2 font-semibold text-sm shadow-[0_2px_8px_rgba(7,100,82,0.15)] hover:from-[#076452] hover:to-[#076452] transition">Follow +</button>
                    ) : (
                      <button onClick={() => handleUnfollow(post)} className="bg-[#0b0b0b] text-[#9ee1b9] rounded-full px-5 py-2 font-semibold text-sm border border-[#063f2a] hover:bg-[#170f0f] hover:text-white transition">Unfollow</button>
                    )
                  )}
                </div>
                <div>
                  <div className="text-white text-[1.05rem] font-bold mb-1">{post.title || post.title}</div>
                  <div className="text-[#e0e0e0] text-sm leading-relaxed">{post.contentPreview ?? post.content}</div>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[0.7rem] font-semibold transition ${liked[post.id] ? 'bg-[#076452]/15 border-[#076452] text-[#076452] shadow-[0_0_0_1px_rgba(7,100,82,0.25),0_4px_12px_-2px_rgba(0,0,0,0.6)]' : 'border-[#222] text-[#b5b5b5] hover:bg-[#1d1d1d] hover:border-[#2c2c2c] hover:text-white'}`}
                    onClick={() => toggleLike(post.id)}
                    aria-label={liked[post.id] ? 'Unlike' : 'Like'}
                  >
                    <Heart size={18} strokeWidth={liked[post.id] ? 2.4 : 2} fill={liked[post.id] ? '#3BA55D' : 'none'} />
                    <span className="font-semibold">{post.likesCount ?? post.likes ?? 0}</span>
                  </button>
                  <button 
                    onClick={() => handleCommentClick(post)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#222] text-[#b5b5b5] text-[0.7rem] font-semibold transition hover:bg-[#1d1d1d] hover:border-[#2c2c2c] hover:text-white" 
                    aria-label="Comments"
                  >
                    <MessageCircle size={18} />
                    <span className="font-semibold">{post.commentsCount ?? post.comments ?? 0}</span>
                  </button>
                  <button 
                    onClick={() => handleShare(post)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#222] text-[#b5b5b5] text-[0.7rem] font-semibold transition hover:bg-[#1d1d1d] hover:border-[#2c2c2c] hover:text-white" 
                    aria-label="Share"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
                {post.logo && (
                  <div className="mt-2 flex justify-center">
                    <img src={post.logo} alt="post visual" className="w-40 h-40 object-cover rounded-xl" />
                  </div>
                )}
                
                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-[#222]">
                    {/* Comments List */}
                    <div className="mb-4 space-y-3 max-h-64 overflow-y-auto">
                      {comments[post.id] && comments[post.id].length > 0 ? (
                        comments[post.id].map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <img
                              src={comment.user?.avatar || '/src/assets/LOGO.png'}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="bg-[#1a1a1a] rounded-lg p-2">
                                <span className="font-semibold text-sm text-white">{comment.user?.name || 'Unknown'}</span>
                                <p className="text-sm text-[#e0e0e0] mt-1">{comment.content}</p>
                              </div>
                              <span className="text-xs text-[#aaa] ml-2">{comment.time || ''}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[#aaa] text-center py-2">No comments yet. Be the first to comment!</p>
                      )}
                    </div>
                    
                    {/* Add Comment Input */}
                    <div className="flex gap-2">
                      <img
                        src={currentUser?.profile?.profilePicture || '/src/assets/LOGO.png'}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          className="flex-1 bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder-[#aaa] focus:outline-none focus:border-[#076452]"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 py-2 bg-[#076452] text-white rounded-lg text-sm font-semibold hover:bg-[#065a47] transition"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {/* Load more pagination: show a few posts, then reveal more on click */}
          {visibleCount < visibleSource.length && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setVisibleCount(count => Math.min(count + 5, visibleSource.length))}
                className="px-6 py-2 rounded-full bg-[#076452] text-sm font-semibold hover:bg-[#065a47] transition"
              >
                Load more
              </button>
            </div>
          )}
        </div>

        {/* Floating add button (bottom-right) */}
        <button
          className="fixed right-[140px] bottom-9 w-16 h-16 rounded-full bg-gradient-to-r from-[#076452] to-[#22b25a] text-black text-3xl grid place-items-center border-0 shadow-[0_12px_30px_rgba(7,100,82,0.18)] cursor-pointer z-50"
      onClick={async () => {
        const title = window.prompt("Post title");
        if (!title) return;
        const content = window.prompt("Post content");
                // Persist the post to json-server so other users will see it
                const postPayload = {
                  id: Date.now(),
                  userId: currentUser?.id || 'anonymous',
                  title,
                  contentPreview: content || '',
                  likesCount: 0,
                  commentsCount: 0,
                  time: 'Just now',
                  logo: null
                };
                try {
                  const resp = await apiClient.post('/postsApi', postPayload);
                  const created = resp.data;
                  // Build user object for immediate UI show
                  const userDisplay = usersMap[String(currentUser?.id)] || { id: currentUser?.id, name: currentUser?.username || currentUser?.firstName || 'You', avatar: currentUser?.profile?.profilePicture || '/src/assets/LOGO.png' };
                  const uiPost = {
                    ...created,
                    user: userDisplay,
                    isFollowing: followingIds.has(String(currentUser?.id)),
                    title: created.title,
                    contentPreview: created.contentPreview || created.content || ''
                  };
                  setPosts((p) => [uiPost, ...p]);
                  setActiveTab('for-you');
                } catch (err) {
                  console.error('Could not create post on server, falling back to local:', err);
                  const newPost = {
                    id: Date.now(),
                    user: { name: currentUser?.username || currentUser?.firstName || 'User', avatar: currentUser?.profile?.profilePicture || '/src/assets/LOGO.png' },
                    time: 'Just now',
                    title,
                    contentPreview: content || '',
                    likesCount: 0,
                    commentsCount: 0,
                    isFollowing: false,
                    logo: null,
                  };
                  setPosts((p) => [newPost, ...p]);
                }
          }}
          aria-label="Create post"
  >+</button>
      </div>

      {/* Footer */}
      <Footer isLoggedIn={true} />
    </div>
  );
};

export default Posts;
