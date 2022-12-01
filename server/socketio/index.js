let gameHandler = require("./game");
let lobbyHandler = require("./lobby");
let userHandler = require("./user");
const { usersSockets, sendStatusToFriends } = require("./usersSockets");
const User = require("../models/user");

function handleConnection(io, socket) {
  socket.on("rejoin", (data) => {
    socket.join(data.id);
  });
  lobbyHandler(io, socket);
  gameHandler(io, socket);
  userHandler(io, socket);
  socket.on("disconnect", async () => {
    let userIndex = usersSockets.findIndex((el) => el.socketId === socket.id);
    if (userIndex === -1) return;

    let userId = usersSockets[userIndex].userId;

    await User.findByIdAndUpdate(userId, { activityStatus: "offline" });

    usersSockets.splice(userIndex, 1);
    sendStatusToFriends(user, "offline", io);
  });
}

module.exports = handleConnection;
