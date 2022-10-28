const { default: mongoose } = require("mongoose");
const Lobby = require("../models/lobby");
const User = require("../models/user");
const Game = require("../models/game");
const { shuffle, cards, getTurn, reShuffleCards } = require("../cards");

let codeLength = 6;
let startingWithCards = 6;

function genCode(length) {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getCurrentDate() {
  return new Date()
    .toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
    })
    .split(", ")[1];
}

function handleConnection(io, socket) {
  socket.on("rejoin", (data) => {
    console.log("rejoin", data);
    socket.join(data.id);
  });
  socket.on("create-lobby", async (data, callBackFunc) => {
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
  });
  socket.on("join-lobby", async (data, callBackFunc) => {
    console.log("join lobby", data);
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
      console.log("error", error.message);
      callBackFunc({ message: error.message, type: "error" });
    }
  });
  socket.on("start-game", async (data, callBackFunc) => {
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
  });

  socket.on("play-card", async (data, callBackFunc) => {
    try {
      console.log("PLAY CARD", data);
      let game = await Game.findById(data.gameId);
      let playerIndex = game.players.findIndex((el) => el.id === data.userId);

      function takeCardFromPlayer() {
        if (!data.middle) {
          let indexes = data.cards.map((el) => el.cardIndex);
          game.players[playerIndex].cards = game.players[
            playerIndex
          ].cards.filter((el, index) => {
            return !indexes.includes(index);
          });
        } else if (data.middle) {
          game.spareCards.shift();
        }
      }

      //checkTurn
      if (game.turn !== data.userId) {
        throw new Error("To nie twój ruch.");
      }

      //CheckCards
      if (!game.specialActive) {
        console.log("CHECK 1", game.specialActive, data.cards.length);
        if (data.cards.length > 1) {
          console.log("CHECK 2");
          if (data.cards.length > 4 || data.cards.length < 3)
            throw new Error("Błędna ilość kart");
          if (
            game.centerCards[game.centerCards.length - 1].value ===
              data.cards[0].value ||
            game.centerCards[game.centerCards.length - 1].color ===
              data.cards[0].color
          ) {
            throwCardMid();
          } else {
            throw new Error("Pierwsza karta nie pasuje");
          }
        } else {
          console.log("CHECK 3");
          if (
            game.centerCards[game.centerCards.length - 1].value ===
              data.cards[0].value ||
            game.centerCards[game.centerCards.length - 1].color ===
              data.cards[0].color ||
            data.cards[0].value === "color" ||
            data.cards[0].value === "+4"
          ) {
            console.log("CHECK 4");
            if (data.cards[0].special && data.cards[0].value !== "rev") {
              if (data.cards[0].value === "+2") {
                game.onPlus += 2;
              }
              if (data.cards[0].value === "stop") {
                game.onPlus += 1;
              }
              if (data.cards[0].value === "+4") {
                game.onPlus += 4;
              }
              game.specialActive = true;
              callBackFunc(null, {
                specialActive: game.specialActive,
                onPlus: game.onPlus,
              });
            }
            console.log("CHECKKKKK");
            takeCardFromPlayer();
          } else {
            throw new Error("Ta karta nie pasuje");
          }
        }
      } else if (game.specialActive) {
        switch (game.centerCards[game.centerCards.length - 1].value) {
          case "stop":
            if (data.cards[0].value !== "stop") {
              throw new Error("Ta karta nie pasuje");
            }
            game.onPlus += 1;
            break;
          case "+2":
            if (data.cards[0].value !== "+2" && data.cards[0].value !== "+4") {
              throw new Error("Ta karta nie pasuje");
            }
            if (data.cards[0].value === "+4") game.onPlus += 4;
            if (data.cards[0].value === "+2") game.onPlus += 2;
            break;
          case "+4":
            if (
              data.cards[0].value === "+4" ||
              (data.cards[0].value === "+2" &&
                data.cards[0].color ===
                  game.centerCards[game.centerCards.length - 1].color)
            ) {
              if (data.cards[0].value === "+4") game.onPlus += 4;
              if (data.cards[0].value === "+2") game.onPlus += 2;
            } else {
              throw new Error("Ta karta nie pasuje");
            }
            takeCardFromPlayer();
        }
      }

      console.log("to tu jednak raczej");
      callBackFunc(null, "");

      console.log("to tu jednak");
      //Points
      let multiplier = 3;
      switch (data.cards[0].value) {
        case "+2":
          game.players[playerIndex].points += 20 * multiplier;
          break;
        case "stop":
          game.players[playerIndex].points += 25 * multiplier;
          break;
        case "rev":
          game.players[playerIndex].points += 30 * multiplier;
          break;
        case "color":
          game.players[playerIndex].points += 50 * multiplier;
          break;
        case "+4":
          game.players[playerIndex].points += 55 * multiplier;
          break;
        default:
          game.players[playerIndex].points +=
            parseInt(data.cards[0].value) * multiplier;
          break;
      }
      console.log("to tu?");
      //Zmiana ruchu i środkowej karty
      game.centerCards = [...game.centerCards, ...data.cards];
      game.turn = getTurn(game, data.userId);
      console.log("to tu");

      //checkWin
      if (game.players[playerIndex].cards.length === 0) {
        console.log("czy win");
        game.players[playerIndex].points +=
          game.players.length * 1000 - game.winners.length * 1000;
        game.winners.push({
          username: game.players[playerIndex].username,
          points: game.players[playerIndex].points,
        });
      }

      //checkEnd
      if (game.winners.length == game.players.length - 1) {
        game.winners = [
          ...game.winners,
          ...game.players
            .filter((el) => game.winners.includes(el.username) === false)
            .map((el) => {
              return { username: el.username, points: el.points };
            }),
        ];
        game.state = "ended";
        lobby.gameState = "ended";
        lobby.users = lobby.users.map((el) => {
          return { ...el, stillInGame: true };
        });
        lobby.save();
      }
      game.save();

      io.to(`${game._id}`).emit("played-card", {
        user: {
          id: data.userId,
          numberOfCards: game.players[playerIndex].cards.length,
          points: game.players[playerIndex].points,
        },
        playerCards: game.players[playerIndex].cards,
        playedCards: data.cards,
        activatedSpecial: game.specialActive,
        win: game.winners.includes(game.players[playerIndex].id),
        end: game.state === "ended",
        turn: game.turn,
      });
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  });

  socket.on("check-first", async (data, callBackFunc) => {
    try {
      let game = await Game.findById(data.gameId);
      callBackFunc(null, reShuffleCards(game, 1)[0]);
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  });
  socket.on("leave-lobby", async (data, callBackFunc) => {
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
  });
  socket.on("send-lobby-message", async (data, callBackFunc) => {
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
      console.log(error);
      callBackFunc({ message: error.message, type: "error" });
    }
  });
  socket.on("kick-user", async (data, callBackFunc) => {
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
  });
  socket.on("leave-game", async (data, callBackFunc) => {
    try {
      const game = await Game.findById(data.gameId);
      const user = await User.findById(data.userId);
      user.stats.points +=
        game.players[
          game.players.findIndex((el) => el.id === data.userId)
        ].points;
      game.players = game.players.filter((el) => el.id !== data.userId);
      game.save();
      user.save();

      socket.leave(game._id);
      const lobby = await Lobby.findById(game.lobbyId);
      if (lobby) {
        let lobbyUserIndex = lobby.users.findIndex(
          (el) => el.id == data.userId
        );
        lobby.users[lobbyUserIndex].stillInGame = false;
        io.to(`${game.lobbyId}`).emit(
          "user-left-game",
          lobby.users[lobbyUserIndex]
        );
        lobby.save();
        socket.join(`${game.lobbyId}`);
        callBackFunc(null, game.lobbyId);
      } else {
        callBackFunc(null, "");
      }
    } catch (err) {
      callBackFunc({ message: error.message, type: "error" });
    }
  });
  socket.on("take-card", async (data, callBackFunc) => {
    try {
      const game = await Game.findById(data.gameId);

      if (!game) {
        throw new Error("Gra o tym id nie istnieje.");
      }
      if (game.turn !== data.userId) {
        throw new Error("To nie twój ruch.");
      }

      let playerIndex = game.players.findIndex((el) => el.id === data.userId);

      /* if (game.spareCards.length < data.number) {
        if (game.centerCards.length > 1) {
          let newCards = shuffle(
            game.centerCards.slice(0, game.centerCards.length - 2)
          );
          game.centerCards.splice(0, game.centerCards.length - 1);
          game.spareCards = [...game.spareCards, ...newCards];
        }
      } */

      //define how much cards need to take and other vars
      let useNumber = data.number;

      //check IfSpecialIsActive
      if (game.specialActive) {
        let lastCard = game.centerCards[game.centerCards.length - 1];
        if (lastCard.value === "+2" || lastCard.value === "+4") {
          useNumber = game.onPlus;
          game.onPlus = 0;
        }
        if (lastCard.value === "stop") {
          game.players[playerIndex].stopped = game.onPlus;
          game.onPlus = 0;
        }
        game.specialActive = false;
      }

      //check if able to take cards from spare, if not - take from center and reshuffle
      game.spareCards = reShuffleCards(game, useNumber);

      //take cards from spare
      let sliceCards = game.spareCards.slice(0, useNumber);
      game.spareCards.splice(0, useNumber);

      //give spare cards to player
      game.players[playerIndex].cards = [
        ...game.players[playerIndex].cards,
        ...sliceCards,
      ];

      //change turn
      game.turn = getTurn(game, data.userId);

      game.save();
      io.to(`${game._id}`).emit("took-card", {
        user: {
          id: game.players[playerIndex].id,
          numberOfCards: game.players[playerIndex].cards.length,
          stopped: game.players[playerIndex].stopped,
        },
        cards: game.players[playerIndex].cards,
        turn: game.turn,
      });
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  });
}

module.exports = handleConnection;
