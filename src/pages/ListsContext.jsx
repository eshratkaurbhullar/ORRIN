import React, { createContext, useContext, useState } from "react";

const INITIAL_TABS = [
  { label: "Films", key: "films" },
  { label: "Shows", key: "shows" },
  { label: "Anime", key: "anime" },
  { label: "Documentaries", key: "documentaries" },
];

const INITIAL_STATUS = [
  { label: "Want to Watch", count: 0, items: [] },
  { label: "Currently Watching", count: 0, items: [] },
  { label: "Watched", count: 0, items: [] },
  { label: "Did Not Finish", count: 0, items: [] },
];

const ListsContext = createContext();

export function useListsContext() {
  return useContext(ListsContext);
}

export function ListsProvider({ children }) {
  // Initialize status lists for each media type
  const [statusLists, setStatusLists] = useState(
    INITIAL_TABS.reduce((acc, tab) => {
      acc[tab.key] = INITIAL_STATUS.map((s) => ({ ...s, items: [] }));
      return acc;
    }, {})
  );

  // Initialize custom lists for each media type
  const [customLists, setCustomLists] = useState(
    INITIAL_TABS.reduce((acc, tab) => {
      acc[tab.key] = [];
      return acc;
    }, {})
  );

  const addToList = (mediaType, status, mediaItem) => {
    setStatusLists(prev => {
      const lists = { ...prev };
      const statusList = lists[mediaType].find(s => s.label === status);
      
      // Remove from all other status lists first
      lists[mediaType] = lists[mediaType].map(s => {
        if (s.label !== status) {
          return {
            ...s,
            items: s.items.filter(item => item.id !== mediaItem.id),
            count: s.items.filter(item => item.id !== mediaItem.id).length
          };
        }
        return s;
      });

      // Add to the selected status list if not already there
      if (!statusList.items.find(item => item.id === mediaItem.id)) {
        statusList.items.push(mediaItem);
        statusList.count = statusList.items.length;
      }

      return lists;
    });
  };

  const removeFromList = (mediaType, status, mediaItemId) => {
    setStatusLists(prev => {
      const lists = { ...prev };
      const statusList = lists[mediaType].find(s => s.label === status);
      
      statusList.items = statusList.items.filter(item => item.id !== mediaItemId);
      statusList.count = statusList.items.length;

      return lists;
    });
  };

  const addCustomList = (mediaType, listName) => {
    setCustomLists(prev => {
      if ((prev[mediaType] || []).length >= 12) return prev;
      
      return {
        ...prev,
        [mediaType]: [
          ...(prev[mediaType] || []),
          { name: listName, items: [], count: 0 }
        ]
      };
    });
  };

  const editCustomList = (mediaType, oldName, newName) => {
    setCustomLists(prev => {
      return {
        ...prev,
        [mediaType]: (prev[mediaType] || []).map(list =>
          list.name === oldName ? { ...list, name: newName } : list
        )
      };
    });
  };

  const deleteCustomList = (mediaType, listName) => {
    setCustomLists(prev => {
      return {
        ...prev,
        [mediaType]: (prev[mediaType] || []).filter(list => list.name !== listName)
      };
    });
  };

  const addToCustomList = (mediaType, listName, mediaItem) => {
    setCustomLists(prev => {
      return {
        ...prev,
        [mediaType]: (prev[mediaType] || []).map(list => {
          if (list.name === listName) {
            // Check if item already exists
            if (!list.items.find(item => item.id === mediaItem.id)) {
              const updatedItems = [...list.items, mediaItem];
              return {
                ...list,
                items: updatedItems,
                count: updatedItems.length
              };
            }
          }
          return list;
        })
      };
    });
  };

  const removeFromCustomList = (mediaType, listName, mediaItemId) => {
    setCustomLists(prev => {
      return {
        ...prev,
        [mediaType]: (prev[mediaType] || []).map(list => {
          if (list.name === listName) {
            const updatedItems = list.items.filter(item => item.id !== mediaItemId);
            return {
              ...list,
              items: updatedItems,
              count: updatedItems.length
            };
          }
          return list;
        })
      };
    });
  };

  const value = {
    statusLists,
    customLists,
    addToList,
    removeFromList,
    addCustomList,
    editCustomList,
    deleteCustomList,
    addToCustomList,
    removeFromCustomList,
  };

  return (
    <ListsContext.Provider value={value}>
      {children}
    </ListsContext.Provider>
  );
}
