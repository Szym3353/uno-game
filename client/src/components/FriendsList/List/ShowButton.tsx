import React from "react";
import { Button } from "@mui/material";
import Group from "@mui/icons-material/Group";

const ShowButton = ({
  setShowFriendsList,
}: {
  setShowFriendsList: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <Button
      variant="contained"
      onClick={() => setShowFriendsList((prev: boolean) => !prev)}
    >
      <Group />
    </Button>
  );
};

export default ShowButton;
