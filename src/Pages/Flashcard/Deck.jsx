import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./Card";
import "../../Styles/deck.css";
import { getCurrentUserDetail, getCurrentUserToken } from "../../Auth/auth";
import { axiosInstance } from "../../Services/UserService";
import { toast } from "react-hot-toast";
import { DeckContext } from "../../Context/DeckProvider";
import { Loader2 } from "lucide-react";
import { Button } from "../../Components/ui/button";
import axios from "axios";
import {
  faCross,
  faPlus,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../Components/ui/select";
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

const BASE_URL = "https://minflashcards.onrender.com/flashcard/category";

const generateUniqueId = () => "_" + Math.random().toString(36).substr(2, 9);

export const Deck = () => {
  const navigate = useNavigate();
  const { updateDeckId } = useContext(DeckContext);
  const [user, setUser] = useState(getCurrentUserDetail());
  const token = getCurrentUserToken();
  const [imageName, setImageName] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [deckId, setDeckId] = useState(
    sessionStorage.getItem("currentDeckId") || null
  );

  const [deck, setDeck] = useState({
    id: generateUniqueId(),
    title: "",
    description: "",
    categoryName: "",
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
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchDeck = async () => {
      if (deckId === "null") return;

      try {
        const response = await fetch(
          `https://minflashcards.onrender.com/flashcard/edit/getDeck/${deckId}?userId=${user.id}`,
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
          categoryName: fetchedDeck?.categoryName,
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
      `https://minflashcards.onrender.com/flashcard/edit/getCard?deckId=${deckId}&cardId=${cardId}`
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
          `https://minflashcards.onrender.com/flashcard/edit/createCard/${deckId}`,
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
        } else {
          const deckResponse = await createDeck(
            deck.title,
            deck.description,
            deck.categoryName
          );

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
  const createDeck = async (title, description, categoryName) => {
    return await axiosInstance.post(
      `/edit/createDeck/${user.id}`,
      { title, description, categoryName },
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

  const generateCategoryRequest = async () => {
    try {
      await axios.post(
        `${BASE_URL}/generateRequest/${user.id}`,
        { categoryRequestName: categoryName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error generating category request:", error);
    }
    setCategoryName("");
  };

  // Function to update deck category
  const updateDeckCategory = async (deckId, categoryId, userId) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/updateDeckCategory/${deckId}/${categoryId}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error updating deck category:",
        error.response?.data || error
      );
      throw error;
    }
  };

  // Function to get all categories
  const getAllCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getAll`);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  };

  // Filter cards based on search term
  const filteredCards = deck.cards.filter((card) =>
    card.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-32 h-full">
      <div className="flex h-12">
        <h1 className="text-3xl font-semibold">
          {deckId !== "null" ? `Edit Set` : `Create Set`}
        </h1>
      </div>

      {/* Set Config */}
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

      {/* Filter Search & Category Select */}
      <div className="w-full flex flex-col mt-10">
        <span className="w-full flex border border-[#003366]"></span>

        <div className="flex flex-row justify-between mt-8">
          {/* Category Select */}
          <div className="w-60 px-4 flex items-center bg-[#2a315a] border border-blue-900 rounded-lg">
            <Select
              onValueChange={(selectedValue) => {
                const selectedCategory = categories.find(
                  (cat) => cat.categoryName === selectedValue
                );
                if (selectedCategory) {
                  updateDeckCategory(deckId, selectedCategory.id, user.id);
                }
              }}
              className="w-full"
            >
              <SelectTrigger className="w-full bg-transparent border-none outline-none py-2 text-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#2a315a] border border-blue-900 text-white">
                {/* Request New Category */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="hover:bg-[#3a426e] select-none p-2 text-sm flex flex-row items-center justify-between cursor-pointer rounded-md">
                      <h1>Request New Category</h1>
                      <FontAwesomeIcon icon={faPlus} />
                    </div>
                  </AlertDialogTrigger>

                  {/* Alert Dialog Content */}
                  <AlertDialogContent className="bg-[#15171a] border border-gray-700 rounded-lg shadow-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white text-xl font-bold">
                        Enter Category Name
                      </AlertDialogTitle>
                    </AlertDialogHeader>

                    <AlertDialogDescription className="w-full border border-gray-600 py-2 px-3 rounded-lg mt-4">
                      <input
                        className="bg-transparent outline-none w-full text-gray-300 placeholder-gray-500"
                        autoComplete="off"
                        type="text"
                        placeholder="Category name..."
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                      />
                    </AlertDialogDescription>

                    <AlertDialogFooter className="mt-6">
                      <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                        onClick={generateCategoryRequest}
                        disabled={!categoryName.trim()}
                      >
                        Submit Request
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.categoryName}
                    className="hover:bg-[#3a426e]"
                  >
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="border border-blue-900 w-80 px-4 flex items-center bg-[#2a315a] rounded-lg">
            <input
              type="text"
              placeholder="Search Terms"
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
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="text-gray-400 cursor-pointer"
                  />
                </span>
              )}
              <FontAwesomeIcon icon={faSearch} className="cursor-pointer" />
            </span>
          </span>
        </div>
      </div>

      {/* Card Config */}
      <div>
        {filteredCards.map((card, index) => (
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

        {/* not found image */}
        {filteredCards == 0 && (
          <div className="w-full h-52 flex justify-center my-16 overflow-hidden">
            <img
              src="https://media-hosting.imagekit.io//a75f06debd164e61/not-found1.png?Expires=1833167936&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=H7tpDYQVPldze0Upbgn49Y7Bg72qZREOHNC5uoRlVF2ZuXt~vJ5cI07551lRgArP5vJvM1-Aneg81vo5WBlc-f1UdZ6E84aa9s0ru-OxjWqUDklzRw99cgSmDG4Sma9x8fB7MbJ1uT-D28v~AlMbELGuWUeM6Az27eT1WKWcnkOIAEF9aOUfItJon-bpSsZAUqM-09P6UebvyQTFs7dTyj8l1PK2mIsBiTpEKomsEeKnMoehuct5O8e4LLjUQDReZl734MuWxM1bZJi3aSPlSpoaL5eI8~7~96UVjF5ArLHMjw-0GNLL1ugj3LPO1K3XXQejdvN-OFpPfsvdtbkfLQ__"
              alt="sets not found"
              className="rounded-3xl"
            />
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-center">
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
