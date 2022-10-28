import React from "react";
import { chatMessage, lobbyUser } from "../../store/lobbySlice";

type props = {
  message: chatMessage;
  lobbyUsers: lobbyUser[];
};

const LobbyChatMessage = ({ message, lobbyUsers }: props) => {
  return (
    <p className={`lobby-chat-message chat-message-${message.messageType} `}>
      {`[${message.createdAt}] ${
        message.messageType === "user"
          ? lobbyUsers.find((el: lobbyUser) => el.id === message.author)
              ?.username + ":"
          : ""
      }
   ${message.message}`}
    </p>
  );
};

export default LobbyChatMessage;
