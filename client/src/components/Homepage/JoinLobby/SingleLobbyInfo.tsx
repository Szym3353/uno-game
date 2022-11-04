import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import React from "react";

import Group from "@mui/icons-material/Group";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import useLobby from "../../../Hooks/useLobby";

const SingleLobbyInfo = ({
  lobbyInfo,
}: {
  lobbyInfo: {
    code: string;
    users: number;
    hostUsername: string;
  };
}) => {
  const { joinLobby } = useLobby();
  return (
    <ListItem
      onClick={() => joinLobby(lobbyInfo.code)}
      sx={{
        transition: "0.2s",
        "&:hover": { cursor: "pointer", bgcolor: "#dddddd" },
      }}
      secondaryAction={
        <IconButton edge="end">
          <KeyboardArrowRightIcon />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar>
          <Group />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={lobbyInfo.hostUsername}
        secondary={`${lobbyInfo.users} / 4`}
      />
    </ListItem>
  );
};

export default SingleLobbyInfo;
