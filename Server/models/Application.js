const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.ObjectId,
    ref: "Job",
    required: true,
  },
  applicant: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  coverLetter: {
    type: String,
    required: [true, "Please include a cover letter"],
  },
  resume: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "shortlisted", "rejected", "interviewed", "hired"],
    default: "pending",
  },
  feedback: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only apply once to a job
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("Application", ApplicationSchema);
