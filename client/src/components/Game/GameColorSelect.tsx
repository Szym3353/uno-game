import { Box, Card } from "@mui/material";
import React from "react";

const GameColorSelect = ({
  handleSelColor,
}: {
  handleSelColor: (color: string) => void;
}) => {
  return (
    <Card
      sx={{
        boxShadow: "1px 3px 7px rgba(0,0,0,0.4)",
        position: "absolute",
        left: "50%",
        top: "50%",
        trasnform: "translate(-50%, -50%)",
      }}
    >
      <Box
        sx={{ width: "75px", height: "75px", bgColor: "red" }}
        onClick={() => handleSelColor("red")}
      ></Box>
      <Box
        sx={{ width: "75px", height: "75px", bgColor: "blue" }}
        onClick={() => handleSelColor("blue")}
      ></Box>
      <Box
        sx={{ width: "75px", height: "75px", bgColor: "yellow" }}
        onClick={() => handleSelColor("yellow")}
      ></Box>
      <Box
        sx={{ width: "75px", height: "75px", bgColor: "green" }}
        onClick={() => handleSelColor("green")}
      ></Box>
    </Card>
  );
};

export default GameColorSelect;
