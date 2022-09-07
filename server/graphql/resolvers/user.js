const bcrypt = require("bcrypt");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const { UserInputError, ApolloError } = require("apollo-server-express");
const { default: mongoose } = require("mongoose");
const Lobby = require("../../models/lobby");

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
    async isUserAnywhere(_, { id }) {
      console.log(id);
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
        console.log(checkIfInLobby);
        if (checkIfInLobby) {
          returnedValue.userIn = "lobby";
          returnedValue.id = checkIfInLobby._id;
          if ((checkIfInLobby.gameState = "started")) {
            //tu będzie check czy jest w grze jak będą zrobione
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
