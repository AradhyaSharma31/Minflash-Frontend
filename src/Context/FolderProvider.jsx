import { React, createContext, useState } from "react";

export const FolderContext = createContext();

export const FolderProvider = ({ children }) => {
  const [currentFolderId, setCurrentFolderId] = useState(() => {
    return sessionStorage.getItem("currentFolderId") || null;
  });

  const updateFolderId = (folderId) => {
    setCurrentFolderId(folderId);
    sessionStorage.setItem("currentFolderId", folderId);
  };

  return (
    <FolderContext.Provider value={{ currentFolderId, updateFolderId }}>
      {children}
    </FolderContext.Provider>
  );
};
