import { Card, CardHeader, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import { player } from "../../store/gameSlice";

const GamePlayer = ({
  player,
  turn,
}: {
  player: player | undefined;
  turn: boolean;
}) => {
  return (
    <Card sx={{ padding: 2, bgcolor: turn ? "#cfee87" : "white" }}>
      {player ? (
        <>
          <Typography>{player.username}</Typography>
          <Stack direction={"row"}>
            {[...Array(player.numberOfCards)].map(() => (
              <img src="/cards/cardBg.png" className="player-small-cards" />
            ))}
          </Stack>
        </>
      ) : (
        ""
      )}
    </Card>
  );
};

export default GamePlayer;
