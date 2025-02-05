import { React, useState, useEffect, useContext, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../../Styles/Register.css";
import "../../Styles/userDecks.css";
import { useNavigate } from "react-router-dom";
import { getCurrentUserDetail, getCurrentUserToken } from "../../Auth/auth";
import { DeckContext } from "../../Context/DeckProvider";
import axios from "axios";

const API_BASE_URL = "https://minflashcards.onrender.com/flashcard";

export const FolderDeckSelection = ({ handleClose }) => {
  const [deck, setDeck] = useState([]);
  const currentUser = getCurrentUserDetail();
  const token = getCurrentUserToken();
  const folderId = sessionStorage.getItem("currentFolderId");
  const [imageURL, setImageURL] = useState(
    localStorage.getItem("profileImage")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDecks, setSelectedDecks] = useState([]);
  const [folderDecks, setFolderDecks] = useState([]);

  // get decks already in the folder
  useEffect(() => {
    const fetchFolderDecks = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/folder/getFolder/${folderId}?userId=${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const folderData = await response.json();
        const folderDeckIds = folderData.deckDTOS.map((deck) => deck.id);
        setFolderDecks(folderDeckIds);
        setSelectedDecks(folderDeckIds);
      } catch (error) {
        console.error("Error fetching folder decks:", error);
      }
    };

    fetchFolderDecks();
  }, [folderId, currentUser.id, token]);

  // Fetch all user decks
  useEffect(() => {
    const fetchUserDecks = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/user/readUser/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const user = await response.json();

        const userDecks = user.decks.map((deck) => ({
          DeckId: deck.id,
          UserProfileImage: user.profilePicture || "",
          createdBy: user.uniqueUsername,
          title: deck.title,
          totalTerms: deck.cards.length,
        }));
        setDeck(userDecks);
      } catch (error) {
        console.error("Error fetching user decks:", error);
      }
    };

    fetchUserDecks();
  }, [currentUser.id, token]);

  // Toggle selection of a deck
  const toggleSelection = async (deckId) => {
    if (selectedDecks.includes(deckId)) {
      // If already selected, remove it
      setSelectedDecks((prevSelected) =>
        prevSelected.filter((id) => id !== deckId)
      );
      await handleDeleteDeck(deckId); // remove the deck from the folder
      setFolderDecks((prevFolderDecks) =>
        prevFolderDecks.filter((id) => id !== deckId)
      ); // Update the folderDecks after deleting
    } else {
      // If not selected, add it
      setSelectedDecks((prevSelected) => [...prevSelected, deckId]);
      await handleSaveDeck(deckId); // add the deck to the folder
    }
  };

  // Save deck to folder
  const handleSaveDeck = async (deckId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/folder/addDeckToFolder/${folderId}/${deckId}?userId=${currentUser.id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      console.error("Error adding deck to folder:", e);
    }
  };

  // delete deck from folder
  const handleDeleteDeck = async (deckId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/folder/removeDeckFromFolder/${folderId}/${deckId}?userId=${currentUser.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(`Deck ${deckId} deleted successfully`);
    } catch (e) {
      console.error("Error adding deck to folder:", e);
    }
  };

  const filteredDecks = useMemo(
    () =>
      deck.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [deck, searchTerm]
  );

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content model-card-selection">
          <div className="h-10">
            <h1 className="font-medium text-xl text-white">Select Sets</h1>
          </div>
          <div className="absolute top-0 right-0 px-3.5 py-1 text-[1.5rem]">
            <FontAwesomeIcon
              onClick={() => {
                handleClose();
                window.location.reload(true);
              }}
              icon={faXmark}
              style={{ cursor: "pointer", color: "#ffffff" }}
            />
          </div>

          {/* decks */}
          {filteredDecks.map((item, key) => (
            <div
              key={key}
              className="w-[95%] h-20 rounded-2xl bg-[#1C2A4A] text-[#D1D9E6] border border-[#2E436D]
          my-2 transition-all duration-200 ease-in-out
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
                    <h1 className="font-medium">{item.createdBy}</h1>
                    <hr />
                  </span>
                  <span className="bg-[#0D1B2A] rounded-full py-1 px-2 text-[10px] font-medium">
                    <h1>
                      {item.totalTerms > 10000 ? `10000+` : item.totalTerms}{" "}
                      Terms
                    </h1>
                  </span>
                </span>
              </span>
              <span className="w-full h-[50%] rounded-b-2xl flex justify-between items-center px-3 font-medium text-xl">
                <h1>
                  {item.title.charAt(0).toUpperCase() +
                    (item.title.length > 40
                      ? `${item.title.slice(1, 40)}...`
                      : item.title.slice(1))}
                </h1>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(item.DeckId);
                  }}
                  className="border-2 cursor-pointer flex justify-center items-center text-[15px] h-[25px] w-[25px] rounded-full"
                >
                  <FontAwesomeIcon
                    icon={
                      folderDecks.includes(item.DeckId) ||
                      selectedDecks.includes(item.DeckId)
                        ? faCheck
                        : faPlus
                    }
                  />
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
