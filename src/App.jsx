import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ListsProvider } from "./pages/ListsContext";

// Pre-login pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Manifesto from "./pages/Manifesto";
import Onboarding from "./pages/Onboarding";

// Post-login pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Journal from "./pages/Journal";
import Lists from "./pages/Lists";
import Posts from "./pages/Posts";
import MediaInfo from "./pages/MediaInfo";
import ListDetails from "./pages/ListDetails";

// Legal pages
import TermsAndConditions from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Pages
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ScrollToTop from "./components/ScrollToTop";

import "./App.css";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem("app:isLoggedIn") === "true";
    } catch {
      return false;
    }
  });
  const [userData, setUserData] = useState(() => {
    try {
      const storedUser = localStorage.getItem("app:userData");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [postLoginRedirect, setPostLoginRedirect] = useState(null);

  // ⭐ UPDATED: Always send user to /home after login or signup
  const handleLoginSuccess = (loginResult) => {
    console.log("Login successful:", loginResult);

    setUserData(loginResult.data);
    setIsLoggedIn(true);

    try {
      localStorage.setItem("app:isLoggedIn", "true");
      localStorage.setItem("app:userData", JSON.stringify(loginResult.data));
    } catch {}

    // ⭐ Immediately navigate to /home
    navigate("/home", { replace: true });
  };

  useEffect(() => {
    if (isLoggedIn && postLoginRedirect) {
      navigate(postLoginRedirect, { replace: true });
      setPostLoginRedirect(null);
    }
  }, [isLoggedIn, postLoginRedirect, navigate]);

  const handleUpdateProfile = (updatedData) => {
    setUserData((prev) => ({
      ...prev,
      ...updatedData,
    }));
    try {
      const merged = { ...(userData || {}), ...updatedData };
      localStorage.setItem("app:userData", JSON.stringify(merged));
    } catch {}
    console.log("Profile updated:", updatedData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    try {
      localStorage.removeItem("app:isLoggedIn");
      localStorage.removeItem("app:userData");
    } catch {}
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    try {
      localStorage.setItem("app:isLoggedIn", isLoggedIn ? "true" : "false");
      if (userData) localStorage.setItem("app:userData", JSON.stringify(userData));
      else localStorage.removeItem("app:userData");
    } catch {}
  }, [isLoggedIn, userData]);

  return (
    <ListsProvider>
      <div className="App">
        <ScrollToTop behavior="auto" />
        <Routes>
          {/* Pre-login routes */}
          <Route path="/" element={<Landing onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/manifesto" element={<Manifesto />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<Signup onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/onboarding" element={<Onboarding onLoginSuccess={handleLoginSuccess} />} />

          {/* Legal pages */}
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Post-login routes */}
          <Route
            path="/home"
            element={isLoggedIn ? <Home /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/explore/*"
            element={isLoggedIn ? <Explore /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/journal"
            element={isLoggedIn ? <Journal /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/lists"
            element={isLoggedIn ? <Lists /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/lists/:mediaType/:listType/:listName"
            element={isLoggedIn ? <ListDetails /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/posts"
            element={isLoggedIn ? <Posts /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/media/:id"
            element={isLoggedIn ? <MediaInfo /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/settings"
            element={isLoggedIn ? <Settings /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/profile"
            element={
              isLoggedIn ? (
                <Profile userData={userData} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/profile/:userId"
            element={
              isLoggedIn ? (
                <Profile userData={userData} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" state={{ from: location }} replace />
              )
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<h1 className="text-center text-emerald-500 mt-20">404 Page Not Found</h1>} />
        </Routes>
      </div>
    </ListsProvider>
  );
}

export default App;
