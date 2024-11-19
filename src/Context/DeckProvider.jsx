import { React, createContext, useState } from "react";

export const DeckContext = createContext();

export const DeckProvider = ({ children }) => {
  const [currentDeckId, setCurrentDeckId] = useState(() => {
    return sessionStorage.getItem("currentDeckId") || null;
  });

  const updateDeckId = (deckId) => {
    setCurrentDeckId(deckId);
    sessionStorage.setItem("currentDeckId", deckId);
  };

  return (
    <DeckContext.Provider value={{ currentDeckId, updateDeckId }}>
      {children}
    </DeckContext.Provider>
  );
};
