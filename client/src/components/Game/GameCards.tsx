import { Card } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import useGame from "../../Hooks/useGame";
import { card } from "../../store/gameSlice";

const GameCards = ({ cards }: { cards?: card[] }) => {
  const { getCardName, handlePlayCard, handleSelect, multipleSelect } =
    useGame();
  return cards ? (
    <Card sx={{ mt: 2 }}>
      <Stack direction={"row"} padding={2}>
        {cards.map((card: card, index: number) => (
          <img
            onClick={() => handlePlayCard(card, index)}
            onContextMenu={(e) => handleSelect(e, index)}
            className={`card card-display-stack ${
              multipleSelect.includes(index) ? "card-selected" : ""
            }`}
            src={getCardName(card)}
          />
        ))}
      </Stack>
    </Card>
  ) : (
    <p>No cards to display</p>
  );
};

export default GameCards;
