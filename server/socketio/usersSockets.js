let usersSockets = [];

let sendStatusToFriends = (user, status, io) => {
  user.friends.forEach((friend) => {
    let friendIndex = usersSockets.findIndex(
      (el) => el.userId === friend.friendId
    );
    if (friendIndex === -1) return;
    return io
      .to(usersSockets[friendIndex].socketId)
      .emit("user:activityStatusChange:friend", {
        friendId: user._id,
        status,
      });
  });
};

module.exports = { usersSockets, sendStatusToFriends };
