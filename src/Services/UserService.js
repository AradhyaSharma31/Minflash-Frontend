import axios from "axios";
import { myAxios } from "./helper";
import { getCurrentUserToken } from "../Auth/auth";

export const signUp = (user) => {
  return myAxios
    .post("/api/v1/auth/register", JSON.stringify(user), {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

export const Login = (loginDetail) => {
  return myAxios
    .post("api/v1/auth/login", JSON.stringify(loginDetail), {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

export const completeRegistration = (email, otp, data) => {
  return myAxios
    .post(`api/v1/auth/complete-registration?email=${email}&otp=${otp}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

// token in auth header

export const axiosInstance = axios.create({
  baseURL: "https://minflashcards.onrender.com/flashcard",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCurrentUserToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Refresh token API call
export const refreshToken = async () => {
  try {
    const token = getCurrentUserToken(); // Get the current user token
    const response = await myAxios.post("/api/v1/auth/refresh", null, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the current token in the request
      },
    });

    if (response.status === 200) {
      const { accessToken } = response.data; // Extract the new access token
      const data = JSON.parse(localStorage.getItem("data")); // Retrieve existing user data from local storage
      data.token = accessToken; // Update the token
      localStorage.setItem("data", JSON.stringify(data)); // Save updated data back to local storage
      return accessToken; // Return the new access token
    } else {
      doLogout(); // Log the user out if the response is not successful
      return null;
    }
  } catch (error) {
    console.error("Error refreshing token:", error); // Log any errors
    return null;
  }
};

// Mechanism for automatic token refresh every hour
let refreshInterval = null;

const startTokenRefresh = () => {
  if (!refreshInterval) {
    refreshInterval = setInterval(async () => {
      const newToken = await refreshToken(); // Automatically refresh the token every hour
      if (!newToken) {
        console.log("Failed to refresh token. User needs to log in again."); // Notify the user
      }
    }, 3600 * 1000); // 3600 seconds in milliseconds
  }
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval); // Stop the token refresh interval if it exists
    refreshInterval = null;
  }
};

// Start the automatic token refresh mechanism
startTokenRefresh();
