const { ApolloError } = require("apollo-server-core");
const Lobby = require("../../models/lobby");

module.exports = {
  Query: {
    async getLobby(_, { id, userId }) {
      try {
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
        console.log("error", error.message);
        throw new ApolloError(error.message);
      }
    },
  },
};
