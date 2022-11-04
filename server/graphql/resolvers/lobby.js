const { ApolloError } = require("apollo-server-core");
const { default: mongoose } = require("mongoose");
const Lobby = require("../../models/lobby");

module.exports = {
  Query: {
    async getLobby(_, { id, userId }) {
      try {
        if (!mongoose.isValidObjectId(id)) {
          throw new Error("Niepoprawny identyfikator lobby");
        }
        let lobby = await Lobby.findById(id);
        if (!lobby) throw new Error("Lobby nie istnieje");
        if (lobby.users.every((el) => el.id !== userId)) {
          throw new Error("Nie należysz do tego lobby");
        }
        return {
          ...lobby._doc,
          id: lobby._id,
        };
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
    async getPublicLobbies(_, { page }) {
      try {
        let lobbiesPerPage = 5;
        if (page < 0) {
          return [];
        }
        let lobbies = await Lobby.find({
          status: "open",
          gameState: "waiting",
        });

        //Check if lobby is not full
        let lobbiesFilteredUsers = lobbies.filter(
          (lobby) => lobby.users.length < 4
        );

        //Check if any lobby exists
        if (lobbiesFilteredUsers.length < 1) {
          return [];
        }

        let filteredLobbies = lobbiesFilteredUsers
          .slice(page * lobbiesPerPage, (page + 1) * lobbiesPerPage)
          .map((lobby) => {
            return {
              users: lobby.users.length,
              code: lobby.code,
              hostUsername:
                lobby.users[lobby.users.findIndex((el) => el.host)].username,
            };
          });

        return filteredLobbies;
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
  },
};
