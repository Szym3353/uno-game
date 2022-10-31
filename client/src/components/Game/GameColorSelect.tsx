import { Box, Card } from "@mui/material";
import React from "react";

const GameColorSelect = ({
  handleSelColor,
}: {
  handleSelColor: (color: string) => void;
}) => {
  let colors = ["red", "yellow", "blue", "green"];
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
      {colors.map((color: string, index: number) => (
        <Box
          sx={{ width: "75px", height: "75px", bgColor: `${color}` }}
          onClick={() => handleSelColor(`${color}`)}
        ></Box>
      ))}
    </Card>
  );
};

export default GameColorSelect;
