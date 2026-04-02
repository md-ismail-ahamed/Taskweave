const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json("No token, access denied");

  try {
    const verified = jwt.verify(token, "taskweave_secret");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json("Invalid token");
  }
};

//this middleware makes sure that manager can only create tasks and team member cant create tasks. 

const managerOnly = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res.status(403).json("Access denied. Managers only.");
  }
  next();
};

module.exports = {authMiddleware, managerOnly};
