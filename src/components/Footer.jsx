import { Link } from "react-router-dom";

export default function Footer({ isLoggedIn = false }) {
  const loggedOutLinks = [
    { name: "Manifesto", to: "/manifesto" },
    { name: "Login", to: "/login" },
    { name: "Signup", to: "/signup" },
  ];

  const loggedInLinks = [
    { name: "Home", to: "/home" },
    { name: "Explore", to: "/explore" },
    { name: "Journal", to: "/journal" },
    { name: "Posts", to: "/posts" },
    { name: "Settings", to: "/settings" },
  ];

  const usefulLinks = isLoggedIn ? loggedInLinks : loggedOutLinks;

  return (
    <footer className="relative bg-neutral-900 text-gray-300 py-12 pb-36 pl-20 pr-12 md:pl-36 md:pr-24 overflow-hidden min-h-[300px]">
      {/* Orrin watermark */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center pointer-events-none">
        <span className="text-[12rem] md:text-[18rem] henny-penny-regular text-white/50 tracking-wide select-none leading-none translate-y-1/2">
          orrin
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        {/* Quote */}
        <div>
          <p className="text-2xl md:text-3xl italic font-medium text-white/80 whitespace-nowrap">
            A place where stories find a home.
          </p>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 sm:flex sm:space-x-12 text-sm">
          {/* Useful */}
          <div className="sm:mr-6">
            <h3 className="font-bold mb-3">Useful</h3>
            <ul className="space-y-2">
              {usefulLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="sm:mx-20">
            <h3 className="font-bold mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                {/* FIXED: This now correctly routes to TermsAndConditions.jsx */}
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Updates */}
          <div>
            <h3 className="font-bold mb-3">Updates</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
