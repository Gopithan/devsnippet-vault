const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: "..." }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
