import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";

// Set base URL for all axios requests
axios.defaults.baseURL = "http://localhost:5000";

// Add a response interceptor for global error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
