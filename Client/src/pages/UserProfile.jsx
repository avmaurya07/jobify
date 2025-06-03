import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  Divider,
  Alert,
  MenuItem,
  Chip,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const commonSkills = [
  "JavaScript",
  "React",
  "Node.js",
  "HTML",
  "CSS",
  "TypeScript",
  "Angular",
  "Vue.js",
  "Python",
  "Java",
  "C#",
  ".NET",
  "PHP",
  "Ruby",
  "Go",
  "SQL",
  "NoSQL",
  "MongoDB",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "DevOps",
  "Git",
  "REST API",
  "GraphQL",
  "Agile",
  "Scrum",
  "UI/UX",
  "Figma",
  "Photoshop",
  "Marketing",
  "SEO",
  "Content Writing",
  "Project Management",
  "Communication",
  "Leadership",
  "Problem Solving",
];

const UserProfile = () => {
  const { user, loadUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    resume: "",
    skills: [],
    company: "",
    position: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        resume: user.resume || "",
        skills: user.skills || [],
        company: user.company || "",
        position: user.position || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillsChange = (event, newValue) => {
    setFormData({
      ...formData,
      skills: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData = {
        name: formData.name,
        resume: formData.resume,
        skills: formData.skills,
        company: formData.company,
        position: formData.position,
      };

      // Check if password change is requested
      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError("New passwords do not match");
          setLoading(false);
          return;
        }

        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await axios.put("/api/auth/update", updateData);

      // Reload user data
      loadUser();

      setSuccess(true);

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Avatar
            sx={{ width: 80, height: 80, mr: 3 }}
            alt={user.name}
            src="/static/images/avatar/1.jpg"
          />
          <Box>
            <Typography variant="h4">{user.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>

            {/* Fields based on user role */}
            {user.role === "user" && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Resume Link"
                    name="resume"
                    value={formData.resume}
                    onChange={handleInputChange}
                    placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={commonSkills}
                    value={formData.skills}
                    onChange={handleSkillsChange}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Skills"
                        placeholder="Add your skills..."
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {user.role === "recruiter" && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Save Changes"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfile;
