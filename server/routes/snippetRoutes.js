const express = require("express");
const router = express.Router();

const Snippet = require("../models/Snippet");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * Create snippet
 * POST /api/snippets
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, language, code, description, tags, isFavorite } = req.body;

    const snippet = await Snippet.create({
      userId: req.user.id,
      title,
      language,
      code,
      description,
      tags: Array.isArray(tags) ? tags : [],
      isFavorite: !!isFavorite,
    });

    res.json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/**
 * Get snippets (with optional filters)
 * GET /api/snippets?q=...&language=...&tag=...
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { q, language, tag } = req.query;

    const filter = { userId: req.user.id };

    if (language) filter.language = language;

    if (tag) filter.tags = tag;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { code: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
        { language: { $regex: q, $options: "i" } },
      ];
    }

    const snippets = await Snippet.find(filter).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/**
 * Update snippet
 * PUT /api/snippets/:id
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, language, code, description, tags, isFavorite } = req.body;

    const updated = await Snippet.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        title,
        language,
        code,
        description,
        tags: Array.isArray(tags) ? tags : [],
        isFavorite: !!isFavorite,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Snippet not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/**
 * Toggle favorite
 * PATCH /api/snippets/:id/favorite
 */
router.patch("/:id/favorite", authMiddleware, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!snippet) return res.status(404).json({ message: "Snippet not found" });

    snippet.isFavorite = !snippet.isFavorite;
    await snippet.save();

    res.json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/**
 * Delete snippet
 * DELETE /api/snippets/:id
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Snippet.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Snippet not found" });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
