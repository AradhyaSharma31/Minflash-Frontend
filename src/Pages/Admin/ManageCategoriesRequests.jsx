import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCurrentUserDetail, getCurrentUserToken } from "../../Auth/auth";

const BASE_URL = "https://minflashcards.onrender.com/flashcard/category";

export const ManageCategoriesRequests = () => {
  const [categoryRequests, setCategoryRequests] = useState([]);
  const userId = getCurrentUserDetail().id;
  const token = getCurrentUserToken();

  useEffect(() => {
    fetchCategoryRequests();
  }, []);

  const fetchCategoryRequests = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategoryRequests(response.data);
    } catch (error) {
      console.error("Error fetching category requests:", error);
    }
  };

  const implementCategoryRequest = async (requestId) => {
    try {
      await axios.post(
        `${BASE_URL}/create/${userId}/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCategoryRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
    } catch (error) {
      console.error("Error implementing category request:", error);
    }
  };

  return (
    <div>
      <div className="h-full mt-28 flex flex-col items-center justify-start space-y-3 py-3">
        <h1 className="mb-10 lg:text-[2rem] font-semibold">
          Manage Category Requests
        </h1>

        {/* Category Requests */}
        <div className="w-[95%]">
          {categoryRequests.map((request) => (
            <div
              key={request.id}
              className="w-full h-14 rounded-xl bg-[#1C2A4A] text-[#D1D9E6] border border-[#2E436D] 
              my-2 px-3 flex items-center justify-between cursor-pointer transition-all duration-200 ease-in-out 
              hover:bg-[#233559] hover:shadow-lg"
            >
              <h1>{request.categoryRequestName}</h1>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  implementCategoryRequest(request.id);
                }}
                className="default-btn bg-green-700 hover:bg-green-600 px-3 py-1 rounded"
              >
                Implement
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
