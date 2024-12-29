import axios from "axios";

export const BASE_URL = "https://minflashcards.onrender.com";

export const myAxios = axios.create({
  baseURL: BASE_URL,
});
