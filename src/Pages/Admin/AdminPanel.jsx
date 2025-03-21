import { React } from "react";
import "../../Styles/userDecks.css";
import { useNavigate } from "react-router-dom";

export const AdminPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full mt-28 flex flex-col items-center justify-start space-y-3 py-3">
      <span>
        <h1 className="mb-10 lg:text-[2rem] font-semibold">Admin Panel</h1>
      </span>

      {/* Categories */}
      <div
        onClick={() => {
          navigate("/user/admin/ManageCategories");
        }}
        className="w-[95%] h-20 rounded-2xl bg-[#1C2A4A] text-[#D1D9E6] border border-[#2E436D]
          my-2 cursor-pointer transition-all duration-200 ease-in-out
          hover:bg-[#233559] hover:shadow-lg"
      >
        <span className="w-full h-[100%] rounded-b-2xl flex justify-start items-center px-3 font-medium text-xl">
          <h1>Manage Categories</h1>
        </span>
      </div>

      {/* Category Requests */}
      <div
        onClick={() => {
          navigate("/user/admin/ManageCategoryRequests");
        }}
        className="w-[95%] h-20 rounded-2xl bg-[#1C2A4A] text-[#D1D9E6] border border-[#2E436D]
          my-2 cursor-pointer transition-all duration-200 ease-in-out
          hover:bg-[#233559] hover:shadow-lg"
      >
        <span className="w-full h-[100%] rounded-b-2xl flex justify-start items-center px-3 font-medium text-xl">
          <h1>Manage Category Requests</h1>
        </span>
      </div>
    </div>
  );
};
