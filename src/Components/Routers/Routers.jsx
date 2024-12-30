import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ReviewCard } from "../Flashcard/ReviewCard";
import { Deck } from "../Flashcard/Deck";
import { UserDecks } from "../Flashcard/UserDecks";
import { Main } from "../Main/Main";
import { PrivateRouters } from "./PrivateRouters";
import { Error } from "../../Error/Error";
import { UserProfile } from "../User/UserProfile";
import { getCurrentUserDetail } from "../../Auth/auth";
import { ExploreReviewDeck } from "../Flashcard/ExploreReviewDeck";

export const Routers = () => {
  const [user, setUser] = useState(getCurrentUserDetail());

  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/user" element={<PrivateRouters />}>
          <Route path="edit" element={<Deck />} />
          <Route
            path={`${user?.uniqueUsername}/profile`}
            element={<UserProfile />}
          />

          {/* Dynamically pass the deckId using route parameter */}
          <Route path="review/:deckId" element={<ReviewCard />} />

          <Route path="sets" element={<UserDecks />} />

          {/* Dynamically pass the deckId using route parameter */}
          <Route path="explore/:deckId" element={<ExploreReviewDeck />} />
        </Route>

        <Route path="*" element={<Error />} />
      </Routes>
    </>
  );
};
