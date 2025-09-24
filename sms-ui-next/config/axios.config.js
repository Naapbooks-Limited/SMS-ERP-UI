import axios from "axios";
import { signOut } from "next-auth/react";

const baseURL = process.env.NEXT_PUBLIC_SITE_URL + "/api"; // Change this if using a different backend API

export const api = axios.create({
  baseURL,
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Sign out the user
      await signOut({ callbackUrl: '/' });
    }
    return Promise.reject(error);
  }
);
