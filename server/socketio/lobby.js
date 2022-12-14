const Lobby = require("../models/lobby");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const { shuffle, cards } = require("../cards");

let codeLength = 6;
let startingWithCards = 6;

function getCurrentDate() {
  return new Date()
    .toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
    })
    .split(", ")[1];
}

function genCode(length) {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = (io, socket) => {
  const createLobby = async (data, callBackFunc) => {
    try {
      let userData = await User.findById(data.hostId);
      let newLobby = new Lobby({
        code: genCode(codeLength),
        users: [
          {
            id: data.hostId,
            username: userData.username,
            stillInGame: false,
            host: true,
          },
        ],
        gameState: "waiting",
        status: "private",
        //state: "finished",
        lobbyChat: [
          {
            message: `${userData.username} dołączył do pokoju`,
            author: userData.username,
            createdAt: getCurrentDate(),
            messageType: "system",
          },
        ],
      });

      newLobby.save();
      socket.join(`${newLobby._id}`);
      callBackFunc(null, newLobby._id);
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  const joinLobby = async (data, callBackFunc) => {
    try {
      if (data.code.length > codeLength || data.code.length < codeLength) {
        throw new Error("Niepoprawna długość kodu");
      }
      if (!mongoose.isValidObjectId(data.userId)) {
        throw new Error("Niepoprawny identyfikator użytkownika");
      }
      let lobby = await Lobby.findOne({ code: data.code });
      if (!lobby) throw new Error("Nie istnieje lobby o tym kodzie");
      let user = await User.findById(data.userId);
      if (!user) throw new Error("Użytkownik nie istnieje");

      let newUser = {
        host: false,
        username: user.username,
        id: user._id,
        stillInGame: false,
      };

      lobby.users.push(newUser);
      lobby.save();

      socket.to(`${lobby._id}`).emit("user-joined", newUser);
      socket.join(`${lobby._id}`);

      callBackFunc(null, lobby._id);
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  const startGame = async (data, callBackFunc) => {
    try {
      if (!mongoose.isValidObjectId(data.lobbyId)) {
        throw new Error("Niepoprawny identyfikator pokoju");
      }
      let lobby = await Lobby.findById(data.lobbyId);
      if (!lobby) {
        throw new Error("Pokój nie istnieje");
      }
      if (lobby.users < 2) {
        throw new Error("Za mało graczy aby wystartować grę");
      }

      lobby.gameState = "started";

      let shuffledCards = shuffle(cards);

      function shuffledCardsForUser(index) {
        let returnedValue = [];
        for (let i = 0; i < startingWithCards; i++) {
          returnedValue.push(shuffledCards[i + startingWithCards * index]);
        }
        return returnedValue;
      }

      let gameUsers = lobby.users.map((el, index) => {
        return {
          username: el.username,
          id: el.id,
          cards: shuffledCardsForUser(index),
          stopped: 0,
          points: 0,
        };
      });

      let newGame = new Game({
        lobbyId: lobby._id,
        players: gameUsers,
        spareCards: shuffledCards.slice(
          gameUsers.length * startingWithCards + 2,
          shuffledCards.length
        ),
        centerCards: [shuffledCards[gameUsers.length * startingWithCards + 1]],
        winners: [],
        direction: 1,
        turn: gameUsers[0].id,
        state: "started",
        specialActive: false,
        onPlus: 0,
      });

      await newGame.save();

      lobby.gameId = newGame._id;
      lobby.users = lobby.users.map((el) => ({
        ...el,
        stillInGame: true,
      }));

      callBackFunc(null, newGame._id);
      socket.to(`${lobby._id}`).emit("starting-game", newGame._id);
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  const leaveLobby = async (data, callBackFunc) => {
    try {
      let lobby = await Lobby.findById(data.lobbyId);
      if (lobby.users.length < 2) {
        await Lobby.findByIdAndDelete(data.lobbyId);
        return callBackFunc(null, true);
      }
      lobby.users = lobby.users.filter((user) => user.id !== data.userId);
      if (lobby.users.every((el) => el.host === false)) {
        lobby.users[0].host = true;
      }
      lobby.save();
      callBackFunc(null, true);
      socket.leave(lobby._id);
      socket.to(`${lobby._id}`).emit("user-left", data.userId);
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  const changeLobbyStatus = async (data, callBackFunc) => {
    try {
      if (!mongoose.isValidObjectId(data.lobbyId)) {
        throw new Error("Niepoprawny identyfikator pokoju");
      }
      if (!mongoose.isValidObjectId(data.hostId)) {
        throw new Error("Niepoprawny identyfikator hosta");
      }
      let lobby = await Lobby.findById(data.lobbyId);
      if (
        lobby.users[lobby.users.findIndex((el) => el.id === data.hostId)] &&
        lobby.users[lobby.users.findIndex((el) => el.id === data.hostId)].host
      ) {
        lobby.status = `${lobby.status === "private" ? "open" : "private"}`;

        lobby.save();

        callBackFunc(false, lobby.status);

        return socket
          .to(`${lobby._id}`)
          .emit("changed-lobby-status", lobby.status);
      } else {
        throw new Error("Użytkownik nie jest właścicielem pokoju");
      }
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  const sendLobbyMessage = async (data, callBackFunc) => {
    try {
      if (!mongoose.isValidObjectId(data.lobbyId)) {
        throw new Error("Niepoprawny identyfikator pokoju");
      }
      let lobby = await Lobby.findById(data.lobbyId);
      if (!lobby) {
        throw new Error("Pokój nie istnieje");
      }

      if (data.message.trim() === "") {
        throw new Error("Wiadomość nie może być pusta");
      }

      let newMessage = {
        message: data.message,
        author: data.authorId,
        createdAt: getCurrentDate(),
        messageType: "user",
      };
      lobby.lobbyChat.push(newMessage);
      lobby.save();
      socket.to(`${lobby._id}`).emit("lobby-message-receive", newMessage);
      callBackFunc(null, newMessage);
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  const kickUser = async (data, callBackFunc) => {
    try {
      //Checking if IDs are valid
      if (!mongoose.isValidObjectId(data.userId)) {
        throw new Error("Niepoprawny identyfikator użytkownika");
      }
      if (!mongoose.isValidObjectId(data.lobbyId)) {
        throw new Error("Niepoprawny identyfikator pokoju");
      }
      if (!mongoose.isValidObjectId(data.kickerId)) {
        throw new Error("Niepoprawny identyfikator hosta");
      }

      let lobby = await Lobby.findById(data.lobbyId);
      if (!lobby) {
        throw new Error("Błędny identyfikator lobby");
      }
      if (!lobby.users.find((el) => el.id === data.kickerId)?.host) {
        throw new Error("Tylko właściciel pokoju może wyrzucać użytkowników");
      }

      lobby.users = lobby.users.filter((el) => el.id !== data.userId);
      lobby.save();
      callBackFunc(null, true);
      socket.to(`${lobby._id}`).emit("kicking-user", data.userId);
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  socket.on("create-lobby", createLobby);
  socket.on("join-lobby", joinLobby);
  socket.on("start-game", startGame);
  socket.on("leave-lobby", leaveLobby);
  socket.on("change-lobby-status", changeLobbyStatus);
  socket.on("send-lobby-message", sendLobbyMessage);
  socket.on("kick-user", kickUser);
};
