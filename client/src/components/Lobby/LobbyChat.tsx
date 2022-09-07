import {
  Button,
  Card,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import useCommonData from "../../Hooks/useCommonData";
import useLobby from "../../Hooks/useLobby";
import { chatMessage, lobbyUser } from "../../store/lobbySlice";

const LobbyChat = () => {
  const [messageInput, setMessageInput] = useState<string>("");
  const { sendMessage } = useLobby();
  let { lobby } = useCommonData();

  return (
    <Box sx={{ mt: 5 }}>
      <Card sx={{ boxShadow: "1px 1px 7px rgba(0,0,0,0.4)" }}>
        <CardHeader title="chat" />
        <List
          dense={true}
          sx={{
            height: "100px",
            overflow: "scroll",
            overflowX: "hidden",
          }}
        >
          {lobby.lobbyChat.map((message: chatMessage) => (
            <ListItem>
              <ListItemText
                primary={`[${message.createdAt.split("T")[1].split(".")[0]}] ${
                  message.messageType === "user"
                    ? lobby.users.find(
                        (el: lobbyUser) => el.id === message.author
                      )?.username
                    : ""
                }: ${message.message}`}
              />
            </ListItem>
          ))}
        </List>
        <Box display="flex">
          <TextField
            onChange={(e) => setMessageInput(e.currentTarget.value)}
            fullWidth
          />
          <Button
            type="submit"
            onClick={() => sendMessage(messageInput)}
            variant={"contained"}
          >
            Wyślij
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default LobbyChat;
