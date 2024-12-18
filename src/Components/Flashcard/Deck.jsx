import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./Card";
import "./card.css";
import { getCurrentUserDetail, getCurrentUserToken } from "../../Auth/auth";
import { axiosInstance } from "../../Services/UserService";
import { toast } from "react-hot-toast";
import { DeckContext } from "../../Context/DeckProvider";
import { Loader2 } from "lucide-react";
import { Button } from "../../Components/ui/button";
import axios from "axios";

const generateUniqueId = () => "_" + Math.random().toString(36).substr(2, 9);

export const Deck = () => {
  const navigate = useNavigate();
  const { updateDeckId } = useContext(DeckContext);
  const [user, setUser] = useState(getCurrentUserDetail());
  const token = getCurrentUserToken();
  const [imageName, setImageName] = useState(null);
  const [deckId, setDeckId] = useState(
    sessionStorage.getItem("currentDeckId") || null
  );

  const [deck, setDeck] = useState({
    id: generateUniqueId(),
    title: "",
    description: "",
    cards: [
      {
        id: generateUniqueId(),
        term: "",
        definition: "",
        image: null,
        file: null,
        renderedImage: null,
      },
    ],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      if (deckId === "null") return;

      try {
        const response = await fetch(
          `http://localhost:9030/flashcard/edit/getDeck/${deckId}?userId=${user.id}`,
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

        setDeck({
          id: fetchedDeck?.id,
          title: fetchedDeck?.title,
          description: fetchedDeck?.description,
          cards: fetchedDeck.cards.map((card) => ({
            id: card?.id,
            term: card?.term,
            definition: card?.definition,
            image: card?.image,
          })),
        });
      } catch (error) {
        console.error("Error fetching deck:", error);
      }
    };

    fetchDeck();
  }, [deckId, user.id, token]);

  const handleImageUpload = async (fileName, file, cardId, readerResult) => {
    if (deckId !== "null") {
      try {
        await handleImageUpdate(cardId, file);
      } catch (error) {
        console.error("Error updating image during upload:", error);
        toast.error("Error updating image");
        return;
      }
    }

    try {
      setDeck((prevDeck) => ({
        ...prevDeck,
        cards: prevDeck.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                image: fileName,
                file: file,
                renderedImage: readerResult,
              }
            : card
        ),
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error setting deck state during image upload:", error);
      toast.error("Error uploading image");
    }
  };

  const getCard = async (cardId) => {
    return await fetch(
      `http://localhost:9030/flashcard/edit/getCard?deckId=${deckId}&cardId=${cardId}`
    );
  };

  const handleImageDelete = async (cardId) => {
    try {
      const getCardRes = await getCard(cardId);
      const cardRes = await getCardRes.json();

      return await axiosInstance.delete(
        `blob/delete?userId=${user.id}&deckId=${deckId}&cardId=${cardId}&fileName=${cardRes.image}`
      );
    } catch (e) {
      console.error("Error Deleting Image:", e);
    }
  };

  const handleImageUpdate = async (cardId, file) => {
    try {
      // Delete the existing image first to avoid duplicate files
      await handleImageDelete(cardId);

      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("deckId", deckId);
      formData.append("cardId", cardId);
      formData.append("file", file);

      await axiosInstance.put(`/blob/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Image Updated Successfully");
    } catch (err) {
      console.error("Error Updating Image:", err);
      toast.error("Error Updating Image");
    }
  };

  const handleDeckChange = (field, value) => {
    setDeck((prevDeck) => ({ ...prevDeck, [field]: value }));
  };

  const handleCardChange = (cardId, field, value) => {
    setDeck((prevDeck) => ({
      ...prevDeck,
      cards: prevDeck.cards.map((card) =>
        card.id === cardId ? { ...card, [field]: value, isUpdated: true } : card
      ),
    }));
  };

  // adds a new card if the deck already exists then API is called
  const addCard = async () => {
    const newCard = {
      id: generateUniqueId(),
      term: "",
      definition: "",
      image: null,
    };

    if (deckId !== "null") {
      try {
        const token = getCurrentUserToken();

        if (!token) {
          console.error("No token available. Authorization is required.");
          return;
        }

        const response = await axios.post(
          `http://localhost:9030/flashcard/edit/createCard/${deckId}`,
          {
            term: newCard.term,
            definition: newCard.definition,
            image: newCard?.image ? newCard?.image : "null",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const createdCard = response.data;
        setDeck((prevDeck) => ({
          ...prevDeck,
          cards: [...prevDeck.cards, createdCard],
        }));
        toast.success("Card added successfully");
      } catch (error) {
        toast.error("Failed to add card");
        console.error("Error adding card:", error);
      }
    } else {
      // If deckId is invalid, add the card locally
      setDeck((prevDeck) => ({
        ...prevDeck,
        cards: [...prevDeck.cards, newCard],
      }));
    }
  };

  useEffect(() => {
    const handleKeyPress = async (event) => {
      const activeElement = document.activeElement;

      const isInputActive =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable;

      if (isInputActive) {
        return;
      }

      if (event.key === "N" || event.key === "n") {
        event.preventDefault();
        await addCard();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [addCard]);

  // delete card method
  const deleteCard = async (cardId) => {
    if (deck.cards.length > 1) {
      if (deckId !== "null") {
        try {
          await deleteCardRequest(deckId, cardId);
          setDeck((prevDeck) => ({
            ...prevDeck,
            cards: prevDeck.cards.filter((card) => card.id !== cardId),
          }));
          toast.success("Card deleted successfully");
        } catch (error) {
          toast.error("Failed to delete card");
          console.error("Error deleting card:", error);
        }
      } else {
        // For decks not saved to the database, just update locally
        setDeck((prevDeck) => ({
          ...prevDeck,
          cards: prevDeck.cards.filter((card) => card.id !== cardId),
        }));
      }
    } else {
      toast.error("Card can't be deleted");
    }
  };

  // delete card API request
  const deleteCardRequest = async (deckId, cardId) => {
    await axiosInstance.delete(`/edit/delete/${deckId}/${cardId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  };

  // on save handle
  const handleSave = async () => {
    setLoading(true);
    let allCardsValid = true;

    deck.cards.forEach((card) => {
      if (!card.term || !card.definition) {
        allCardsValid = false;
      }
    });

    if (allCardsValid) {
      try {
        if (deckId !== "null") {
          await updateDeck(deckId, deck.title, deck.description);

          const cardPromises = deck.cards.map((card) =>
            card.isUpdated
              ? updateCard(
                  deckId,
                  card.id,
                  card.term,
                  card.definition,
                  card.image
                )
              : null
          );

          await Promise.all(cardPromises.filter(Boolean));
          toast.success("Deck updated successfully");
          navigate(`/user/review/${deckId}`);
          window.location.reload(true);
        } else {
          const deckResponse = await createDeck(deck.title, deck.description);

          const newDeckId = deckResponse.data.id;

          const cardPromises = deck.cards.map((card) =>
            createCard(newDeckId, {
              term: card.term,
              definition: card.definition,
              image: card.image,
              file: card.file,
            })
          );

          await Promise.all(cardPromises);
          updateDeckId(newDeckId);

          toast.success("Set saved successfully");
          navigate(`/user/review/${newDeckId}`);
          window.location.reload(true);
        }
      } catch (error) {
        toast.error("Error saving the set");
        console.error("Error saving deck or cards:", error);
      }
    } else {
      toast.error("Set cannot be empty");
    }
    setLoading(false);
  };

  // update existing deck
  const updateDeck = async (deckId, title, description) => {
    return await axiosInstance.put(
      `/edit/updateDeck/${user.id}/${deckId}`,
      { title, description },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
  };

  // update existing card
  const updateCard = async (deckId, cardId, term, definition, image) => {
    return await axiosInstance.put(
      `/edit/update/${deckId}/${cardId}`,
      { term, definition, image },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
  };

  // create new deck
  const createDeck = async (title, description) => {
    return await axiosInstance.post(
      `/edit/createDeck/${user.id}`,
      { title, description },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
  };

  // create new card with image
  const createCard = async (deckId, cardData) => {
    const formData = new FormData();
    formData.append("deckId", deckId);
    formData.append("term", cardData?.term);
    formData.append("definition", cardData?.definition);
    formData.append("image", cardData?.image);

    // Append the file only if it exists
    if (cardData.file) {
      formData.append("file", cardData?.file);
    }

    try {
      const response = await axiosInstance.post(
        `/edit/createCardWithImage`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      return response.data; // Return the created card data
    } catch (error) {
      console.error("Error creating card:", error);
      throw error;
    }
  };

  return (
    <div className="mt-32 h-full">
      <div className="flex h-12">
        <h1 className="text-3xl font-semibold">
          {deckId !== "null" ? `Edit Set` : `Create Set`}
        </h1>
      </div>
      <div className="rounded-lg bg-gradient-to-br from-[#1B2B5A] to-[#152243] text-[#fff] min-h-52 h-auto flex flex-col pb-3">
        <div className="border-b border-[#000725] h-9 flex items-center px-6">
          <span className="font-normal text-sm">Set</span>
        </div>
        <div className="space-y-5 px-5 flex flex-col">
          <div className="flex flex-col pt-2">
            <span className="font-medium text-[13px] px-1 flex">Title</span>
            <input
              type="text"
              placeholder="Enter Title"
              value={deck.title}
              onChange={(e) => handleDeckChange("title", e.target.value)}
              className="focus:bg-[#2A3E5C] text-[#d2d8da] text-sm px-1 h-10 w-full bg-transparent focus:outline-none focus:border-b-2"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-[13px] flex pb-2 px-1">
              Description
            </span>
            <textarea
              placeholder="Enter Description"
              value={deck.description}
              onChange={(e) => handleDeckChange("description", e.target.value)}
              className="focus:bg-[#2A3E5C] text-[#d2d8da] text-sm px-1 h-20 w-full bg-transparent focus:outline-none focus:border-b-2 resize-none"
            />
          </div>
        </div>
      </div>
      <div>
        {deck.cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            onCardChange={handleCardChange}
            deleteCard={deleteCard}
            addCard={addCard}
            index={index}
            handleImageUpload={handleImageUpload}
          />
        ))}
        <div className="flex justify-center">
          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading}
            className={`default-btn ${loading ? "opacity-50" : ""}`}
          >
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Saving..." : "Save Set"}
          </Button>
        </div>
      </div>
    </div>
  );
};
