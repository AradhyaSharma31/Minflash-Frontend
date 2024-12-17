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

  useEffect(() => {
    const numBlocks = 150;
    const container = containerRef.current;

    for (let i = 0; i < numBlocks; i++) {
      const block = document.createElement("div");
      block.classList.add("block");
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

    // cleanup operation
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
      <span className="font-bold w-full text-[2rem] lg:text-[3.5rem] sm:text-[2.5rem] flex items-center justify-center flex-col">
        <h1>Your ideas, your flashcards.</h1>
        <h1>design flashcards your way!</h1>
      </span>
      <button
        onClick={() => {
          navigate("/user/edit");
          updateDeckId(null);
        }}
        className="flex flex-row items-center space-x-3 hover:text-white hover:bg-[#1e3a65] focus:outline-2 transition-all duration-200 text-black font-semibold bg-blue-100 mt-10 px-5 py-3 rounded-3xl"
      >
        <h1 className="text-sm font-semibold">Create A Set</h1>
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
};
