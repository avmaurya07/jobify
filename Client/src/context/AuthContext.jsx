import { createContext, useReducer, useContext, useEffect } from "react";
import axios from "axios";

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  loading: true,
  error: null,
};

// Create context
const AuthContext = createContext(initialState);

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "USER_LOADED":
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "AUTH_ERROR":
    case "LOGIN_FAIL":
    case "REGISTER_FAIL":
    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token
  if (state.token) {
    axios.defaults.headers.common["x-auth-token"] = state.token;
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
  }

  // Load user
  const loadUser = async () => {
    try {
      const res = await axios.get("/api/auth/me");

      dispatch({
        type: "USER_LOADED",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "AUTH_ERROR",
        payload: err.response?.data?.msg || "Authentication failed",
      });
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post("/api/auth/register", formData);

      dispatch({
        type: "REGISTER_SUCCESS",
        payload: res.data,
      });

      loadUser();
    } catch (err) {
      dispatch({
        type: "REGISTER_FAIL",
        payload: err.response?.data?.msg || "Registration failed",
      });
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post("/api/auth/login", formData);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: res.data,
      });

      loadUser();
    } catch (err) {
      dispatch({
        type: "LOGIN_FAIL",
        payload: err.response?.data?.msg || "Invalid credentials",
      });
    }
  };

  // Logout
  const logout = () => dispatch({ type: "LOGOUT" });

  // Clear errors
  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  // Load user on initial app load if token exists
  useEffect(() => {
    if (state.token) {
      loadUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        register,
        login,
        logout,
        clearError,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
