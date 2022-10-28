import { Box } from "@mui/system";
import React from "react";
import useCommonData from "../../Hooks/useCommonData";
import GamePlayer from "./GamePlayer";

type props = {
  values: number[];
};

const GamePlayersRow = ({ values }: props) => {
  let { game } = useCommonData();

  return (
    <Box display={"flex"} justifyContent={"space-between"}>
      {values.map((el: number) => (
        <GamePlayer
          turn={game.players[el] ? game.turn === game.players[el].id : false}
          player={game.players[el] || undefined}
        />
      ))}
    </Box>
  );
};

export default GamePlayersRow;
