const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: String,
    password: String,
    email: String,
    stats: {
      points: Number,
    },
  },
  { collection: "users" }
);

module.exports = model("User", userSchema);
