import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  InputAdornment,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useJob } from "../context/JobContext";

// Common job skills for autocomplete
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

const jobTypes = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
  { value: "Remote", label: "Remote" },
];

const jobStatusOptions = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { getJob, updateJob, job, loading, error } = useJob();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    salary: "",
    jobType: "Full-time",
    skills: [],
    status: "open",
  });

  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch job details when component mounts
    const fetchJobDetails = async () => {
      await getJob(jobId);
    };

    fetchJobDetails();
  }, [jobId, getJob]);

  useEffect(() => {
    // Populate form with job data when job details are fetched
    if (job) {
      setFormData({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        description: job.description || "",
        requirements: job.requirements ? job.requirements.join("\n") : "",
        salary: job.salary || "",
        jobType: job.jobType || "Full-time",
        skills: job.skills || [],
        status: job.status || "open",
      });
      setIsLoading(false);
    }
  }, [job]);

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

  const validateForm = () => {
    const { title, company, location, description } = formData;
    if (!title || !company || !location || !description) {
      setFormError("Please fill in all required fields");
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Convert requirements from string to array
    const requirements = formData.requirements
      .split("\n")
      .filter((req) => req.trim() !== "")
      .map((req) => req.trim());

    try {
      const jobData = {
        ...formData,
        requirements,
      };

      await updateJob(jobId, jobData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating job:", err);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Job Posting
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Update the details of your job posting.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {formError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. Frontend Developer"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company *"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                placeholder="e.g. Acme Corporation"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location *"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g. New York, NY or Remote"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Job Type"
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
              >
                {jobTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Salary (optional)"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="e.g. $60,000 - $80,000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {jobStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description *"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={6}
                required
                placeholder="Describe the job responsibilities and expectations..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                multiline
                rows={4}
                placeholder="Enter each requirement on a new line..."
                helperText="Enter one requirement per line"
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
                    placeholder="Add relevant skills..."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Update Job"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditJob;
