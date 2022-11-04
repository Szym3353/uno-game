const { Schema, model } = require("mongoose");

const lobbySchema = new Schema(
  {
    gameState: String,
    gameId: String,
    code: String,
    status: String,
    lobbyChat: [
      {
        message: String,
        author: String,
        createdAt: String,
        messageType: String,
      },
    ],
    users: [
      {
        host: Boolean,
        username: String,
        id: String,
        stillInGame: Boolean,
      },
    ],
  },
  {
    collection: "lobby",
  }
);

module.exports = model("Lobby", lobbySchema);
