import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shuffle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import mediaData from "../data/mediaData";

const pickRandom = (arr) => {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};

export default function Home() {
  const posters = mediaData;
  const navigate = useNavigate();
  const iconRef = useRef(null);

  const handleLogout = () => {
    console.log("Logged out");
  };

  const handleClick = (id) => {
    navigate(`/media/${id}`);
  };

  const animateIcon = (deg = 720, duration = 700) => {
    if (!iconRef.current) return;
    iconRef.current.style.transition = `transform ${duration}ms cubic-bezier(.2,.9,.2,1)`;
    iconRef.current.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
      if (iconRef.current) iconRef.current.style.transform = "";
    }, duration);
  };

  const handleRandomPick = () => {
    animateIcon();
    const picked = pickRandom(posters);
    if (picked && picked.id) {
      // small delay so animation shows
      setTimeout(() => navigate(`/media/${picked.id}`), 250);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Floating random picker (left corner) */}
      <div className="fixed z-50 left-4 top-4 pointer-events-auto">
        <button
          ref={iconRef}
          onClick={handleRandomPick}
          title="Pick a random movie"
          className="w-12 h-12 rounded-full bg-[#076452] shadow-lg flex items-center justify-center hover:scale-[1.03] transition-transform"
          aria-label="Random pick"
        >
          <Shuffle size={18} className="text-white" />
        </button>
      </div>

      {/* Navbar */}
      <Navbar isLoggedIn={true} onLogout={handleLogout} />

      {/* Main content */}
      <main className="flex-grow px-16 py-16 mb-10 mt-10">
        <div className="flex flex-wrap justify-center gap-6">
          {posters.map((poster) => (
            <div
              key={poster.id}
              onClick={() => handleClick(poster.id)}
              className="cursor-pointer transform transition duration-300 hover:scale-105 border border-transparent hover:border-gray-300 rounded-lg overflow-hidden w-64"
            >
              <img
                src={poster.poster}
                alt={poster.title}
                className="w-full h-[384px] object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer isLoggedIn={true} />
    </div>
  );
}
