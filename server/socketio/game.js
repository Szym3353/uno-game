const Lobby = require("../models/lobby");
const User = require("../models/user");
const Game = require("../models/game");
const { getTurn, reShuffleCards } = require("../cards");

module.exports = (io, socket) => {
  const playCard = async (data, callBackFunc) => {
    try {
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
        if (data.cards.length > 1) {
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
          if (
            game.centerCards[game.centerCards.length - 1].value ===
              data.cards[0].value ||
            game.centerCards[game.centerCards.length - 1].color ===
              data.cards[0].color ||
            data.cards[0].value === "color" ||
            data.cards[0].value === "+4"
          ) {
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

      callBackFunc(null, "");

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

      //Zmiana ruchu i środkowej karty
      game.centerCards = [...game.centerCards, ...data.cards];
      game.turn = getTurn(game, data.userId);

      //checkWin
      if (game.players[playerIndex].cards.length === 0) {
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
  };

  const checkFirst = async (data, callBackFunc) => {
    try {
      let game = await Game.findById(data.gameId);
      callBackFunc(null, reShuffleCards(game, 1)[0]);
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  const leaveGame = async (data, callBackFunc) => {
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
  };

  const takeCard = async (data, callBackFunc) => {
    try {
      const game = await Game.findById(data.gameId);

      if (!game) {
        throw new Error("Gra o tym id nie istnieje.");
      }
      if (game.turn !== data.userId) {
        throw new Error("To nie twój ruch.");
      }

      let playerIndex = game.players.findIndex((el) => el.id === data.userId);

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
  };

  socket.on("check-first", checkFirst);
  socket.on("play-card", playCard);
  socket.on("leave-game", leaveGame);
  socket.on("take-card", takeCard);
};
