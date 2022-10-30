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
  },
};
