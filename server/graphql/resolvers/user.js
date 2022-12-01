const bcrypt = require("bcrypt");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const { UserInputError, ApolloError } = require("apollo-server-express");
const { default: mongoose } = require("mongoose");
const Lobby = require("../../models/lobby");
const Game = require("../../models/game");
const { usersSockets } = require("../../socketio/usersSockets");

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = {
  Query: {
    async getFriends(_, { userId }) {
      try {
        if (!userId || !mongoose.isValidObjectId(userId)) {
          throw new Error("Niepoprawny identyfikator użytkownika");
        }

        let user = await User.findById(userId);

        let friendsList = user.friends.map((el) => ({
          ...el._doc,
          activityStatus: usersSockets.find(
            (sockets) => sockets.userId === el.friendId
          )
            ? "online"
            : "offline",
        }));

        return friendsList;
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
    async getStats(_, { page, id }) {
      let elementsPerPage = 10;
      try {
        if (id) {
          if (!mongoose.isValidObjectId(id)) {
            throw new Error("Niepoprawny identyfikator użytkownika");
          }
        }

        const users = await User.find({});

        let usersSortedList = users.sort(
          (a, b) => b.stats.points - a.stats.points
        );

        if (id) {
          let userIndex = usersSortedList.findIndex((user) => user.id === id);
          return {
            ranking: userIndex + 1,
            points: usersSortedList[userIndex].stats.points,
          };
        }

        return users
          .sort((a, b) => b.stats.points - a.stats.points)
          .slice(elementsPerPage * (page - 1), elementsPerPage * page)
          .map((el, i) => {
            return {
              id: el.id,
              ranking: elementsPerPage * (page - 1) + i + 1,
              points: el.stats.points,
              username: el.username,
            };
          });
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
    async isUserAnywhere(_, { id }) {
      try {
        let returnedValue = { userIn: "" };
        if (!mongoose.isValidObjectId(id)) {
          throw new Error("Niepoprawny identyfikator użytkownika");
        }
        let checkUser = await User.findById(id);
        if (!checkUser) {
          throw new Error("Użytkownik nie istnieje w bazie danych");
        }

        let checkIfInLobby = await Lobby.findOne({ "users.id": id });
        if (checkIfInLobby) {
          returnedValue.userIn = "lobby";
          returnedValue.id = checkIfInLobby._id;
          if ((checkIfInLobby.gameState = "started")) {
            let checkIfInGame = await Game.findOne({ "players.id": id });
            if (checkIfInGame) {
              returnedValue.userIn = "game";
              returnedValue.id = checkIfInGame._id;
            }
          }
        }
        return { ...returnedValue };
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
  },
  Mutation: {
    async login(_, { email, password }) {
      let inputErrors = {};
      if (!email || email.trim() === "") {
        inputErrors.email = "Adres e-mail nie może być pusty";
      }
      if (password === "") inputErrors.password = "Hasło nie może być puste";

      const checkUser = await User.findOne({ email });
      if (!checkUser) {
        inputErrors.email = "Nieprawidłowy email lub hasło";
        inputErrors.password = "Nieprawidłowy email lub hasło";
        throw new UserInputError("Errors", {
          inputErrors,
        });
      }

      const match = await bcrypt.compare(password, checkUser.password);
      if (!match) {
        inputErrors.email = "Nieprawidłowy email lub hasło";
        inputErrors.password = "Nieprawidłowy email lub hasło";
        throw new UserInputError("Errors", {
          inputErrors,
        });
      }

      const token = generateToken(checkUser);

      return {
        token,
      };
    },
    async register(_, { username, email, password, confirmPassword }) {
      let inputErrors = {};
      if (!username || username.trim() === "")
        inputErrors.username = "Nazwa użytkownika nie może być pusta";
      if (!email || email.trim() === "")
        inputErrors.email = "Adres e-mail nie może być pusty";
      if (password === "") inputErrors.password = "Hasło nie może być puste";
      if (confirmPassword !== password) {
        inputErrors.confirmPassword = "Hasła nie są identyczne";
      }

      const usernameCheck = await User.exists({ username });
      if (usernameCheck) {
        inputErrors.username = "Nazwa użytkownika jest już zajęta";
      }

      const emailCheck = await User.findOne({ email });
      if (emailCheck) {
        inputErrors.email = "Adres e-mail jest już zarejestrowany";
      }

      if (Object.keys(inputErrors).length > 0) {
        throw new UserInputError("Errors", { inputErrors });
      }

      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        password,
        username,
        stats: {
          points: 0,
        },
      });

      const res = await newUser.save();
      const token = generateToken(res);
      return {
        token,
      };
    },
  },
};
