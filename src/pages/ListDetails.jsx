import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useListsContext } from "./ListsContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ListDetails() {
  const { mediaType, listType, listName } = useParams();
  const { statusLists, customLists } = useListsContext();
  const navigate = useNavigate();

  // Get the list items based on whether it's a status list or custom list
  const getListItems = () => {
    if (listType === "status") {
      return statusLists[mediaType]?.find(list => list.label === listName)?.items || [];
    } else {
      return customLists[mediaType]?.find(list => list.name === listName)?.items || [];
    }
  };

  const items = getListItems();

  const handleCardClick = (mediaId) => {
    navigate(`/media/${mediaId}`);
  };

  return (
    <>
      <Navbar isLoggedIn />
      <div className="min-h-screen bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {listName}
            </h1>
            <p className="text-gray-400">
              {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} • {items.length} items
            </p>
          </div>

          {/* Grid of media items */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="cursor-pointer transform hover:scale-105 transition duration-200"
                onClick={() => handleCardClick(item.id)}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.year}</p>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {items.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No items in this list yet</p>
            </div>
          )}
        </div>
      </div>
      <Footer isLoggedIn />
    </>
  );
}