import { React, useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
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
  AlertDialogTrigger,
} from "../../Components/ui/alert-dialog";
const API_BASE_URL = "http://localhost:9030/flashcard/user";

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

  const togglePopover = (deckId) => {
    setPopoverDeckId(deckId);
  };

  useEffect(() => {
    const fetchUserDecks = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/readUser/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const user = response.data;

        const userDecks = user.decks.map((deck) => ({
          DeckId: deck.id,
          UserProfileImage: user.profilePicture || "",
          createdBy: user.username,
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

  const handleDelete = async (deckId, e) => {
    e.stopPropagation();

    try {
      const response = await axios.delete(
        `http://localhost:9030/flashcard/edit/deleteDeck/${deckId}?userId=${currentUser.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);
      setPopoverDeckId(null);

      setDeck((prevDeck) => prevDeck.filter((item) => item.DeckId !== deckId));
      window.location.reload();
    } catch (error) {
      console.log("Error deleting the deck: " + error);
    }
  };

  return (
    <div className="mt-28 flex flex-col items-center justify-start space-y-3 py-3">
      <span>
        <h1 className="mb-10 text-[2rem] font-semibold">
          Welcome Sweetheart! Let's look at what you've created
        </h1>
      </span>
      {/* decks */}
      {deck.map((item, key) => (
        <div
          onClick={() => {
            updateDeckId(item.DeckId);
            navigate(`/user/review/${item.DeckId}`);
            window.location.reload(true);
          }}
          key={key}
          className="cursor-pointer w-[95%] h-24 rounded-2xl bg-[#463b3b] hover:bg-[#504444] flex justify-center items-center flex-col space-y-1 py-1s"
        >
          <span className="border-b border-[#2c2828] font-semibold text-[12px] w-full h-[40%] flex justify-between items-center rounded-t-2xl px-3 space-x-2">
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
                <h1>{item.createdBy}</h1>
                <hr />
              </span>
              <span className="bg-[#865555] rounded-full py-1 px-2 text-[10px]">
                <h1>
                  Terms: {item.totalTerms > 10000 ? `10000+` : item.totalTerms}
                </h1>
              </span>
            </span>

            {/* delete Deck */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePopover(item.DeckId); // Pass the deck's ID to togglePopover
              }}
              className="px-2 py-1 rounded-lg hover:bg-[#695b5b]"
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
              open={popoverDeckId === item.DeckId}
              onOpenChange={() => setPopoverDeckId(null)}
            >
              <AlertDialogContent className="bg-[#15171a] border border-gray-700 rounded-lg shadow-lg">
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
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg ml-2 transition-colors"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </span>

          <span className="w-full h-[60%] rounded-b-2xl flex justify-start items-center px-3 font-semibold text-[25px]">
            <h1>
              {item.title.length > 40
                ? `${item.title.slice(0, 40)}...`
                : item.title}
            </h1>
          </span>
        </div>
      ))}

      {/* add deck */}
      <div className="w-[95%] h-24 rounded-2xl bg-[#463b3b] hover:bg-[#504444] flex justify-center items-center flex-col space-y-1 py-1s">
        <button
          onClick={() => {
            navigate("/user/edit");
            updateDeckId(null);
          }}
          className="card--shadow cursor-pointer h-12 w-12 transition-all ease-in-out duration-150 rounded-full text-[25px] flex justify-center items-center bg-[#6e5b5b] hover:bg-[#796767] focus:border-2"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <span>
          <h1 className="select-none font-semibold text-[0.9rem]">
            create new set
          </h1>
        </span>
      </div>
    </div>
  );
};