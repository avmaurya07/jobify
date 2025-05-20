import { createContext, useReducer, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Initial state
const initialState = {
  applications: [],
  application: null,
  stats: null,
  loading: true,
  error: null,
};

// Create context
const ApplicationContext = createContext(initialState);

// Reducer
const applicationReducer = (state, action) => {
  switch (action.type) {
    case "GET_APPLICATIONS":
      return {
        ...state,
        applications: action.payload,
        loading: false,
      };
    case "GET_APPLICATION":
      return {
        ...state,
        application: action.payload,
        loading: false,
      };
    case "GET_APP_STATS":
      return {
        ...state,
        stats: action.payload,
        loading: false,
      };
    case "CREATE_APPLICATION":
      return {
        ...state,
        applications: [...state.applications, action.payload],
        application: action.payload,
        loading: false,
      };
    case "UPDATE_APPLICATION":
      return {
        ...state,
        applications: state.applications.map((app) =>
          app._id === action.payload._id ? action.payload : app
        ),
        application: action.payload,
        loading: false,
      };
    case "APPLICATION_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: true,
      };
    default:
      return state;
  }
};

// Provider component
export const ApplicationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(applicationReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Get applications for logged in user (job seeker)
  const getUserApplications = async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: "SET_LOADING" });

      const res = await axios.get("/api/applications/me");

      dispatch({
        type: "GET_APPLICATIONS",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "APPLICATION_ERROR",
        payload: err.response?.data?.msg || "Error fetching your applications",
      });
    }
  };

  // Get applications for a specific job (recruiter)
  const getJobApplications = async (jobId) => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: "SET_LOADING" });

      const res = await axios.get(`/api/applications/job/${jobId}`);

      dispatch({
        type: "GET_APPLICATIONS",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "APPLICATION_ERROR",
        payload:
          err.response?.data?.msg || "Error fetching applications for this job",
      });
    }
  };

  // Create application
  const applyForJob = async (jobId, formData) => {
    try {
      dispatch({ type: "SET_LOADING" });

      const data = { ...formData, job: jobId };
      const res = await axios.post("/api/applications", data);

      dispatch({
        type: "CREATE_APPLICATION",
        payload: res.data,
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: "APPLICATION_ERROR",
        payload: err.response?.data?.msg || "Error submitting application",
      });
      throw err;
    }
  };

  // Update application status (recruiter or admin)
  const updateApplicationStatus = async (id, status, feedback = "") => {
    try {
      dispatch({ type: "SET_LOADING" });

      const res = await axios.put(`/api/applications/${id}`, {
        status,
        feedback,
      });

      dispatch({
        type: "UPDATE_APPLICATION",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "APPLICATION_ERROR",
        payload: err.response?.data?.msg || "Error updating application status",
      });
    }
  };

  // Get application stats (admin only)
  const getApplicationStats = async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: "SET_LOADING" });

      const res = await axios.get("/api/applications/admin/stats");

      dispatch({
        type: "GET_APP_STATS",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "APPLICATION_ERROR",
        payload:
          err.response?.data?.msg || "Error fetching application statistics",
      });
    }
  };

  // Clear errors
  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  return (
    <ApplicationContext.Provider
      value={{
        applications: state.applications,
        application: state.application,
        stats: state.stats,
        loading: state.loading,
        error: state.error,
        getUserApplications,
        getJobApplications,
        applyForJob,
        updateApplicationStatus,
        getApplicationStats,
        clearError,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

// Custom hook to use application context
export const useApplication = () => useContext(ApplicationContext);
