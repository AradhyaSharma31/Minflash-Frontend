import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../../Styles/reviewCard.css";
import "../../Styles/GlobalButton.css";
import { getCurrentUserDetail, getCurrentUserToken } from "../../Auth/auth";
import { toast } from "react-hot-toast";

export const ExploreReviewDeck = () => {
  const [deck, setDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const userId = getCurrentUserDetail().id;
  const deckId = sessionStorage.getItem("currentDeckId");
  const [imageUrl, setImageUrl] = useState(null);
  const token = getCurrentUserToken();
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const response = await fetch(
          `https://minflashcards.onrender.com/flashcard/edit/getReviewDeck/${deckId}`,
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

        if (
          fetchedDeck.cards?.[currentCardIndex]?.id &&
          fetchedDeck.cards?.[currentCardIndex]?.image !== "null"
        ) {
          const cardImageResponse = await getCardImage(
            deckId,
            fetchedDeck.cards[currentCardIndex].id,
            fetchedDeck.cards[currentCardIndex].image
          );

          if (!cardImageResponse.ok) {
            throw new Error("Failed to fetch card image");
          }

          const cardImageUrl = await cardImageResponse.json();
          setImageUrl(cardImageUrl.url);
        }
      } catch (error) {
        console.error("Error fetching deck:", error);
      }
    };

    if (deckId) {
      fetchDeck();
    }
  }, [deckId, token, currentCardIndex]);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpaceFlip = (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleSpaceFlip);
    return () => {
      window.removeEventListener("keydown", handleSpaceFlip);
    };
  }, []);

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex === deck.cards.length - 1) {
      toast.success("Set Completed");
      setCompleted(true);
    } else {
      setCurrentCardIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (currentCardIndex === 0) return;
    else {
      setCurrentCardIndex(
        (prevIndex) => (prevIndex - 1 + deck.cards.length) % deck.cards.length
      );
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case "ArrowRight":
        case "d":
        case "D":
          handleNextCard();
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          handlePrevCard();
          break;
        case " ":
          event.preventDefault();
          setIsFlipped((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleNextCard, handlePrevCard]);

  const getCardImage = async (deckId, cardId, image) => {
    return await fetch(
      `https://minflashcards.onrender.com/flashcard/blob/get-url?deckId=${deckId}&cardId=${cardId}&file=${image}`
    );
  };

  return (
    <div className="h-full mt-36 flex flex-col items-center space-y-3">
      {!completed && deck && (
        <div className="w-[90%] lg:w-[50%] md:w-[75%] sm:w-[90%] flex flex-row items-end justify-between px-1">
          <h1 className="text-[2rem] font-semibold">
            {deck.title.charAt(0).toUpperCase() +
              (deck.title.length > 40
                ? `${deck.title.slice(1, 40)}...`
                : deck.title.slice(1))}
          </h1>
        </div>
      )}
      <div
        className="card-wrapper flex justify-center items-center w-[100%]"
        onClick={handleCardClick}
      >
        {!completed && deck && deck.cards.length > 0 && (
          <div
            className={`card ${
              isFlipped ? "flipped" : ""
            } w-[90%] lg:w-[50%] md:w-[75%] sm:w-[90%] h-[22rem]`}
          >
            <div className="front">
              <h1 className="text-2xl font-semibold">
                {deck.cards[currentCardIndex].term}
              </h1>
            </div>
            <div className="back">
              <div className="img--parent">
                <h3>{deck.cards[currentCardIndex].definition}</h3>
                {deck.cards[currentCardIndex].image !== "null" && (
                  <img className="card--image" src={imageUrl} alt="Uploaded" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {!completed && (
        <div className="w-full flex justify-center gap-3">
          <button
            className="postpone--btn h-12 w-24 rounded-3xl text-lg"
            onClick={handlePrevCard}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            className="postpone--btn h-12 w-24 rounded-3xl text-lg"
            onClick={handleNextCard}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      {/* Completed Image */}
      {completed && (
        <div className="flex flex-col justify-center items-center">
          <img
            src="https://media-hosting.imagekit.io//53bef0ee832645a7/completed.png?Expires=1833167936&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=d0LqAnb0Qt72JdrMDYcOs2-Wo9RrEypBn5wFFlp82k4SoNovfN6oCDkFl1pOghB0okHzvGRZPmLhHzhb0d3N3KbnPj9EYHO68hYpDsZC3uRmA8ULy2R0tWHEOOZpb9Flxr-0A0FLvsd0X-JlQkYDiLFOgl5acnn8kpPMDqEQ9Mtb6FSRNKYstjckm0g6vWi7fD7~XRlavvazlxvsOtNobfC2MR2pQTCNifCUz6-VidDc7AR432ng~A6AACQ3MlHQUaz2Z2e7vHe~BqzXg1G8nZs7NAiDfw0A7K8pybwZpjLG3Qe6zULGGAmtDVoL7hniOM0BDE8--MRr4jHCedayQQ__"
            alt="Set Completed image"
            className="w-72 h-72 rounded-3xl"
          />
          <button
            onClick={() => window.location.reload(true)}
            className="default-btn"
          >
            Review Again
          </button>
        </div>
      )}
    </div>
  );
};
