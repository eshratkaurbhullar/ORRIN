import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginCard from "../components/Auth/LoginCard.jsx";
import apiClient from '../api/axiosConfig';
export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const location = useLocation();
  const redirectTo = (() => {
    try {
      // Prefer router state.from (when Navigate passes the original location)
      if (location && location.state && location.state.from && location.state.from.pathname) {
        return location.state.from.pathname;
      }
      const params = new URLSearchParams(location.search || '');
      return params.get('redirect');
    } catch (e) { return null; }
  })();

  const handleUserLogin = async (loginData) => {
  setError(null); setIsSubmitting(true);
  try {
    // JSON Server: Find user(s) by email
    const response = await apiClient.get(`/users?email=${encodeURIComponent(loginData.email)}`);
  const users = response.data || [];
    // Find a user whose password matches. json-server may contain duplicates; accept any matching pair.
    const matched = users.find(u => String(u.password) === String(loginData.password));
    if (matched) {
      const user = matched;
      const fakeToken = 'json-server-token-' + user.id; // Create a fake token
      localStorage.setItem('authToken', fakeToken); // Store token (even though unused by JSON server)
      // credentials matched

      // Decide redirect: prefer explicit redirect (from query or state), otherwise
      // if the user has saved preferences send them to profile, else send to home.
      let preferredRedirect = redirectTo;
      try {
        if (!preferredRedirect) {
          const prefs = user.preferences;
          if (prefs && (Array.isArray(prefs.genres) ? prefs.genres.length > 0 : Object.keys(prefs).length > 0)) {
            preferredRedirect = '/profile';
          } else {
            preferredRedirect = '/home';
          }
        }
      } catch (e) { preferredRedirect = preferredRedirect || '/home'; }

      // Inform the app about successful login and include chosen redirect
      if (typeof onLoginSuccess === 'function') onLoginSuccess({ type: 'user', data: user, isNewUser: false, redirectTo: preferredRedirect });
    } else {
      // No matching user/password pair found
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    console.error("JSON Server Login Error:", err);
    setError("Invalid email or password."); // Set user-friendly error
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="flex min-h-screen">
      {/* Left side: Video */}
      <div className="w-1/2 relative">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/Login.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* Right side: Login card full height and width */}
      <div className="w-1/2 flex items-center justify-center bg-black">
        <LoginCard
          style={{ width: '100%', height: '100%' }}
          onSwitchToSignup={() => navigate('/signup')}
          onSubmit={handleUserLogin}
          isSubmitting={isSubmitting}
          apiError={error}
        />
      </div>
    </div>
  );
}
