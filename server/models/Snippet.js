const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    language: { type: String, required: true }, // ex: "java", "js", "python"
    code: { type: String, required: true },
    description: { type: String, default: "" },
    tags: [{ type: String }],
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Snippet", snippetSchema);
