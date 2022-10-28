import { Button, Card, List, ListItem, ListItemText } from "@mui/material";
import React from "react";

//Hooks
import useCommonData from "../../Hooks/useCommonData";
import useGame from "../../Hooks/useGame";

//Store
import { winner } from "../../store/gameSlice";

const GameEnd = () => {
  const { game } = useCommonData();
  const { handleLeaveGame } = useGame();
  return (
    <Card>
      <List>
        {game.winners.map((user: winner) => (
          <ListItem>
            <ListItemText primary={user.username} secondary={user.points} />
          </ListItem>
        ))}
      </List>
      <Button onClick={handleLeaveGame}>Opuść grę</Button>
    </Card>
  );
};

export default GameEnd;
