import React from "react";
import { socket } from "../socket";
import { errorType } from "../store/errorSlice";

export default function useFriendsList() {
  const friendInvite = (userId: string, receiverId: string) => {
    socket.emit(
      "friend-invite",
      { userId, receiverId },
      (err: errorType, res: boolean) => {}
    );
  };

  return { friendInvite };
}
