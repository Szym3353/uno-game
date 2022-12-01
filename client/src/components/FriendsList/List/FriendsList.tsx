import React from "react";
import { friendType } from "../../../store/friendSlice";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
} from "@mui/material";

import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Box } from "@mui/system";
import useFriends from "../../../Hooks/useFriends";

const FriendsList = ({
  friends,
  tabIndex,
}: {
  friends: friendType[];
  tabIndex: number;
}) => {
  const { declineRequest, acceptRequest } = useFriends();
  return (
    <Box sx={{ p: 1, height: "300px" }}>
      {friends.length > 0 ? (
        <List>
          {friends.map((friend: friendType) => (
            <ListItem key={friend.friendId}>
              {tabIndex === 0 && (
                <Box
                  sx={{
                    mr: 3,
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    bgcolor: `${
                      friend.activityStatus === "online" ? "green" : "gray"
                    }`,
                    boxShadow: `0px 0px 6px ${
                      friend.activityStatus === "online" ? "green" : "gray"
                    }`,
                  }}
                ></Box>
              )}
              <ListItemText primary={friend.username} />
              {tabIndex === 1 && (
                <>
                  <IconButton
                    onClick={() => acceptRequest(friend.friendId)}
                    color={"primary"}
                  >
                    <CheckCircleRoundedIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => declineRequest(friend.friendId)}
                    sx={{ ml: 1 }}
                    color={"error"}
                  >
                    <CancelRoundedIcon />
                  </IconButton>
                </>
              )}
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>Lista jest pusta</Typography>
      )}
    </Box>
  );
};

export default FriendsList;
