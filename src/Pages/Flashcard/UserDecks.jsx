import { React, useState, useEffect, useContext, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import "../../Styles/userDecks.css";
import { useNavigate } from "react-router-dom";
import { getCurrentUserDetail, getCurrentUserToken } from "../../Auth/auth";
import { DeckContext } from "../../Context/DeckProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../Components/ui/alert-dialog";
const API_BASE_URL = "https://minflashcards.onrender.com/flashcard/user";

export const UserDecks = () => {
  const navigate = useNavigate();
  const { updateDeckId } = useContext(DeckContext);
  const [deck, setDeck] = useState([]);
  const currentUser = getCurrentUserDetail();
  const token = getCurrentUserToken();
  const [popoverDeckId, setPopoverDeckId] = useState(null);
  const [imageURL, setImageURL] = useState(
    localStorage.getItem("profileImage")
  ); // State for file URL saved in azure
  const [route, setRoute] = useState({ sets: true, folder: false });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDecks = useMemo(
    () =>
      deck.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [deck, searchTerm]
  );

  useEffect(() => {
    const fetchUserDecks = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/readUser/${currentUser.id}`,
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

  // method to set routes
  const handleRoute = (selected) => {
    setRoute({ sets: selected === "sets", folder: selected === "folder" });
  };

  const handleSelect = (selectedRoute) => {
    if (selectedRoute === "sets") {
      navigate("/user/sets");
      handleRoute("sets");
    } else if (selectedRoute === "folder") {
      navigate("/user/folder");
      handleRoute("folder");
    }
  };

  const togglePopover = (deckId) => {
    setPopoverDeckId(deckId);
  };

  const handleDelete = async (deckId, e) => {
    e.stopPropagation();

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/flashcard/edit/deleteDeck/${deckId}?userId=${currentUser.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPopoverDeckId(null);

      setDeck((prevDeck) => prevDeck.filter((item) => item.DeckId !== deckId));
    } catch (error) {
      console.error("Error deleting the deck: " + error);
    }
  };

  return (
    <div className="h-full mt-28 flex flex-col items-center justify-start space-y-3 py-3">
      <span>
        <h1 className="mb-10 lg:text-[2rem] font-semibold">
          {`Look at all the awesome flashcards you’ve made, ${currentUser.uniqueUsername}!`}
        </h1>
      </span>

      {/* Selection */}
      <div className="w-full flex flex-col px-5 lg:px-8">
        <span className="flex space-x-6 px-3 pb-1 text-md font-medium">
          <button
            className={` ${
              route.sets
                ? "text-white selected"
                : "flashcard-button text-gray-400"
            }`}
            onClick={() => handleSelect("sets")}
          >
            Flashcard Sets
          </button>
          <button
            className={` ${
              route.folder
                ? "text-white selected"
                : "flashcard-button text-gray-400"
            }`}
            onClick={() => handleSelect("folder")}
          >
            Folders
          </button>
        </span>
        <span className="border border-[#003366] my-2"></span>

        {/* Filter Search */}
        <div className="flex justify-between my-3">
          {/* Folder add */}
          <button
            onClick={() => {
              navigate("/user/edit");
              updateDeckId(null);
            }}
            className="bg-blue-800 w-10 h-10 rounded-md flex justify-center items-center text-xl 
                                  transition-transform transform scale-100 hover:scale-110 active:scale-95 
                                hover:bg-blue-700 active:bg-blue-900"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>

          <span className="border border-blue-900 w-80 max-sm:w-56 px-4 flex items-center bg-[#2a315a] rounded-lg">
            <input
              type="text"
              placeholder="Search Sets"
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

      {/* decks */}
      {filteredDecks.map((item, key) => (
        <div
          onClick={() => {
            updateDeckId(item.DeckId);
            navigate(`/user/review/${item.DeckId}`);
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
                <h1 className="font-medium">{item.createdBy}</h1>
                <hr />
              </span>
              <span className="bg-[#0D1B2A] rounded-full py-1 px-2 text-[10px] font-medium">
                <h1>
                  {item.totalTerms > 10000 ? `10000+` : item.totalTerms} Terms
                </h1>
              </span>
            </span>

            {/* delete Deck */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePopover(item.DeckId);
              }}
              className="px-2 py-1 rounded-lg hover:bg-[#3A567F]"
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
              open={popoverDeckId === item.DeckId}
              onOpenChange={() => setPopoverDeckId(null)}
            >
              <AlertDialogContent
                onClick={(e) => e.stopPropagation()}
                className="bg-[#15171a] border border-gray-700 rounded-lg shadow-lg"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-bold text-md">
                    {`Are you sure you want to delete "${item.title}"?`}
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription className=" text-gray-400">
                  Deleting this set will remove all its content. This action
                  cannot be undone.
                </AlertDialogDescription>
                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      handleDelete(item.DeckId, e);
                      e.stopPropagation();
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </span>
          <span className="w-full h-[50%] rounded-b-2xl flex justify-start items-center px-3 font-medium text-xl">
            <h1>
              {item.title.charAt(0).toUpperCase() +
                (item.title.length > 40
                  ? `${item.title.slice(1, 40)}...`
                  : item.title.slice(1))}
            </h1>
          </span>
        </div>
      ))}

      {/* not found image */}
      {filteredDecks === 0 && (
        <div className="w-52 h-64 flex items-end overflow-hidden">
          <img
            src="https://media-hosting.imagekit.io//7b1a7dcb83c14b82/not-found2.png?Expires=1833167969&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=e6nzvTRG6WMvJ2aYn7WufuIDHMMvq3Q28ddJNEHDjFjuLuA7JXNldpVj2P~1YWvIABdEPpsmWXLYDgIoEpDNoW7RwDcmCCQEEdszeNkHfXY7tiU32LB9MD1uLPd38kEOpdom9sCCAxyv8m~10fDwOYco~JJXEpvhJalHLEzwg5tSIBhYK~D6a25evrdjL1FSRhHYsQtcK2GGrmgXF3fTFfZtc6GJ7Zv5~TYJP5HhKeKbVjiPj8pTm8jeQT4NzdJGs6lyxmxgfOZoK1fyhKIQjxEDzkbRmO5kCe1f9e44UEpNb1uTmt1YbKPgzwDh0Cef8lIb8wQ3LNPR26YPJZcceA__"
            alt="sets not found"
            className="rounded-3xl"
          />
        </div>
      )}
    </div>
  );
};
