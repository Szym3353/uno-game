import React, { useState } from "react";

//Components
import { Paper, Typography, Menu, MenuItem } from "@mui/material";
import { Box, Stack } from "@mui/system";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";

//Hooks
import useCommonData from "../../Hooks/useCommonData";
import useLobby from "../../Hooks/useLobby";
import useFriends from "../../Hooks/useFriends";

//Types
import { lobbyUser } from "../../store/lobbySlice";

const LobbyUsers = () => {
  let { lobby, user } = useCommonData();
  const { kickUser, checkHost } = useLobby();
  const { sendFriendRequest } = useFriends();

  //Hidden menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const open = Boolean(anchorEl);
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(id);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedUserId("");
  };

  const menuKick = () => {
    kickUser(selectedUserId);
    handleClose();
  };

  const menuFriendInvite = () => {
    sendFriendRequest(selectedUserId);
    handleClose();
  };

  return (
    <Box>
      <Typography sx={{ mb: 2 }}>Gracze {lobby.users.length} / 4</Typography>
      <Stack flexWrap={"wrap"} direction={"row"}>
        {lobby.users.map((el: lobbyUser) => (
          <Paper
            key={el.id}
            sx={{
              width: "150px",
              mx: 1,
              mb: 1,
              p: 2,
              pr: 0,
              boxShadow: "1px 1px 6px rgba(0,0,0,0.3)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography variant={"h6"}>{el.username}</Typography>
              {user && user.id !== el.id ? (
                <IconButton onClick={(e) => handleClick(e, el.id)}>
                  <MoreVertIcon />
                </IconButton>
              ) : (
                ""
              )}
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              id={`user-menu-${el.username}`}
            >
              <MenuItem onClick={() => menuFriendInvite()}>
                Dodaj do znajomych
              </MenuItem>
              <MenuItem onClick={() => menuKick()}>Wyrzuć</MenuItem>
            </Menu>
            {el.host && (
              <Typography sx={{ mb: 2 }} variant="subtitle1">
                Host
              </Typography>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default LobbyUsers;
