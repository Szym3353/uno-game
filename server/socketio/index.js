let gameHandler = require("./game");
let lobbyHandler = require("./lobby");

function handleConnection(io, socket) {
  socket.on("rejoin", (data) => {
    socket.join(data.id);
  });
  lobbyHandler(io, socket);
  gameHandler(io, socket);
}

module.exports = handleConnection;
