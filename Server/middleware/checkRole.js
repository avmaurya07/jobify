// Middleware for checking user roles
module.exports = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Authorization denied" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ msg: "Not authorized to access this resource" });
    }

    next();
  };
};
