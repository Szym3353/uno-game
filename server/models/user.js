const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: String,
    password: String,
    email: String,
    activityStatus: String,
    stats: {
      points: Number,
    },
    friends: [
      {
        status: String,
        friendId: String,
        username: String,
      },
    ],
  },
  { collection: "users" }
);

module.exports = model("User", userSchema);
