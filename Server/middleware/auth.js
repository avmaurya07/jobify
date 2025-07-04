const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "jobifycollegeprojectsecret123"
    );

    // Add user from payload
    req.user = decoded;

    // Get user data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(401)
        .json({ msg: "User not found, authorization denied" });
    }

    // Attach role to request
    req.user.role = user.role;

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
