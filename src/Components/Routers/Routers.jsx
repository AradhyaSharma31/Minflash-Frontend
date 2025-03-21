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
import { SetFolder } from "../../Pages/Flashcard/SetFolder";
import { SetFolderPage } from "../../Pages/Flashcard/SetFolderPage";
import { AdminPanel } from "../../Pages/Admin/AdminPanel";
import { ManageCategories } from "../../Pages/Admin/ManageCategories";
import { ManageCategoriesRequests } from "../../Pages/Admin/ManageCategoriesRequests";

export const Routers = () => {
  const [user, setUser] = useState(getCurrentUserDetail());

  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />

        <Route path="user" element={<PrivateRouters />}>
          <Route path="edit" element={<Deck />} />

          <Route
            path={`${user?.uniqueUsername}/profile`}
            element={<UserProfile />}
          />

          <Route path="review/:deckId" element={<ReviewCard />} />

          <Route path="sets" element={<UserDecks />} />

          <Route path="explore/:deckId" element={<ExploreReviewDeck />} />

          <Route path="folder" element={<SetFolder />} />

          <Route path="folder/:folderId" element={<SetFolderPage />} />

          <Route path="admin" element={<AdminPanel />} />

          <Route path="admin/ManageCategories" element={<ManageCategories />} />

          <Route
            path="admin/ManageCategoryRequests"
            element={<ManageCategoriesRequests />}
          />
        </Route>

        <Route path="*" element={<Error />} />
      </Routes>
    </>
  );
};
