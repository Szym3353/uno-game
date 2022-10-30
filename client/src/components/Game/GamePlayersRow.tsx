import React from "react";

//Components
import GamePlayer from "./GamePlayer";
import { Box } from "@mui/system";

//Hooks
import useCommonData from "../../Hooks/useCommonData";

type props = {
  values: number[];
};

const GamePlayersRow = ({ values }: props) => {
  let { game } = useCommonData();

  return (
    <Box display={"flex"} justifyContent={"space-between"}>
      {values.map((el: number) => (
        <GamePlayer
          key={`playerNumb-${el}`}
          turn={game.players[el] ? game.turn === game.players[el].id : false}
          player={game.players[el] || undefined}
        />
      ))}
    </Box>
  );
};

export default GamePlayersRow;
