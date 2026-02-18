require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");          // ✅ add
const authRoutes = require("./routes/authRoutes");
const snippetRoutes = require("./routes/snippetRoutes"); // ✅ add

const app = express();

// middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes); // ✅ add

// test route
app.get("/", (req, res) => {
  res.send("DevSnippet API Running 🚀");
});

// connect DB
connectDB();

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
