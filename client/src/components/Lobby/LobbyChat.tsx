import React, { useState } from "react";

//Css
import "../../styles/chatbox.css";

//Hooks
import useLobby from "../../Hooks/useLobby";
import useCommonData from "../../Hooks/useCommonData";

//Store
import { chatMessage } from "../../store/lobbySlice";

//Components
import { Button, Card, CardHeader } from "@mui/material";
import { Box } from "@mui/system";
import LobbyChatMessage from "./LobbyChatMessage";

const LobbyChat = () => {
  const [messageInput, setMessageInput] = useState<string>("");
  const { sendMessage } = useLobby();
  let { lobby } = useCommonData();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(messageInput);
    setMessageInput("");
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Card
        sx={{
          boxShadow: "1px 1px 7px rgba(0,0,0,0.4)",
          px: 2,
          maxHeight: "300px",
        }}
      >
        <CardHeader title="chat" />
        <div className="lobby-chat-messages">
          {lobby.lobbyChat
            .slice(0)
            .reverse()
            .map((message: chatMessage, index: number) => (
              <LobbyChatMessage
                key={`messNumb-${index}`}
                message={message}
                lobbyUsers={lobby.users}
              />
            ))}
        </div>
        <form onSubmit={(e) => handleSubmit(e)} className="lobby-chat-form">
          <input
            onChange={(e) => setMessageInput(e.currentTarget.value)}
            className="lobby-chat-input"
            value={messageInput}
          />
          <Button variant="contained" type="submit">
            Wyślij
          </Button>
        </form>
      </Card>
    </Box>
  );
};

export default LobbyChat;
