import { Container } from "@mui/system";
import React, { useEffect } from "react";
import { gql } from "@apollo/client";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

//Components
import {
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LobbyUsers from "../components/Lobby/LobbyUsers";
import LobbyChat from "../components/Lobby/LobbyChat";

//Store
import {
  setLobby,
  lobbyUser,
  userJoined,
  userLeft,
  chatMessage,
  receiveMessage,
} from "../store/lobbySlice";
import { leaveLobby as kickedFromLobby } from "../store/lobbySlice";
import { addError } from "../store/errorSlice";

//Hooks
import useGqlQuery from "../Hooks/useGqlQuery";
import useCommonData from "../Hooks/useCommonData";
import useLobby from "../Hooks/useLobby";

const Lobby = () => {
  const { id } = useParams();
  const { lobby, user, dispatch, navigate } = useCommonData();
  const { leaveLobby, startGame } = useLobby();

  const { loading } = useGqlQuery(
    LOBBY_QUERY,
    { id, userId: user && user.id },
    setLobby
  );

  useEffect(() => {
    socket.on("user-joined", (data: lobbyUser) => {
      dispatch(userJoined(data));
    });
    socket.on("user-left", (data: string) => {
      dispatch(userLeft(data));
    });
    socket.on("starting-game", (data: string) => {
      navigate(`/game/${data}`);
    });
    socket.on("kicking-user", (data: string) => {
      if (user) {
        if (user.id === data) {
          dispatch(kickedFromLobby());
          dispatch(
            addError({
              message: "Zostałeś wyrzucony z pokoju",
              type: "warning",
              action: "changePath",
              path: "/",
            })
          );
        }
      }
    });
    socket.on("lobby-message-receive", (data: chatMessage) => {
      dispatch(receiveMessage(data));
    });
    return () => {
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("kicking-user");
      socket.off("lobby-message-receive");
    };
  }, []);

  return (
    <Container>
      {loading ? (
        <CircularProgress />
      ) : (
        Object.keys(lobby).length > 0 && (
          <Card sx={{ p: 3 }}>
            <Box display="flex" justifyContent={"space-between"} sx={{ mb: 3 }}>
              <CardHeader
                title={`Pokój użytkownika ${lobby.users[0].username}`}
                subheader={`Kod: ${lobby.code}`}
              />
              <Button onClick={leaveLobby} variant="contained">
                Opuść pokój
              </Button>
            </Box>
            <LobbyUsers />
            <LobbyChat />
            <Box sx={{ mt: 5 }}>
              <Button
                onClick={startGame}
                disabled={lobby.users.length === 1}
                variant="contained"
              >
                Rozpocznij grę
              </Button>
            </Box>
          </Card>
        )
      )}
    </Container>
  );
};

export default Lobby;

let LOBBY_QUERY = gql`
  query getLobby($id: String, $userId: String) {
    getLobby(id: $id, userId: $userId) {
      id
      gameState
      gameId
      code
      users {
        username
        id
        host
        stillInGame
      }
      lobbyChat {
        message
        author
        createdAt
        messageType
      }
    }
  }
`;
