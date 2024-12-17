import { React, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faCircleNotch,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import "./card.css";

export const Card = ({
  card,
  onCardChange,
  deleteCard,
  addCard,
  index,
  handleImageUpload,
}) => {
  const [menu, setMenu] = useState(true);

  const handleInputChange = (field, value) => {
    onCardChange(card.id, field, value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const fileName = file.name;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleImageUpload(fileName, file, card.id, reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (card.renderedImage) {
      onCardChange(card.id, "renderedImage", null);
    }
  };

  const handleIconClick = () => {
    setMenu(!menu);
  };

  return (
    <div className="my-10 bg-gradient-to-br from-[#1B2B5A] to-[#152243] text-[#fff] rounded-lg w-[100%] h-52 overflow-hidden">
      <div
        className="border-b border-[#000725] w-[100%] flex items-center justify-between py-6 pr-6 pl-7"
        style={{ height: "calc(20% + 2px)" }}
      >
        <span className="font-medium text-[0.9rem]">{index + 1}</span>
        <div className="space-x-3 flex justify-center items-center flex-row">
          {menu && (
            <div
              id="menu"
              className="bg-[#0D1B2A] w-20 h-[2rem] px-1 flex justify-between items-center rounded-full overflow-hidden"
            >
              <span
                onClick={addCard}
                className="menu--icons cursor-pointer h-[25px] w-[25px] rounded-full flex justify-center items-center"
              >
                <FontAwesomeIcon
                  id="plus"
                  icon={faPlus}
                  style={{
                    fontSize: "15px",
                  }}
                />
              </span>
              <span
                onClick={() => deleteCard(card.id)}
                className="menu--icons cursor-pointer h-[25px] w-[25px] rounded-full flex justify-center items-center"
              >
                <FontAwesomeIcon
                  id="bin"
                  icon={faTrashCan}
                  style={{
                    fontSize: "15px",
                  }}
                />
              </span>
            </div>
          )}
          <FontAwesomeIcon
            onClick={handleIconClick}
            icon={faCircleNotch}
            className={menu && `rotate-180`}
            style={{ color: "#b0bec5", cursor: "pointer" }}
            id="icon"
          />
        </div>
      </div>
      <div
        className="flex flex-row justify-between items-center px-7"
        style={{ height: "calc(80% - 2px)" }}
      >
        <div className="w-[80%] flex flex-row justify-center items-center space-x-6">
          <span className="border-b-2 border-white w-[60%]">
            <input
              type="text"
              placeholder="Enter Term"
              className="focus:bg-[#2A3E5C] text-[#d2d8da] text-sm px-1 h-10 w-[100%] bg-transparent focus:outline-none focus:border-b-2"
              onChange={(e) => handleInputChange("term", e.target.value)}
              value={card.term}
            />
          </span>

          <span className="border-b-2 border-white w-[40%]">
            <input
              type="text"
              placeholder="Enter Definition"
              className="focus:bg-[#2A3E5C] text-[#d2d8da] text-sm px-1 h-10 w-[100%] bg-transparent focus:outline-none focus:border-b-2"
              onChange={(e) => handleInputChange("definition", e.target.value)}
              value={card.definition}
            />
          </span>
        </div>
        <div className="ml-5 h-[40%] w-[6rem] flex items-center justify-center flex-col text-[1.5rem] space-y-2 overflow-hidden">
          <label className="overflow-hidden border-[2px] border-white rounded-2xl border-dashed cursor-pointer h-[100%] w-[100%] flex flex-col justify-center items-center">
            {card.renderedImage ? (
              <img
                src={card.renderedImage}
                alt={card.renderedImage}
                className="object-cover h-[100%] w-[100%]"
                onClick={handleImageClick}
              />
            ) : (
              <>
                <FontAwesomeIcon icon={faImage} style={{ color: "#63E6BE" }} />
                <h1 className="text-[0.60rem] uppercase font-semibold">
                  Upload Image
                </h1>
              </>
            )}
            <input
              type="file"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
