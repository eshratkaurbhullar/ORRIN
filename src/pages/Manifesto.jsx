import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Manifesto() {
  return (
    <>
      <Navbar isLoggedIn={false} />
      <main className="bg-black text-white pt-20">
        <section className="max-w-4xl mx-auto px-6 py-20"> {/* Reduced padding */}
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Orrin is your ultimate destination for discovering and organizing your
            favorite films, shows, anime, and documentaries. Our platform is
            designed to simplify your entertainment experience, helping you find
            the perfect content for any mood or occasion.
          </p>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            Built with a focus on clean design and responsive layouts, Orrin
            ensures a seamless user experience across devices. Whether you're a
            casual viewer or a dedicated cinephile, Orrin offers tools to create
            personalized lists, track your viewing progress, and explore curated
            recommendations tailored to your interests.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed">
            Join us in celebrating the art of storytelling and the joy of
            discovery. Orrin is more than just a platform—it's your gateway to a
            world of cinematic wonders.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
