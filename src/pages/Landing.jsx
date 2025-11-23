import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const postersRow1 = [
  "https://images-cdn.ubuy.co.in/633fecfe68fadd58d9019759-poster-stop-online-kill-bill-volume-1.jpg",
  "https://m.media-amazon.com/images/M/MV5BZjQwYzBlYzUtZjhhOS00ZDQ0LWE0NzAtYTk4MjgzZTNkZWEzXkEyXkFqcGc@._V1_.jpg",
  "https://m.media-amazon.com/images/I/71EZSrFK4wL.jpg",
  "https://m.media-amazon.com/images/I/61t9ie31jgL._UF1000,1000_QL80_.jpg",
  "https://i.pinimg.com/736x/84/5a/a9/845aa96177760748558d40ba2e70ff9d.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUVNalDEI7RWCUSn92BtCjDSXP_oat3e6djoCJROT0x1WQ0OMO",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEWdb7xHroAv2mXn_5yZbv_BG4yJ19GLgosj1Ql2inyYgVXRZZGWvzqHQ1A_s85rNaT2sJ3Q",
  "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSKNpswCC_xbclCFv4fnLlSQilXvZRc4pdjs4qf57PwVJpR0K1Q",
  "https://image.tmdb.org/t/p/original/km9xno8aBrh6K9hnpSRz7lTQQi.jpg",
  "https://image.tmdb.org/t/p/original/y5GLqchkDSxkMTihFjzaiXAHyO.jpg",
];

const postersRow2 = [
  "https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p22802_p_v10_ak.jpg",
  "https://image.tmdb.org/t/p/original/m2qG7sOqhRCnKziyC72LQbzxnaU.jpg",
  "https://image.tmdb.org/t/p/original/7PFoyRv9dXn9Npv52RmqQenjEX5.jpg",
  "https://m.media-amazon.com/images/M/MV5BYzU2MWQ5NGQtYmNlMC00ZjJkLWJmODItZDM5MDM3YmUyMWJkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
  "https://m.media-amazon.com/images/M/MV5BODk2Nzg4OWYtODczMy00NWRkLTg5ODQtZTU1ZGRhMzRhZGZhXkEyXkFqcGc@._V1_.jpg",
  "https://m.media-amazon.com/images/M/MV5BOWQzM2U1MWItYjYwYy00NWE0LWJiODQtYzc4OGRkNTljYjQzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
  "https://m.media-amazon.com/images/M/MV5BZjgwNTdlNzUtYjBmNi00YWYyLTgwMjEtYTlmMDVmZWZhNTRlXkEyXkFqcGc@._V1_.jpg",
  "https://m.media-amazon.com/images/I/61eyyyGXMKL.jpg",
  "https://www.tallengestore.com/cdn/shop/products/PeakyBlinders-ThomasShelby-GarrisonBombing-NetflixTVShow-ArtPoster_a29a5be9-9611-43d9-b415-18655f60c629.jpg?v=1619864667",
  "https://m.media-amazon.com/images/M/MV5BMTU4NzA4MDEwNF5BMl5BanBnXkFtZTgwMTQxODYzNjM@._V1_FMjpg_UX1000_.jpg",
];

export default function Landing() {
  return (
    <div className="text-white">
      {/* Hero Section */}
      <section className="relative h-screen w-full">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="https://res.cloudinary.com/dyz3onqxt/video/upload/v1763934139/background_ti2kqh.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <Navbar isLoggedIn={false} />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="text-4xl md:text-6xl font-hennypenny mb-6 drop-shadow-lg">
            Welcome to{" "}
            <span className="text-primary henny-penny-regular">orrin</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
            Your{" "}
            <span className="text-accent font-bold italic text-[#076452]">
              Movie Night Planner
            </span>{" "}
            — discover the perfect film, show, anime or documentary without
            endless scrolling.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/manifesto"
              className="px-6 py-3 rounded-full border border-gray-300/40 bg-transparent hover:bg-white/10 text-white font-semibold transition"
            >
              Learn More
            </a>
            <a
              href="/login?redirect=/profile"
              className="px-6 py-3 rounded-full bg-[#076452] text-white font-semibold hover:bg-gray-700 transition"
            >
              Get Started →
            </a>
          </div>
        </div>
      </section>

      {/* Buffer Section */}
      <section className="bg-background py-32 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">
          Plan Smarter, Watch Better
        </h2>
        <p className="max-w-3xl mx-auto text-gray-400 mb-12 text-lg">
          Orrin helps you save time, cut down endless scrolling, and discover
          movies, shows, anime, and documentaries tailored to your mood.
        </p>
        <p className="max-w-4xl mx-auto text-gray-300 text-lg leading-relaxed">
          Whether you want personalized recommendations, a simple way to cut
          through endless choices, or even a smart companion that adapts to your
          mood—Orrin makes movie night effortless. You can explore curated
          genres, track what you've watched, and uncover hidden gems, all while
          joining a growing community of explorers who share your taste. No
          clutter, no noise—just guidance toward your next favorite story.
        </p>
      </section>

      {/* Posters Carousel */}
      <section className="overflow-hidden py-10 bg-black">
        {/* First Row (Left to Right) */}
        <div className="flex overflow-hidden mb-6">
          <div className="flex animate-marquee space-x-6">
            {postersRow1.concat(postersRow1).map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="poster"
                className="w-40 h-60 object-cover rounded-xl shadow-lg transition-all duration-300 hover:border-4 hover:border-primary"
              />
            ))}
          </div>
        </div>

        {/* Second Row (Right to Left) */}
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee-reverse space-x-6">
            {postersRow2.concat(postersRow2).map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="poster"
                className="w-40 h-60 object-cover rounded-xl shadow-lg transition-all duration-300 hover:border-4 hover:border-primary"
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
