import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import {
  doLogout,
  getCurrentUserDetail,
  getCurrentUserToken,
  isLoggedIn,
} from "../../Auth/auth";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../Components/ui/alert-dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../components/ui/select";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const profileSelector = useRef(null);
  const [user, setUser] = useState(getCurrentUserDetail());
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const token = getCurrentUserToken();
  const navigate = useNavigate();
  const [login, setLogin] = useState(isLoggedIn());
  const [imageURL, setImageURL] = useState(
    localStorage.getItem("profileImage")
  ); // State for file URL saved in azure
  const [previousImage, setPreviousImage] = useState(null); // State for file name

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("file", file);

    try {
      // Delete the previous image if it exists
      if (previousImage) {
        const deleteResponse = await fetch(
          `https://minflashcards.onrender.com/flashcard/blob/delete-profile?userId=${user.id}&fileName=${previousImage}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        localStorage.removeItem("profileImage");

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error("Failed to delete previous image:", errorText);
          throw new Error("Failed to delete previous image");
        }
      }

      // Update profile image
      const updateResponse = await fetch(
        `https://minflashcards.onrender.com/flashcard/blob/update-profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Failed to update profile image:", errorText);
        throw new Error("Failed to update profile image");
      }

      const { file } = await updateResponse.json(); // returns the fileName
      setPreviousImage(file);

      toast.success("Profile picture updated successfully!");

      // fetching user
      try {
        const response = await fetch(
          `https://minflashcards.onrender.com/flashcard/user/readUser/${user.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        // get url if picture exists
        if (data.profilePicture) {
          const profileUrlResponse = await fetch(
            `https://minflashcards.onrender.com/flashcard/blob/get-profile-url?userId=${user.id}&file=${data.profilePicture}`
          );

          if (!profileUrlResponse.ok) {
            throw new Error("Failed to fetch profile image URL");
          }

          const { url } = await profileUrlResponse.json();
          setImageURL(url);
          localStorage.setItem("profileImage", url);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
      window.location.reload();
    } catch (err) {
      console.error("Error updating profile picture:", err);
      toast.error("Failed to update profile picture");
    }
  };

  const handleProfileSelector = () => {
    profileSelector.current.click();
  };

  const logout = () => {
    doLogout(() => {
      setLogin(false);
      navigate("/");
    });
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      setError("");

      await axios.post(
        `https://minflashcards.onrender.com/flashcard/user/deleteUser/${user.id}`,
        {
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      logout();
      window.location.reload();
    } catch (err) {
      toast.error(error);
      setError(err.response?.data || "Error occurred while deleting account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Settings */}
      <div className="relative mt-32 h-full border border-transparent">
        <h1 className="text-[#ffffff] flex text-3xl font-bold mb-12">
          Settings
        </h1>

        {/* Personal Information */}
        <div className="mb-10">
          <h1 className="text-sm flex font-medium mb-2 text-[#ffffff]">
            Personal Information
          </h1>
          <div className="border border-gray-400 rounded-xl h-72">
            <div className="h-[40%] border-b border-gray-400 flex flex-row items-center gap-10 px-5">
              <span className="relative h-[5rem] w-[5rem] rounded-full flex justify-center items-center bg-yellow-500">
                {imageURL ? (
                  <img
                    src={imageURL}
                    alt={imageURL}
                    className="object-cover rounded-full h-[100%] w-[100%]"
                  />
                ) : (
                  <h1 className="text-3xl font-semibold select-none">
                    {user.uniqueUsername.slice(0, 1).toUpperCase()}
                  </h1>
                )}
                <FontAwesomeIcon
                  onClick={handleProfileSelector}
                  className="border-2 border-[#15171a] absolute right-0 bottom-0 p-1 rounded-full bg-blue-500 cursor-pointer"
                  icon={faPlus}
                />
                <input
                  type="file"
                  name="profile-picture-selector"
                  className="hidden"
                  ref={profileSelector}
                  onChange={handleImageChange}
                />
              </span>
              <h1 className="font-medium text-[#ffffff] text-xl">
                Profile Picture
              </h1>
            </div>
            <div className="h-[30%] border-b border-gray-400 flex flex-row items-center justify-between px-6">
              <div className="flex flex-col items-start">
                <h1 className="font-medium text-sm">Username</h1>
                <h1 className="text-[#dad6d6] font-medium text-sm">
                  {user.uniqueUsername}
                </h1>
              </div>
            </div>
            <div className="h-[30%] flex flex-row items-center justify-between px-6">
              <div className="flex flex-col items-start">
                <h1 className="font-medium text-sm">Email</h1>
                <h1 className="text-[#dad6d6] font-medium text-sm">
                  {user.email}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        {/* <div className="mb-10">
          <h1 className="flex font-semibold mb-2 text-[#ffffff]">Appearance</h1>
          <div className="border border-gray-400 rounded-xl h-20">
            <div className="h-full border-gray-400 flex flex-row items-center justify-between px-6">
              <h1 className="text-md font-semibold">Theme</h1>
              <Select className="absolute z-50">
                <SelectTrigger className="select-none w-[180px]">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent className="bg-[#2e2c2c]">
                  <SelectItem
                    className="bg-[#2e2c2c] cursor-pointer hover:bg-[#252424] text-[#fff]"
                    value="light"
                  >
                    Light
                  </SelectItem>
                  <SelectItem
                    className="bg-[#2e2c2c] cursor-pointer hover:bg-[#252424] text-[#fff]"
                    value="dark"
                  >
                    Dark
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div> */}

        {/* Account and Privacy */}
        <div className="mb-10">
          <h1 className="flex font-medium text-sm mb-2 text-[#ffffff]">
            Account
          </h1>
          <div className="border border-gray-400 rounded-xl h-20">
            <div className="h-full border-gray-400 flex flex-row items-center justify-between px-6">
              <h1 className="font-medium text-sm">Delete your account</h1>

              {/* Trigger Button */}
              {/* Trigger Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="font-medium text-xs border border-gray-400 focus:border-2 py-2 px-4 rounded-lg bg-red-900">
                    Delete Account
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#15171a] border border-gray-700 rounded-lg shadow-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white text-xl font-bold">
                      Enter your password
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription className="w-full border border-gray-600 py-2 px-3 rounded-lg mt-4">
                    <input
                      className="bg-transparent outline-none w-full text-gray-300 placeholder-gray-500"
                      autoComplete="off"
                      type="password"
                      placeholder="••••••••"
                      name="password-confirm"
                      value={password} // Controlled input for password
                      onChange={(e) => setPassword(e.target.value)} // Update password state
                    />
                  </AlertDialogDescription>
                  <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg ml-2 transition-colors"
                      onClick={handleDeleteAccount} // Call the delete function on click
                      disabled={isLoading} // Disable the button while loading
                    >
                      {isLoading ? "Deleting..." : "Continue"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
