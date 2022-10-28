const { default: mongoose } = require("mongoose");
const Game = require("../../models/game");
const Lobby = require("../../models/lobby");

module.exports = {
  Query: {
    async getGame(_, { id, userId }) {
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Niepoprawny identyfikator gry");
      }
      let game = await Game.findById(id);
      if (!game) {
        throw new Error("Gra nieistnieje");
      }
      if (!mongoose.isValidObjectId(userId)) {
        throw new Error("Niepoprawny identyfikator użytkownika");
      }

      let filteredPlayersData = game.players.map((playerData) => {
        if (playerData.id === userId) {
          return {
            username: playerData.username,
            id: playerData.id,
            numberOfCards: playerData.cards.length,
            stopped: playerData.stopped,
            cards: playerData.cards,
            points: playerData.points,
          };
        } else {
          return {
            username: playerData.username,
            id: playerData.id,
            stopped: playerData.stopped,
            numberOfCards: playerData.cards.length,
            points: playerData.points,
          };
        }
      });

      let centerCards = {
        latestCard: game.centerCards[game.centerCards.length - 1],
        numberOfCards: game.centerCards.length,
      };

      let spareCards = {
        numberOfCards: game.spareCards.length,
      };

      let lobby = await Lobby.findById(game.lobbyId);
      console.log(lobby, game.lobbyId);

      return {
        id: game._id,
        lobbyId: game.lobbyId,
        players: filteredPlayersData,
        direction: game.direction,
        winners: game.winners,
        centerCards,
        spareCards,
        state: game.state,
        turn: game.turn,
        lobbyChat: lobby.lobbyChat || [],
      };
    },
  },
};
