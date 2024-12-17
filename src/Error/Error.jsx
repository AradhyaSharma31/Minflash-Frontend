import React from "react";
import errorImage from "../Error/ErrorPageImage.png";
import { useNavigate } from "react-router-dom";

export const Error = () => {
  const navigate = useNavigate();
  return (
    <div className="h-[100vh] space-y-10 flex flex-col justify-center items-center pt-20">
      <img className="w-[500px] h-[500px]" src={errorImage} alt="Error" />
      <button onClick={() => navigate("/")} className="default-btn">
        Go Back
      </button>
    </div>
  );
};
