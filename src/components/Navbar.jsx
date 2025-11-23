import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, User } from "lucide-react";

export default function Navbar({ isLoggedIn = false, onLogout = () => {} }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // mobile main menu
  const [dropdownOpen, setDropdownOpen] = useState(null); // desktop dropdown
  const [mobileSubs, setMobileSubs] = useState({ explore: false, lists: false }); // mobile nested toggles
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileSub = (key) =>
    setMobileSubs((s) => ({ ...s, [key]: !s[key] }));

  const isActive = (path) => location.pathname === path;

  // central logout handler used everywhere in this component
  const doLogout = () => {
    try {
      // call the parent's logout handler (App's handleLogout)
      onLogout();
    } catch (err) {
      // fallback: clear local storage if parent's handler isn't provided
      try {
        localStorage.removeItem("app:isLoggedIn");
        localStorage.removeItem("app:userData");
      } catch {}
    }
    // navigate to login page after logout
    navigate("/login", { replace: true });
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-2000
                  transition-all duration-300 px-5 py-2 rounded-3xl
                  flex items-center gap-2
                  bg-transparent backdrop-blur-md`}
      style={{
        backgroundColor: scrolled
          ? "rgba(10,12,20,0.85)"
          : "rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo */}
      <Link
        to={isLoggedIn ? "/home" : "/"} /* Link logo to home page */
        className="text-3xl font-black text-[#076452] henny-penny-regular"
      >
        orrin
      </Link>

      {/* Desktop menu */}
      <div className="hidden md:flex md:flex-row md:items-center md:gap-4 ml-4">
        {!isLoggedIn ? (
          <>
            <NavLink
              to="/manifesto"
              label="Manifesto"
              isActive={isActive("/manifesto")}
            />

            <Link
              to="/login"
              className="relative w-24 py-1.5 text-center rounded-3xl font-semibold border border-white text-white ml-6
                         transition-all duration-300 hover:shadow-[0_0_28px_8px_rgba(7,100,82,0.8)]"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="relative w-24 py-1.5 text-center rounded-3xl font-semibold bg-white text-black
                         transition-all duration-300 hover:shadow-[0_0_28px_8px_rgba(7,100,82,0.8)]"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {/* Explore link */}
            <div
              className={`inline-block px-3 py-1.5 font-semibold transition-all duration-200
                          text-white hover:-translate-y-1 active:-translate-y-1
                          ${isActive("/explore") ? "border-b-2 border-[#076452]" : ""}`}
            >
              <Link to="/explore">Explore</Link>
            </div>

            {/* Lists link */}
            <div
              className={`inline-block px-3 py-1.5 font-semibold transition-all duration-200
                          text-white hover:-translate-y-1 active:-translate-y-1
                          ${isActive("/lists") ? "border-b-2 border-[#076452]" : ""}`}
            >
              <Link to="/lists">Lists</Link>
            </div>

            <NavLink
              to="/journal"
              label="Journal"
              isActive={isActive("/journal")}
            />
            <NavLink
              to="/posts"
              label="Posts"
              isActive={isActive("/posts")}
            />

            {/* Profile */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="ml-6 w-10 h-10 flex items-center justify-center rounded-full bg-white text-black font-bold"
                >
                  <User size={18} />
                </Link>
                <ChevronDown
                  size={14}
                  className="cursor-pointer"
                  onClick={() => setDropdownOpen(dropdownOpen === "profile" ? null : "profile")}
                />
              </div>

              {dropdownOpen === "profile" && (
                <div
                  className="absolute bottom-0 translate-y-full bg-black/90 rounded-xl shadow-lg p-2 w-40 z-[9999]"
                  onMouseLeave={() => setDropdownOpen(null)}
                >
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-white hover:bg-white/10 rounded-md"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-3 py-2 text-white hover:bg-white/10 rounded-md"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(null);
                      doLogout(); // use centralized logout
                    }}
                    className="block w-full text-left px-3 py-2 text-white hover:bg-red-600 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden text-gray-200 focus:outline-none ml-auto"
        onClick={() => setMenuOpen((s) => !s)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[90%] bg-black/90 backdrop-blur-md rounded-3xl flex flex-col items-stretch gap-2 p-4 md:hidden z-40">
          {!isLoggedIn ? (
            <>
              <Link
                to="/manifesto"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center px-3 py-2 rounded-3xl font-semibold text-white hover:bg-white/10"
              >
                Manifesto
              </Link>
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center px-3 py-2 rounded-3xl font-semibold text-white hover:bg-white/10"
              >
                Contact
              </Link>

              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full py-2 text-center rounded-3xl font-semibold border border-white text-white"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="w-full py-2 text-center rounded-3xl font-semibold bg-white text-black"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/home"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center px-3 py-2 rounded-3xl font-semibold text-white hover:bg-white/10"
              >
                Home
              </Link>

              {/* Mobile Explore */}
              <div>
                <button
                  onClick={() => toggleMobileSub("explore")}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-3xl font-semibold text-white hover:bg-white/10"
                >
                  <span>Explore</span>
                  <ChevronDown
                    size={16}
                    className={`${
                      mobileSubs.explore ? "rotate-180" : "rotate-0"
                    } transition`}
                  />
                </button>
                {mobileSubs.explore && (
                  <div className="mt-2 space-y-1 pl-4">
                    {exploreItems.map((i) => (
                      <Link
                        key={i.to}
                        to={i.to}
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-white hover:bg-white/10"
                      >
                        {i.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Lists */}
              <div>
                <button
                  onClick={() => toggleMobileSub("lists")}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-3xl font-semibold text-white hover:bg-white/10"
                >
                  <span>Lists</span>
                  <ChevronDown
                    size={16}
                    className={`${
                      mobileSubs.lists ? "rotate-180" : "rotate-0"
                    } transition`}
                  />
                </button>
                {mobileSubs.lists && (
                  <div className="mt-2 space-y-1 pl-4">
                    {listItems.map((i) => (
                      <Link
                        key={i.to}
                        to={i.to}
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-white hover:bg-white/10"
                      >
                        {i.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/journal"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center px-3 py-2 rounded-3xl font-semibold text-white hover:bg-white/10"
              >
                Journal
              </Link>
              <Link
                to="/posts"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center px-3 py-2 rounded-3xl font-semibold text-white hover:bg-white/10"
              >
                Posts
              </Link>

              <div className="border-t border-white/10 pt-2 mt-2">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-white hover:bg-white/10 rounded-md"
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-white hover:bg-white/10 rounded-md"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    doLogout(); // centralized logout for mobile too
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-white hover:bg-red-600 rounded-md"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, label, isActive }) {
  return (
    <Link
      to={to}
      className={`inline-block px-3 py-1.5 font-semibold transition-all duration-200
                  text-white hover:-translate-y-1 active:-translate-y-1
                  ${isActive ? "border-b-2 border-[#076452]" : ""}`}
    >
      {label}
    </Link>
  );
}

// NOTE: exploreItems and listItems must be defined or imported in your file.
// If they were previously declared elsewhere, re-add them above this export.
// Example placeholders if you need them:
const exploreItems = [
  { name: "Trending", to: "/explore/trending" },
  { name: "Genres", to: "/explore/genres" },
];
const listItems = [
  { name: "Favorites", to: "/lists/favorites" },
  { name: "Watch Later", to: "/lists/watch-later" },
];
