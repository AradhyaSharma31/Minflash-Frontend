import React, { useState, useEffect, useContext, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faPlus,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "../../Styles/userDecks.css";
import { useNavigate } from "react-router-dom";
import { getCurrentUserDetail, getCurrentUserToken } from "../../Auth/auth";
import { DeckContext } from "../../Context/DeckProvider";
import { FolderDeckSelection } from "./FolderDeckSelection";

const API_BASE_URL = "https://minflashcards.onrender.com/flashcard/folder";

export const SetFolderPage = () => {
  const navigate = useNavigate();
  const folderId = sessionStorage.getItem("currentFolderId");
  const { updateDeckId } = useContext(DeckContext);
  const [folder, setFolder] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = getCurrentUserDetail();
  const token = getCurrentUserToken();
  const imageURL = localStorage.getItem("profileImage");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDecks = useMemo(
    () =>
      folder?.deckDTOS
        ? folder.deckDTOS.filter((item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [],
    [folder, searchTerm]
  );

  useEffect(() => {
    const fetchUserDecks = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/getFolder/${folderId}?userId=${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const folderDecks = await response.json();
        setFolder(folderDecks);
      } catch (error) {
        console.error("Error fetching user decks:", error);
      }
    };

    if (folderId && currentUser.id && token) {
      fetchUserDecks();
    }
  }, [folderId, currentUser.id, token]);

  const closeModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  return (
    <div className="h-full mt-28 flex flex-col items-center justify-start space-y-3 py-3">
      <span className="mb-10 flex justify-between items-center w-full px-5 lg:px-8 overflow-hidden">
        <h1 className="text-[2rem] font-semibold">
          {folder?.folderName
            ? folder.folderName.charAt(0).toUpperCase() +
              (folder.folderName.length > 20
                ? `${folder.folderName.slice(1, 20)}...`
                : folder.folderName.slice(1))
            : "Loading..."}
        </h1>

        <span className="text-blue-300 text-sm font-semibold flex items-center space-x-3">
          <h1>
            Created {new Date(folder.createdAt).toLocaleDateString("en-GB")}
          </h1>
          <FontAwesomeIcon icon={faClockRotateLeft} />
        </span>
      </span>

      <div className="w-full flex flex-col px-5 lg:px-8">
        {/* Filter Search */}
        <div className="flex justify-between my-3">
          {/* Folder add */}
          <button
            onClick={closeModal}
            className="bg-blue-800 w-10 h-10 rounded-md flex justify-center items-center text-xl 
                        transition-transform transform scale-100 hover:scale-110 active:scale-95 
                      hover:bg-blue-700 active:bg-blue-900"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>

          <span className="border border-blue-900 w-80 max-sm:w-56 px-4 flex items-center bg-[#2a315a] rounded-lg">
            <input
              type="text"
              placeholder="Search Folders"
              className="py-2 w-full bg-transparent overflow-hidden outline-none border-none select-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="flex space-x-5">
              {searchTerm && (
                <span
                  className="flex px-1 cursor-pointer"
                  onClick={() => setSearchTerm("")}
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
                </span>
              )}
              <FontAwesomeIcon icon={faSearch} className="cursor-pointer" />
            </span>
          </span>
        </div>
      </div>

      {/* Decks */}
      {filteredDecks.map((item, key) => (
        <div
          onClick={() => {
            updateDeckId(item.id);
            navigate(`/user/review/${item.id}`);
          }}
          key={key}
          className="w-[95%] h-20 rounded-2xl bg-[#1C2A4A] text-[#D1D9E6] border border-[#2E436D]
          my-2 cursor-pointer transition-all duration-200 ease-in-out
          hover:bg-[#233559] hover:shadow-lg"
        >
          <span className="border-b border-[#000725] font-semibold text-[12px] w-full h-[40%] flex justify-between items-center rounded-t-2xl px-3 space-x-2">
            <span className="flex flex-row items-center">
              <span className="flex flex-row items-center space-x-2">
                <span className="h-5 w-5 rounded-full overflow-hidden flex justify-center items-center select-none bg-yellow-700">
                  {imageURL ? (
                    <img
                      src={imageURL}
                      alt={imageURL}
                      className="object-cover rounded-full h-[100%] w-[100%]"
                    />
                  ) : (
                    <h1>
                      {currentUser.uniqueUsername.slice(0, 1).toUpperCase()}
                    </h1>
                  )}
                </span>
                <h1 className="font-medium">{currentUser.uniqueUsername}</h1>
                <hr />
              </span>
              <span className="bg-[#0D1B2A] rounded-full py-1 px-2 text-[10px] font-medium">
                <h1>
                  {item.cards.length > 10000 ? `10000+` : item.cards.length}{" "}
                  Terms
                </h1>
              </span>
            </span>
          </span>

          <span className="space-x-2 w-full h-[50%] rounded-b-2xl flex justify-start items-center px-3 font-medium text-xl">
            <img
              src="https://media-hosting.imagekit.io//4f14a0b9163e4071/cardIcon.png?Expires=1833303277&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=pYa5j4csZy7mbdARj5cDx3dZ0tj1zVBxFwmGrSBdHpa37uZjXvx4AfcxLm2mvfmj8MVRYZ-ESsLIUyYff3oe32XEObfIa78y9gALEtuTvemFxC7ZnsaSvbNg96uJ5aR-2JAuXe07Dh0sUyXZG3YHjMQ0tkZmnB8rZZoBWAjLKa-TMw9gPNMNlyR~Qf73pdWop8qo9Gp80TGeoxkj92lcKXPZDjvSAatTdUYi7KC1IzS8Npw~G7hsrboMjGan7SOPa7AJvR03-miuxRPxhyDrSijMB7oGOAMniB5sdJqQRFeAETKJDAH4yyF3GmrFJ0TzXoVwlHXW7viT8tolmR-Z~g__"
              alt="card icon"
              className="w-6 h-5"
            />
            <h1>
              {item.title.charAt(0).toUpperCase() +
                (item.title.length > 40
                  ? `${item.title.slice(1, 40)}...`
                  : item.title.slice(1))}
            </h1>
          </span>
        </div>
      ))}

      {/* Not found image */}
      {filteredDecks.length === 0 && (
        <div className="w-52 h-64 flex items-end overflow-hidden">
          <img
            src="https://media-hosting.imagekit.io//7b1a7dcb83c14b82/not-found2.png?Expires=1833167969&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=e6nzvTRG6WMvJ2aYn7WufuIDHMMvq3Q28ddJNEHDjFjuLuA7JXNldpVj2P~1YWvIABdEPpsmWXLYDgIoEpDNoW7RwDcmCCQEEdszeNkHfXY7tiU32LB9MD1uLPd38kEOpdom9sCCAxyv8m~10fDwOYco~JJXEpvhJalHLEzwg5tSIBhYK~D6a25evrdjL1FSRhHYsQtcK2GGrmgXF3fTFfZtc6GJ7Zv5~TYJP5HhKeKbVjiPj8pTm8jeQT4NzdJGs6lyxmxgfOZoK1fyhKIQjxEDzkbRmO5kCe1f9e44UEpNb1uTmt1YbKPgzwDh0Cef8lIb8wQ3LNPR26YPJZcceA__"
            alt="sets not found"
            className="rounded-3xl"
          />
        </div>
      )}

      {isModalOpen && <FolderDeckSelection handleClose={closeModal} />}
    </div>
  );
};
