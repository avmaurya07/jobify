import { createContext, useReducer, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Initial state
const initialState = {
  jobs: [],
  job: null,
  stats: null,
  loading: true,
  error: null,
};

// Create context
const JobContext = createContext(initialState);

// Reducer
const jobReducer = (state, action) => {
  switch (action.type) {
    case "GET_JOBS":
      return {
        ...state,
        jobs: action.payload,
        loading: false,
      };
    case "GET_JOB":
      return {
        ...state,
        job: action.payload,
        loading: false,
      };
    case "GET_STATS":
      return {
        ...state,
        stats: action.payload,
        loading: false,
      };
    case "CREATE_JOB":
      return {
        ...state,
        jobs: [...state.jobs, action.payload],
        loading: false,
      };
    case "UPDATE_JOB":
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job._id === action.payload._id ? action.payload : job
        ),
        job: action.payload,
        loading: false,
      };
    case "DELETE_JOB":
      return {
        ...state,
        jobs: state.jobs.filter((job) => job._id !== action.payload),
        loading: false,
      };
    case "JOB_ERROR":
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
export const JobProvider = ({ children }) => {
  const [state, dispatch] = useReducer(jobReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Get all jobs
  const getJobs = async (filters = {}) => {
    try {
      dispatch({ type: "SET_LOADING" });

      // Build query parameters
      let queryParams = "";
      if (Object.keys(filters).length > 0) {
        queryParams = "?" + new URLSearchParams(filters).toString();
      }

      const res = await axios.get(`/api/jobs${queryParams}`);

      dispatch({
        type: "GET_JOBS",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "JOB_ERROR",
        payload: err.response?.data?.msg || "Error fetching jobs",
      });
    }
  };

  // Get single job
  const getJob = async (id) => {
    try {
      dispatch({ type: "SET_LOADING" });

      const res = await axios.get(`/api/jobs/${id}`);

      dispatch({
        type: "GET_JOB",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "JOB_ERROR",
        payload: err.response?.data?.msg || "Error fetching job",
      });
    }
  };

  // Get recruiter jobs
  const getRecruiterJobs = async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: "SET_LOADING" });

      const res = await axios.get("/api/jobs/recruiter/myjobs");

      dispatch({
        type: "GET_JOBS",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "JOB_ERROR",
        payload: err.response?.data?.msg || "Error fetching your job postings",
      });
    }
  };

  // Get job statistics
  const getJobStats = async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: "SET_LOADING" });

      const res = await axios.get("/api/jobs/admin/stats");

      dispatch({
        type: "GET_STATS",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "JOB_ERROR",
        payload: err.response?.data?.msg || "Error fetching job statistics",
      });
    }
  };

  // Create job
  const createJob = async (formData) => {
    try {
      dispatch({ type: "SET_LOADING" });

      const res = await axios.post("/api/jobs", formData);

      dispatch({
        type: "CREATE_JOB",
        payload: res.data,
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: "JOB_ERROR",
        payload: err.response?.data?.msg || "Error creating job",
      });
      throw err;
    }
  };

  // Update job
  const updateJob = async (id, formData) => {
    try {
      dispatch({ type: "SET_LOADING" });

      const res = await axios.put(`/api/jobs/${id}`, formData);

      dispatch({
        type: "UPDATE_JOB",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "JOB_ERROR",
        payload: err.response?.data?.msg || "Error updating job",
      });
    }
  };

  // Delete job
  const deleteJob = async (id) => {
    try {
      await axios.delete(`/api/jobs/${id}`);

      dispatch({
        type: "DELETE_JOB",
        payload: id,
      });
    } catch (err) {
      dispatch({
        type: "JOB_ERROR",
        payload: err.response?.data?.msg || "Error deleting job",
      });
    }
  };

  // Clear errors
  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  return (
    <JobContext.Provider
      value={{
        jobs: state.jobs,
        job: state.job,
        stats: state.stats,
        loading: state.loading,
        error: state.error,
        getJobs,
        getJob,
        getRecruiterJobs,
        getJobStats,
        createJob,
        updateJob,
        deleteJob,
        clearError,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

// Custom hook to use job context
export const useJob = () => useContext(JobContext);
