const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const applicationRoutes = require("./routes/applications");

// Load env vars
dotenv.config();

// Connect to database
mongoose
  .connect(
    "mongodb+srv://avmaurya07:1234@cluster0.laq5peg.mongodb.net/app3?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB Connected to app3..."))
  .catch((err) => console.log(err));

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Jobify API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
