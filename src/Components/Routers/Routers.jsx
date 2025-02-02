import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ReviewCard } from "../../Pages/Flashcard/ReviewCard";
import { Deck } from "../../Pages/Flashcard/Deck";
import { UserDecks } from "../../Pages/Flashcard/UserDecks";
import { Main } from "../../Pages/Main/Main";
import { PrivateRouters } from "./PrivateRouters";
import { Error } from "../Error/Error";
import { UserProfile } from "../../Pages/User/UserProfile";
import { getCurrentUserDetail } from "../../Auth/auth";
import { ExploreReviewDeck } from "../../Pages/Flashcard/ExploreReviewDeck";

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

          <Route path="review/:deckId" element={<ReviewCard />} />

          <Route path="sets" element={<UserDecks />} />

          <Route path="explore/:deckId" element={<ExploreReviewDeck />} />
        </Route>

        <Route path="*" element={<Error />} />
      </Routes>
    </>
  );
};
