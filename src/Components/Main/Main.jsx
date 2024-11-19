import React, { useContext, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import anime from "animejs";
import "../Main/MainContent.css";
import { DeckContext } from "../../Context/DeckProvider";

export const Main = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { updateDeckId } = useContext(DeckContext);

  // Function to generate random hex colors
  const generateRandomHexColor = (count) => {
    const hexColors = [];
    const getRandomHexValue = () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0");

    for (let i = 0; i < count; i++) {
      const randomHexColor = `#${getRandomHexValue()}${getRandomHexValue()}${getRandomHexValue()}`;
      hexColors.push(randomHexColor);
    }

    return hexColors;
  };

  useEffect(() => {
    // Add blocks to the container
    const numBlocks = 150;
    const container = containerRef.current;
    // const randomHexColors = "#313030";

    for (let i = 0; i < numBlocks; i++) {
      const block = document.createElement("div");
      block.classList.add("block");
      // block.style.backgroundColor = randomHexColors;
      container.appendChild(block);
    }

    // AnimeJS animation for blocks
    const animateBlocks = () => {
      anime({
        targets: ".block",
        translateX: () => anime.random(-500, 500),
        translateY: () => anime.random(-400, 400),
        scale: () => anime.random(1, 3),
        easing: "easeInOutSine",
        duration: 3000,
        delay: anime.stagger(20),
        complete: animateBlocks,
      });
    };

    animateBlocks();

    // Cleanup function to remove blocks on unmount
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <div className="h-full mt-26 flex flex-col justify-center items-center overflow-hidden">
      {/* 3D Animation Container */}
      <div
        ref={containerRef}
        className="container w-screen h-screen absolute inset-0 -z-10"
      />
      {/* Main Content */}
      <span className="font-bold w-full text-[3rem] lg:text-[4rem] flex items-center justify-center flex-col">
        <h1>Hey there, learner!</h1>
        <h1>why are you here bruh?</h1>
      </span>
      <button
        onClick={() => {
          navigate("/user/edit");
          updateDeckId(null);
        }}
        className="flex flex-row items-center space-x-3 hover:text-white focus:bg-[#141313] focus:text-white hover:bg-[#1f1d1d] transition-all duration-200 text-black font-semibold bg-blue-100 mt-10 px-5 py-3 rounded-3xl"
      >
        <h1>Create A Set</h1>
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
};
