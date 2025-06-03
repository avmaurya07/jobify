import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { JobProvider } from "./context/JobContext";
import { ApplicationProvider } from "./context/ApplicationContext";
import "./App.css";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobListing from "./pages/JobListing";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import JobDetail from "./pages/JobDetail";
import PostJob from "./pages/PostJob";
import EditJob from "./pages/EditJob";
import UserProfile from "./pages/UserProfile";
import Applications from "./pages/Applications";
import JobApplications from "./pages/JobApplications";
import AdminDashboard from "./pages/AdminDashboard";

// Protected route component
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Create app theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#14b8a6",
    },
    background: {
      default: "#f8fafc",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        },
      },
    },
  },
});

// Main App Component
function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <JobProvider>
            <ApplicationProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<JobListing />} />
                  <Route path="jobs/:jobId" element={<JobDetail />} />

                  {/* Protected routes for all authenticated users */}
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="applications"
                    element={
                      <ProtectedRoute roles={["user"]}>
                        <Applications />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected routes for recruiters */}
                  <Route
                    path="post-job"
                    element={
                      <ProtectedRoute roles={["recruiter", "admin"]}>
                        <PostJob />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="edit-job/:jobId"
                    element={
                      <ProtectedRoute roles={["recruiter", "admin"]}>
                        <EditJob />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="job-applications/:jobId"
                    element={
                      <ProtectedRoute roles={["recruiter", "admin"]}>
                        <JobApplications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute roles={["recruiter", "admin"]}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin only routes */}
                  <Route
                    path="admin"
                    element={
                      <ProtectedRoute roles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </ApplicationProvider>
          </JobProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
