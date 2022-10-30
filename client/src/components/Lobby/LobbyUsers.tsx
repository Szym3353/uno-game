import React from "react";

//Components
import { Button, Paper, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";

//Hooks
import useCommonData from "../../Hooks/useCommonData";
import useLobby from "../../Hooks/useLobby";

//Types
import { lobbyUser } from "../../store/lobbySlice";

const LobbyUsers = () => {
  let { lobby, user } = useCommonData();
  const { kickUser } = useLobby();

  function checkHost() {
    if (user) {
      console.log(user.id);
      let id = user.id;
      if (lobby.users.find((el: lobbyUser) => el.id === id)?.host) {
        return true;
      }
    }
    return false;
  }
  return (
    <Box>
      <Typography sx={{ mb: 2 }}>Gracze {lobby.users.length} / 4</Typography>
      <Stack flexWrap={"wrap"} direction={"row"}>
        {lobby.users.map((el: lobbyUser) => (
          <Paper
            key={el.id}
            sx={{
              width: "100px",
              mx: 1,
              mb: 1,
              p: 2,
              boxShadow: "1px 1px 6px rgba(0,0,0,0.3)",
            }}
          >
            <Typography variant={"h6"}>{el.username}</Typography>
            <Typography sx={{ mb: 2 }} variant="subtitle1">
              Host
            </Typography>
            {checkHost() && (
              <Button onClick={() => kickUser(el.id)} variant="contained">
                Wyrzuć
              </Button>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default LobbyUsers;
