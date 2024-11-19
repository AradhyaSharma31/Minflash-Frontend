import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Registration } from "../RegistrationPage/Registration";
import { isLoggedIn } from "../../Auth/auth";

export const PrivateRouters = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      openModal();
    }
  }, [isLoggedIn()]);

  if (isLoggedIn()) {
    return <Outlet />;
  } else {
    return <Registration isOpen={isModalOpen} handleClose={closeModal} />;
  }
};
