import { getCurrentUserDetail, getCurrentUserToken } from "../../Auth/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";

const BASE_URL = "https://minflashcards.onrender.com/flashcard/category";

export const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const userId = getCurrentUserDetail().id;
  const token = getCurrentUserToken();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getAll`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${BASE_URL}/delete/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
      );
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div>
      <div className="h-full mt-28 flex flex-col items-center justify-start space-y-3 py-3">
        <h1 className="mb-10 lg:text-[2rem] font-semibold">
          Manage Categories
        </h1>

        {/* Categories */}
        <div className="w-[95%]">
          {categories.map((category) => (
            <div
              key={category.id}
              className="w-full h-14 rounded-xl bg-[#1C2A4A] text-[#D1D9E6] border border-[#2E436D] 
              my-2 px-3 flex items-center justify-between cursor-pointer transition-all duration-200 ease-in-out 
              hover:bg-[#233559] hover:shadow-lg"
            >
              <h1>{category.categoryName}</h1>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(category.id);
                }}
                className="default-btn bg-red-900 hover:bg-red-800 px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
