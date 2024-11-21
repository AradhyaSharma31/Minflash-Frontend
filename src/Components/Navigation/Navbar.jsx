import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faBookmark,
  faArrowRightFromBracket,
  faGear,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Registration } from "../RegistrationPage/Registration";
import {
  doLogout,
  getCurrentUserDetail,
  getCurrentUserToken,
  isLoggedIn,
} from "../../Auth/auth";
import axios from "axios";
import { DeckContext } from "../../../src/Context/DeckProvider";

const API_BASE_URL = "http://localhost:9030/flashcard/edit";

const Navbar = () => {
  const { updateDeckId } = useContext(DeckContext);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [clickProfile, setClickProfile] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [login, setLogin] = useState(isLoggedIn());
  const [currentUser, setCurrentUser] = useState(getCurrentUserDetail());
  const [deck, setDeck] = useState([]);
  const [searchInput, setSearchInput] = useState(""); // Track search input
  const [filteredDecks, setFilteredDecks] = useState([]); // Track matching decks

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleProfileClicks = () => {
    setClickProfile((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setClickProfile(false);
  };

  // close the profile details tab from onWindow click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setClickProfile(false);
      }
    };

    // Add event listener for clicks on the window
    window.addEventListener("click", handleClickOutside);

    return () => {
      // Clean up the event listener when component unmounts
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setScrollPosition(scrollPos);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const searchSets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getAllDecks`);
      const decks = response.data; // API returns decks array
      const allDecks = decks.map((deck) => ({
        DeckId: deck.id,
        UserProfileImage: "",
        title: deck.title,
        totalTerms: deck.cards.length,
      }));
      setDeck(allDecks);
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  };

  // Filter decks based on search input
  useEffect(() => {
    if (searchInput) {
      const filtered = deck.filter((d) =>
        d.title.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredDecks(filtered);
    } else {
      setFilteredDecks([]);
    }
  }, [searchInput, deck]);

  useEffect(() => {
    searchSets();
    setLogin(isLoggedIn());
    setCurrentUser(getCurrentUserDetail());
  }, [login]);

  const logout = () => {
    doLogout(() => {
      setLogin(false);
      navigate("/");
    });
  };

  return (
    <>
      <header className="select-none fixed top-0 left-0 w-full z-50 text-[#F0F4F8] bg-transparent transition-all duration-300 ease-in-out">
        <div
          className={`${
            scrollPosition >= 70 ? "py-4 bg-[#212327]" : "py-6"
          } flex justify-between items-center px-6 md:px-12 lg:px-16 transition-all duration-300 ease-in-out`}
        >
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <img src="../../../public/favicon.ico" alt="icon" />
          </div>

          {/* Deck Explore Search */}
          <div className="w-[50%] flex flex-col relative mx-auto">
            <div className="border border-gray-500 bg-[#13171b] rounded-md overflow-hidden w-full h-[2.4rem] flex flex-row items-center pl-3">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="cursor-pointer"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Look up Sets created by other users"
                className="w-full h-full text-sm py-1 ml-3 bg-[#13171b] outline-none"
              />
            </div>

            {/* Search Dropdown */}
            {searchInput && filteredDecks.length > 0 && (
              <div className="border border-gray-700 absolute top-full left-1/2 transform -translate-x-1/2 w-full h-52 bg-[#13171b] overflow-y-auto overflow-x-hidden shadow-lg rounded-md mt-1 p-2">
                {filteredDecks.map((d) => (
                  <span
                    key={d.DeckId}
                    onClick={() => {
                      updateDeckId(d.DeckId);
                      navigate(`/user/explore/${d.DeckId}`);
                      window.location.reload(true);
                    }}
                    className="overflow-hidden flex flex-row items-center gap-5 w-full h-14 bg-[#1f1f23] text-white px-3 py-2 mb-2 rounded-md hover:bg-[#29292e] transition duration-200 cursor-pointer"
                  >
                    <h1 className="font-semibold lg:text-lg sm:text-sm">
                      {d.title.length > 20
                        ? `${d.title.slice(0, 20)}...`
                        : d.title}
                    </h1>
                    <h1 className="bg-[#865555] rounded-full py-1 px-2 text-[10px]">
                      {d.totalTerms > 1000 ? `1000+` : `Terms: ${d.totalTerms}`}
                    </h1>
                  </span>
                ))}
              </div>
            )}
          </div>

          {login ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={handleProfileClicks}
                className="cursor-pointer border-2 border-[#dbcdcd] rounded-full flex justify-between items-center flex-row w-[5.2rem] pr-4 pl-1 py-1"
              >
                <div className="select-none cursor-pointer h-8 w-8 rounded-full bg-[#a9a9af] text-[#F0F4F8] flex justify-center items-center font-semibold">
                  {currentUser.uniqueUsername.slice(0, 1).toUpperCase()}
                </div>
                <div
                  className={
                    clickProfile
                      ? `mt-1 transition-all ease-in-out duration-75`
                      : undefined
                  }
                >
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    style={{ fontSize: "12px", color: "#dbcdcd" }}
                  />
                </div>
              </div>

              {clickProfile && (
                <div className="absolute right-0 mt-2 w-52 bg-[#1a1a1a] text-white border border-[#a58f8f] rounded-md shadow-lg">
                  <ul className="py-2">
                    <li
                      onClick={() => {
                        handleCloseMenu();
                      }}
                      className="bg-[#0f0f0f] flex flex-row items-center gap-4 px-3 py-2"
                    >
                      <span className="bg-[#271a1a] flex justify-center items-center rounded-full  h-[40px] w-[40px]">
                        {currentUser.uniqueUsername.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="flex flex-col justify-start">
                        <h1 className="text-[12px] font-semibold text-[#e9e3e3] flex justify-start">
                          {currentUser.uniqueUsername}
                        </h1>
                        <h1 className="text-[13px] text-[#cebcbc]">
                          {currentUser.email.length > 18
                            ? `${currentUser.email.slice(0, 18)}...`
                            : currentUser.email}
                        </h1>
                      </span>
                    </li>
                    <li
                      onClick={() => {
                        handleCloseMenu();
                        navigate("/user/sets");
                      }}
                      className="flex flex-row items-center gap-7 px-5 py-2 hover:bg-[#312f2f] cursor-pointer"
                    >
                      <img
                        className="h-[17px] w-[20px]"
                        src="../../../public/card-icon.png"
                        alt=""
                      />
                      Your Sets
                    </li>
                    <li
                      onClick={() => {
                        handleCloseMenu();
                        navigate(`user/${currentUser.uniqueUsername}/profile`);
                      }}
                      className="flex flex-row items-center gap-[30px] px-[22px] py-2 hover:bg-[#312f2f] cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faGear} /> Settings
                    </li>
                    <hr className="border-[#a58f8f]" />
                    <li
                      onClick={() => {
                        handleCloseMenu;
                        logout();
                      }}
                      className="flex flex-row items-center gap-7 px-6 py-2 hover:bg-[#312f2f] cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faArrowRightFromBracket} />
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={openModal}
                className="font-semibold hover:text-[1.15rem] transition-all duration-100 ease-in-out"
              >
                Sign Up
              </button>
              <button
                onClick={openModal}
                className="border border-white bg-white text-black font-semibold py-2 px-4 rounded-full hover:bg-transparent hover:text-white transition duration-200"
              >
                Log in
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Registration Popover */}
      <Registration isOpen={isModalOpen} handleClose={closeModal} />
    </>
  );
};

export default Navbar;
