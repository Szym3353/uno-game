import { Card } from "@mui/material";
import React from "react";

const FriendsListContainer = () => {
  return (
    <Card
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    ></Card>
  );
};

export default FriendsListContainer;
