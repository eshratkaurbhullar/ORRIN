import React, { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useListsContext } from "./ListsContext";
import { useNavigate } from "react-router-dom";

const TABS = [
  { label: "Films", key: "films" },
  { label: "Shows", key: "shows" },
  { label: "Anime", key: "anime" },
  { label: "Documentaries", key: "documentaries" },
];

const STATUS = [
  { label: "Want to Watch", count: 0 },
  { label: "Currently Watching", count: 0 },
  { label: "Watched", count: 0 },
  { label: "Did Not Finish", count: 0 },
];

function StatusList({ type, status, count, onClick, items = [] }) {
  const firstItem = items[0];
  const secondItem = items[1];
  const thirdItem = items[2];

  return (
    <div
      className="flex flex-col items-center bg-[#232526] rounded-2xl p-5 w-60 mx-3 min-h-[220px] shadow-inner border border-[#ecebe6]/60 cursor-pointer hover:bg-[#2b2e2f] transition-colors duration-200"
      onClick={onClick}
    >
      <div className="mb-3 w-28 h-28 flex flex-row gap-2">
        {/* Large left thumbnail (60%) */}
        <div className="bg-gray-200 rounded-lg flex items-center justify-center w-[60%] h-full overflow-hidden">
          {firstItem?.poster ? (
            <img
              src={firstItem.poster}
              alt={`${firstItem.title || status} thumbnail`}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg width="32" height="32" fill="none" className="opacity-40">
              <path
                d="M16 24v-4M16 20a4 4 0 0 1 4-4h0a4 4 0 0 0-8 0h0a4 4 0 0 1 4 4Z"
                stroke="#bbb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        {/* Two smaller thumbnails on the right (40%) */}
        <div className="flex flex-col gap-2 w-[40%] h-full">
          {/* Top right thumbnail */}
          <div className="bg-gray-200 rounded-lg flex-1 flex items-center justify-center overflow-hidden">
            {secondItem?.poster ? (
              <img
                src={secondItem.poster}
                alt={`${secondItem.title || status} thumbnail`}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="18" height="18" fill="none" className="opacity-40">
                <path
                  d="M9 13v-2M9 11a2 2 0 0 1 2-2h0a2 2 0 0 0-4 0h0a2 2 0 0 1 2 2Z"
                  stroke="#bbb"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          {/* Bottom right thumbnail */}
          <div className="bg-gray-200 rounded-lg flex-1 flex items-center justify-center overflow-hidden">
            {thirdItem?.poster ? (
              <img
                src={thirdItem.poster}
                alt={`${thirdItem.title || status} thumbnail`}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="18" height="18" fill="none" className="opacity-40">
                <path
                  d="M9 13v-2M9 11a2 2 0 0 1 2-2h0a2 2 0 0 0-4 0h0a2 2 0 0 1 2 2Z"
                  stroke="#bbb"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
      <div className="font-semibold text-lg text-white text-center">{status}</div>
      <div className="flex items-center text-gray-400 text-base mt-2">
        {count} {type}
        <svg
          className="w-5 h-5 ml-1"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5 0-9.27-3.11-10.73-7.5a10.05 10.05 0 0 1 4.2-5.13M6.1 6.1A9.94 9.94 0 0 1 12 5c5 0 9.27 3.11 10.73 7.5a10.02 10.02 0 0 1-2.07 3.28M1 1l22 22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.96 0 1.84-.38 2.47-1M14.47 14.47A3.5 3.5 0 0 0 12 8.5c-.96 0-1.84.38-2.47 1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function CreateBox() {
  return (
    <div className="flex flex-col items-center justify-center bg-[#232526] rounded-2xl p-5 w-60 mx-3 min-h-[220px] cursor-pointer hover:bg-[#232526]/80 transition shadow-inner border border-[#ecebe6]/60">
      <div className="flex items-center justify-center mb-3 w-28 h-28 bg-gray-200 rounded-lg">
        <PlusIcon className="w-12 h-12" style={{ color: "#076452" }} />
      </div>
      <div className="font-semibold text-lg text-white text-center mt-2">Create</div>
    </div>
  );
}

export default function Lists() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [editingList, setEditingList] = useState(null); // { mediaType, listName }
  const [editInput, setEditInput] = useState("");

  // store custom lists per tab
  const { statusLists, customLists, addCustomList, editCustomList, deleteCustomList } = useListsContext();

  const navigate = useNavigate();

  const handleCreate = () => {
    addCustomList(
      activeTab,
      `Custom List ${(customLists[activeTab] || []).length + 1}`
    );
  };

  const handleStatusListClick = (status) => {
    navigate(
      `/lists/${activeTab}/status/${encodeURIComponent(status)}`
    );
  };

  const handleCustomListClick = (listName, e) => {
    // Don't navigate if clicking the edit or delete button
    if (e && (e.target.closest('.edit-button') || e.target.closest('.delete-button'))) {
      return;
    }
    navigate(
      `/lists/${activeTab}/custom/${encodeURIComponent(listName)}`
    );
  };

  const handleEditClick = (listName, e) => {
    e.stopPropagation();
    setEditingList({ mediaType: activeTab, listName });
    setEditInput(listName);
  };

  const handleEditSave = (oldName, e) => {
    e.stopPropagation();
    if (editInput.trim()) {
      editCustomList(activeTab, oldName, editInput.trim());
    }
    setEditingList(null);
    setEditInput("");
  };

  const handleEditCancel = (e) => {
    e.stopPropagation();
    setEditingList(null);
    setEditInput("");
  };

  const handleEditKeyDown = (oldName, e) => {
    if (e.key === "Enter") {
      handleEditSave(oldName, e);
    } else if (e.key === "Escape") {
      handleEditCancel(e);
    }
  };

  const handleDeleteClick = (listName, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${listName}"?`)) {
      deleteCustomList(activeTab, listName);
    }
  };

  const getRows = () => {
    const itemsPerRow = 4;
    const lists = customLists[activeTab] || [];
    const rows = [];
    const firstRow = ["create", ...lists.slice(0, 3)];
    rows.push(firstRow);
    let idx = 3;
    while (idx < lists.length) {
      rows.push(lists.slice(idx, idx + itemsPerRow));
      idx += itemsPerRow;
    }
    return rows;
  };

  const rows = getRows();

  return (
    <>
      <Navbar isLoggedIn />
      <div className="bg-black min-h-[80vh] text-white font-serif mt-25 pb-2">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`mr-8 pb-2 text-lg font-semibold transition-colors ${
                activeTab === tab.key ? "border-b-2" : "text-gray-400"
              }`}
              style={
                activeTab === tab.key
                  ? { color: "#076452", borderColor: "#076452" }
                  : {}
              }
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Status Lists */}
        <div className="px-6 pt-6">
          <div className="text-gray-400 text-sm mb-4">
            {TABS.find((t) => t.key === activeTab).label} status lists
          </div>
          <div className="flex flex-row flex-wrap justify-center gap-8">
            {(statusLists[activeTab] || []).map((s) => (
              <StatusList
                key={s.label}
                type={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                status={s.label}
                count={s.count}
                items={s.items || []}
                onClick={() => handleStatusListClick(s.label)}
              />
            ))}
          </div>
          <div className="border-b border-gray-700 mt-10 mb-8"></div>
          {/* Custom Lists */}
          <div className="flex flex-col gap-8">
            {rows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="flex flex-row flex-wrap justify-center gap-8"
              >
                {row.map((item, idx) =>
                  item === "create" ? (
                    <div key="create" onClick={handleCreate}>
                      <CreateBox />
                    </div>
                  ) : (
                    <div
                      key={idx}
                      className="relative flex flex-col items-center bg-[#232526] rounded-2xl p-5 w-60 mx-3 min-h-[220px] shadow-inner border border-[#ecebe6]/60 cursor-pointer hover:bg-[#2b2e2f] transition-colors duration-200"
                      onClick={(e) => handleCustomListClick(item.name, e)}
                    >
                      {/* Edit and Delete Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                        <button
                          className="edit-button p-1.5 bg-[#076452] hover:bg-[#065a4a] rounded-full transition-colors"
                          onClick={(e) => handleEditClick(item.name, e)}
                          title="Edit list name"
                        >
                          <PencilIcon className="w-4 h-4 text-white" />
                        </button>
                        <button
                          className="delete-button p-1.5 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                          onClick={(e) => handleDeleteClick(item.name, e)}
                          title="Delete list"
                        >
                          <TrashIcon className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      <div className="mb-3 w-28 h-28 flex flex-row gap-2">
                        {item.items?.length ? (
                          <img
                            src={item.items[0]?.poster}
                            alt={`${item.name} thumbnail`}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          <>
                            <div className="bg-gray-200 rounded-lg flex items-center justify-center w-[60%] h-full">
                              <svg width="32" height="32" fill="none" className="opacity-40">
                                <path
                                  d="M16 24v-4M16 20a4 4 0 0 1 4-4h0a4 4 0 0 0-8 0h0a4 4 0 0 1 4 4Z"
                                  stroke="#bbb"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div className="flex flex-col gap-2 w-[40%] h-full">
                              <div className="bg-gray-200 rounded-lg flex-1 flex items-center justify-center">
                                <svg width="18" height="18" fill="none" className="opacity-40">
                                  <path
                                    d="M9 13v-2M9 11a2 2 0 0 1 2-2h0a2 2 0 0 0-4 0h0a2 2 0 0 1 2 2Z"
                                    stroke="#bbb"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <div className="bg-gray-200 rounded-lg flex-1 flex items-center justify-center">
                                <svg width="18" height="18" fill="none" className="opacity-40">
                                  <path
                                    d="M9 13v-2M9 11a2 2 0 0 1 2-2h0a2 2 0 0 0-4 0h0a2 2 0 0 1 2 2Z"
                                    stroke="#bbb"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      {editingList?.mediaType === activeTab && editingList?.listName === item.name ? (
                        <div className="w-full flex flex-col items-center gap-2">
                          <input
                            type="text"
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(item.name, e)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-1.5 bg-[#0b0b0b] border border-gray-600 rounded text-white text-center text-lg font-semibold focus:outline-none focus:border-[#076452]"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleEditSave(item.name, e)}
                              className="px-3 py-1 bg-[#076452] hover:bg-[#065a4a] text-white text-sm rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-semibold text-lg text-white text-center">
                            {item.name}
                          </div>
                          <div className="flex items-center text-gray-400 text-base mt-2">
                            <svg
                              className="w-5 h-5 ml-1"
                              fill="none"
                              stroke="#fff"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5 0-9.27-3.11-10.73-7.5a10.05 10.05 0 0 1 4.2-5.13M6.1 6.1A9.94 9.94 0 0 1 12 5c5 0 9.27 3.11 10.73 7.5a10.02 10.02 0 0 1-2.07 3.28M1 1l22 22"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.96 0 1.84-.38 2.47-1M14.47 14.47A3.5 3.5 0 0 0 12 8.5c-.96 0-1.84.38-2.47 1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer isLoggedIn />
    </>
  );
}