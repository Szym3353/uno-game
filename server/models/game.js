const { model, Schema } = require("mongoose");

const gameSchema = new Schema(
  {
    lobbyId: String,
    players: [
      {
        username: String,
        id: String,
        stopped: Number,
        points: Number,
        cards: [
          {
            value: String,
            color: String,
            special: Boolean,
            description: String,
          },
        ],
      },
    ],
    spareCards: [
      {
        value: String,
        color: String,
        special: Boolean,
        description: String,
      },
    ],
    centerCards: [
      {
        value: String,
        color: String,
        special: Boolean,
        description: String,
      },
    ],
    winners: [
      {
        username: String,
        points: Number,
      },
    ],
    direction: Number,
    turn: String,
    specialActive: Boolean,
    onPlus: Number,
  },
  { collection: "game" }
);

module.exports = model("Game", gameSchema);
