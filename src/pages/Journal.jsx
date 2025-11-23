import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const articles = [
  {
    img: "https://a.ltrbxd.com/sm/upload/94/tf/vl/wd/BR010293_xlarge_thumbnail.jpg?k=7d92200d4e",
    title: "Executive Decisions.",
    subtitle: "Interview • 28 AUG 2025",
    desc: "Sony Pictures Motion Picture Group CEO Tom Rothman talks to Mia Lee Vicino about his scrappy indie roots, championing visionary filmmakers, and more.",
    link: "https://letterboxd.com/journal/tom-rothman-sony-interview/",
  },
  {
    img: "https://a.ltrbxd.com/sm/upload/i6/51/p4/kt/ridley-header.jpg?k=4f7ca2cfb8",
    title: "Great Scott.",
    subtitle: "Interview • 27 AUG 2025",
    desc: "As the BFI whisks us back into the cinematic worlds of Sir Ridley Scott, Ella Kemp is granted an audience with the peerless filmmaker.",
    link: "https://letterboxd.com/journal/ridley-scott-interview-bfi-retrospective-cinematic-worlds/",
  },
  {
    img: "https://a.ltrbxd.com/resized/sm/upload/ni/fn/ox/7n/Story%20Images%20(27)-0-640-0-0.jpg?k=9414af0ba5",
    title: "2025 Fall Fest Preview.",
    subtitle: "Festival Circuit • 26 AUG 2025",
    desc: "Shakespearean tragedies, monstrous creations, and the return of indie sleaze round out our most anticipated films of the 2025 fall festival season.",
    link: "https://letterboxd.com/journal/2025-fall-fest-preview/",
  },
];

export default function Journal() {
  const handleLogout = () => {
    console.log("Logged out");
  };

  return (
    <>
      <Navbar isLoggedIn={true} onLogout={handleLogout} />
      <div className="bg-black min-h-screen text-white font-serif pt-20 flex flex-col">
        {/* Feature Section */}
        <div className="flex flex-col items-center mt-8">
          <a
            href="https://letterboxd.com/journal/big-bold-beautiful-journey-competition/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://a.ltrbxd.com/resized/sm/upload/6x/98/0y/wf/image_1755703465161-0-1920-0-0.jpg?k=cc553c1771"
              alt="Feature"
              className="rounded-xl w-[600px] max-w-[90vw] object-cover mb-6 shadow-lg shadow-white/20 transform transition-transform duration-300 hover:scale-105 cursor-pointer"
            />
          </a>
          <div className="text-center max-w-xl mx-auto">
            <div className="text-[#076452] font-bold text-base mb-2 tracking-wide">
              Cinemascope
            </div>
            <div className="font-bold text-3xl mb-3 leading-tight">
              A Journey Through Romance.
            </div>
            <div className="text-[#d0d0d0] text-lg mb-2">
              In collaboration with Columbia Pictures, we invite members on a
              journey through romance to win a special sneak peek of Margot Robbie
              and Colin Farrell in <i>A Big Bold Beautiful Journey</i>. Plus: an
              opportunity for even more prizes.
            </div>
            <div className="text-sm text-[#aaa] tracking-wide">
              LETTERBOXD CREW
            </div>
          </div>
        </div>

        {/* Article Cards */}
        <div className="flex justify-center gap-9 mt-12 flex-wrap mb-16">
          {articles.map((a, i) => (
            <a key={i} href={a.link} target="_blank" rel="noopener noreferrer">
              <div className="bg-[#232526] rounded-lg w-[360px] h-[370px] shadow-md flex flex-col items-center pb-6 mb-6 transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                <img
                  src={a.img}
                  alt={a.title}
                  className="w-full h-44 object-cover rounded-t-lg mb-4"
                />
                <div className="font-bold text-[#076452] text-base mb-1 text-center">
                  {a.title}
                </div>
                <div className="text-sm text-[#aaa] mb-2 text-center">
                  {a.subtitle}
                </div>
                <div className="text-base text-[#e0e0e0] text-center px-3 overflow-hidden">
                  {a.desc}
                </div>
              </div>
            </a>
          ))}
        </div>
        {/* Footer after login */}
        <Footer isLoggedIn={true} />
      </div>
    </>
  );
}
