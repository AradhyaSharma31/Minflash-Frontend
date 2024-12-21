import React, { useState, useEffect } from "react";
import "./reviewCard.css";
import "../Button/GlobalButton.css";
import { getCurrentUserDetail, getCurrentUserToken } from "../../Auth/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSync } from "@fortawesome/free-solid-svg-icons";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../Components/ui/alert-dialog";

export const ReviewCard = () => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState(null);
  const [deck, setDeck] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const userId = getCurrentUserDetail().id;
  const deckId = sessionStorage.getItem("currentDeckId");
  const token = getCurrentUserToken();
  const [messageCard, setMessageCard] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const response = await fetch(
          `http://localhost:9030/flashcard/edit/getDeck/${deckId}?userId=${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch deck");
        }
        const fetchedDeck = await response.json();
        setDeck(fetchedDeck);
        filterNextReviewCard(fetchedDeck.cards);
      } catch (error) {
        console.error("Error fetching deck:", error);
      }
    };

    fetchDeck();
  }, [userId, deckId, token]);

  const getImageUrl = async (token, userId, deckId, cardId, file) => {
    try {
      const response = await fetch(
        `http://localhost:9030/flashcard/blob/get-url?userId=${userId}&deckId=${deckId}&cardId=${cardId}&file=${file}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching image URL");
      }

      const data = await response.json();
      setImageUrl(data.url);
    } catch (err) {
      setError(err.message);
    }
  };

  const filterNextReviewCard = async (cards) => {
    const now = new Date();
    const validCard = cards.find((card) => new Date(card.nextReview) <= now);

    if (validCard) {
      await getImageUrl(token, userId, deckId, validCard.id, validCard.image);
      setCurrentCard(validCard);
      setMessageCard(false);
    } else {
      setCurrentCard(null);
      setMessageCard(true);
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpaceFlip = (event) => {
    event.preventDefault();
    if (event.code === "Space") {
      setIsFlipped((prev) => !prev);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleSpaceFlip);
    return () => {
      window.removeEventListener("keydown", handleSpaceFlip);
    };
  }, []);

  const handleReset = async () => {
    try {
      const response = await fetch(
        `http://localhost:9030/flashcard/edit/resetDeck/${deckId}?userId=${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset the deck");
      } else {
        toast.success("Cards Reset Successful");
      }
      window.location.reload();
    } catch (error) {
      console.error("Error resetting the deck", error);
    }
  };

  const handlePostpone = async (performance) => {
    if (!currentCard) {
      console.error("Current card not found");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:9030/flashcard/edit/${currentCard.id}/updatePerformance?performance=${performance}&deckId=${deckId}&userId=${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update card performance");
      }

      const data = await response.json();
      const { updateCard, nextCard } = data;

      setIsFlipped(false);

      setTimeout(() => {
        filterNextReviewCard([nextCard]);
        setIsFlipped(false);
      }, 150);
    } catch (error) {
      console.error("Error updating card performance:", error);
    }
  };

  return (
    <div className="h-full mt-48 flex flex-col items-center">
      {deck && (
        <div className="w-[90%] lg:w-[50%] md:w-[75%] sm:w-[90%] flex flex-row items-end justify-between px-1">
          <h1 className="text-[1.75rem] font-semibold">
            {deck.title.charAt(0).toUpperCase() +
              (deck.title.length > 25
                ? `${deck.title.slice(1, 25)}...`
                : deck.title.slice(1))}
          </h1>

          <span className="space-x-4">
            <button
              onClick={() => {
                navigate("/user/edit");
              }}
              className="default-btn"
            >
              <FontAwesomeIcon
                style={{ marginRight: "15px" }}
                icon={faPenToSquare}
              />
              <span>Edit</span>
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="default-btn">
                  <FontAwesomeIcon
                    style={{ marginRight: "15px" }}
                    icon={faSync}
                  />
                  <span>Reset</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#15171a] border border-gray-700 rounded-lg shadow-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white text-xl font-bold">
                    Confirm Reset
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <p className="text-sm text-gray-500">
                  Are you sure you want to reset the cards? This action cannot
                  be undone.
                </p>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    onClick={handleReset}
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </span>
        </div>
      )}
      <div
        className="card-wrapper mt-4 flex justify-center items-center w-[100%]"
        onClick={handleCardClick}
      >
        {messageCard ? (
          <div className="card message w-[90%] lg:w-[50%] md:w-[75%] sm:w-[90%] h-[22rem] flex items-center justify-center text-center">
            <p>
              ⏳ No cards available for review right now. To review flashcards
              without spaced repetition scheduling, look up your set or{" "}
              <span
                onClick={() => {
                  navigate(`/user/explore/${deckId}`);
                  window.location.reload();
                }}
                className="text-blue-400 hover:border-b border-blue-500 cursor-pointer"
              >
                Click Here
              </span>
              . Happy Learning!
            </p>
          </div>
        ) : currentCard ? (
          <div
            className={`card ${
              isFlipped ? "flipped" : ""
            } w-[90%] lg:w-[50%] md:w-[75%] sm:w-[90%] h-[22rem]`}
          >
            <div className="front">
              <h1 className="text-2xl font-semibold">{currentCard.term}</h1>
            </div>

            <div className="back">
              <div className="img--parent">
                <h3>{currentCard.definition}</h3>
                {currentCard.image !== "null" && (
                  <img className="card--image" src={imageUrl} alt={imageUrl} />
                )}
              </div>
              <div className="postpone--btns">
                <button
                  className="postpone--btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePostpone("AGAIN");
                  }}
                >
                  AGAIN &lt;1m
                </button>
                <button
                  className="postpone--btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePostpone("HARD");
                  }}
                >
                  HARD &lt;6m
                </button>
                <button
                  className="postpone--btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePostpone("GOOD");
                  }}
                >
                  GOOD &lt;10m
                </button>
                <button
                  className="postpone--btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePostpone("EASY");
                  }}
                >
                  EASY 5d
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
