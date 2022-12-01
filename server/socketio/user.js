const { default: mongoose } = require("mongoose");
const User = require("../models/user");
const { usersSockets, sendStatusToFriends } = require("./usersSockets");

module.exports = (io, socket) => {
  const activityStatusChange = async (data, callBackFunc) => {
    console.log(data);
    try {
      let user = await User.findByIdAndUpdate(data.userId, {
        $set: { activityStatus: data.status },
      });
      let checkExistingIndex = usersSockets.findIndex(
        (el) => el.userId === data.userId
      );
      console.log("EXISTING INDEX", checkExistingIndex, socket.id);
      if (checkExistingIndex >= 0) {
        usersSockets.splice(checkExistingIndex, 1);
      }
      if (data.status === "online") {
        usersSockets.push({ userId: data.userId, socketId: socket.id });

        //Emit to all online friends
        sendStatusToFriends(user, "online", io);
      } else {
        sendStatusToFriends(user, "offline", io);
      }
    } catch (error) {
      console.log(error);
      callBackFunc({ message: error.message, type: "error" });
    }
  };
  const sendFriendsRequest = async (data, callBackFunc) => {
    try {
      if (!data.userId || !mongoose.isValidObjectId(data.userId)) {
        throw new Error("Niepoprawny identyfikator użytkownika");
      }
      if (!data.receiverId || !mongoose.isValidObjectId(data.receiverId)) {
        throw new Error("Niepoprawny identyfikator odbiorcy zaproszenia");
      }

      let user = await User.findById(data.userId);

      if (user.friends.find((el) => el.id === data.receiverId)) {
        throw new Error("Zaproszenie zostało już wcześniej wysłane");
      }

      let receiver = await User.findById(data.receiverId);

      let request = {
        status: "request:request",
        friendId: data.userId,
        username: user.username,
      };

      user.friends.push({
        status: "request:waiting",
        friendId: data.receiverId,
        username: receiver.username,
      });
      receiver.friends.push(request);

      await receiver.save();
      await user.save();

      callBackFunc(false, user.friends[user.friends.length - 1]);

      //emit message if receiver is online
      let receiverIndex = usersSockets.findIndex(
        (el) => el.userId === data.receiverId
      );
      if (receiverIndex >= 0) {
        io.to(usersSockets[receiverIndex].socketId).emit(
          "user:friendRequest:receive",
          request
        );
      }
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  const acceptRequest = async (data, callBackFunc) => {
    try {
      if (!data.userId || !mongoose.isValidObjectId(data.userId)) {
        throw new Error("Niepoprawny identyfikator użytkownika");
      }
      if (!data.friendId || !mongoose.isValidObjectId(data.friendId)) {
        throw new Error("Niepoprawny identyfikator znajomego");
      }

      //Update status
      let user = await User.findById(data.friendId);
      user.friends[
        user.friends.findIndex((el) => el.friendId === data.userId)
      ].status = "friend";

      let friend = await User.findById(data.userId);
      friend.friends[
        friend.friends.findIndex((el) => el.friendId === data.friendId)
      ].status = "friend";

      await user.save();
      await friend.save();

      //update sender  friends list
      let receiverIndex = usersSockets.findIndex(
        (el) => el.userId === data.friendId
      );
      if (receiverIndex >= 0) {
        io.to(usersSockets[receiverIndex].socketId).emit(
          "user:friendRequest:accepted",
          {
            ...user.friends[
              user.friends.findIndex((el) => el.friendId === data.friendId)
            ],
            status: "friend",
          }
        );
      }
    } catch (error) {
      console.log(error);
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  const declineRequest = async (data, callBackFunc) => {
    try {
      if (!data.userId || !mongoose.isValidObjectId(data.userId)) {
        throw new Error("Niepoprawny identyfikator użytkownika");
      }
      if (!data.friendId || !mongoose.isValidObjectId(data.friendId)) {
        throw new Error("Niepoprawny identyfikator znajomego");
      }

      //Remove request
      await User.findByIdAndUpdate(data.friendId, {
        $pull: { friends: { friendId: data.userId } },
      });
      await User.findByIdAndUpdate(data.userId, {
        $pull: { friends: { friendId: data.friendId } },
      });

      callBackFunc(false, data.friendId);
    } catch (error) {
      callBackFunc({ message: error.message, type: "error" });
    }
  };

  socket.on("user:activityStatusChange", activityStatusChange);
  socket.on("user:friendRequest:send", sendFriendsRequest);
  socket.on("user:friendRequest:decline", declineRequest);
  socket.on("user:friendRequest:accept", acceptRequest);
};
