import React from "react";

//Components
import { Container } from "@mui/system";
import {
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Switch,
} from "@mui/material";
import LobbyUsers from "../components/Lobby/LobbyUsers";
import LobbyChat from "../components/Lobby/LobbyChat";

//Store
import { setLobby } from "../store/lobbySlice";

//Hooks
import { useParams } from "react-router-dom";
import useGqlQuery from "../Hooks/useGqlQuery";
import useCommonData from "../Hooks/useCommonData";
import useLobby from "../Hooks/useLobby";
import useLobbySocket from "../Hooks/SocketListeners/useLobbySocket";
import useTitle from "../Hooks/useTitle";

//GQL
import { LOBBY_QUERY } from "../Gql/queries";

const Lobby = () => {
  const { id } = useParams();
  const { lobby, user } = useCommonData();
  const { leaveLobby, startGame, changeStatus, checkHost } = useLobby();

  useTitle(`Lobby ${lobby.users && lobby.users.length}/10`);

  const { loading } = useGqlQuery(
    LOBBY_QUERY,
    { id, userId: user && user.id },
    setLobby
  );

  useLobbySocket();

  return (
    <Container>
      {loading ? (
        <CircularProgress />
      ) : (
        Object.keys(lobby).length > 0 && (
          <Card sx={{ p: 3 }}>
            <Box display="flex" justifyContent={"space-between"} sx={{ mb: 3 }}>
              <Box>
                <CardHeader
                  title={`Pokój użytkownika ${lobby.users[0].username}`}
                  subheader={`Kod: ${lobby.code}`}
                />
                {checkHost() ? (
                  <>
                    <Switch
                      checked={lobby.status === "private"}
                      onChange={changeStatus}
                    />{" "}
                    Prywatny pokój
                  </>
                ) : (
                  <p>{`Pokój ${
                    lobby.status === "open" ? "publiczny" : "prywatny"
                  }`}</p>
                )}
              </Box>
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
