import React from "react";
import { useParams } from "react-router-dom";
import { GAME_QUERY } from "../Gql/queries";

//Store
import { player, setGame } from "../store/gameSlice";

//Components
import { CircularProgress, Card } from "@mui/material";
import { Container } from "@mui/system";

//GameComponents
import GameCenter from "../components/Game/GameCenter";
import GamePlayersRow from "../components/Game/GamePlayersRow";
import GameCards from "../components/Game/GameCards";

//Css
import "../styles/game.css";

//Hooks
import useCommonData from "../Hooks/useCommonData";
import useGqlQuery from "../Hooks/useGqlQuery";
import GameColorSelect from "../components/Game/GameColorSelect";
import useGame from "../Hooks/useGame";
import useGameSocket from "../Hooks/SocketListeners/useGameSocket";
import useTitle from "../Hooks/useTitle";

const Game = () => {
  const { id } = useParams();
  let { user, game } = useCommonData();
  let { handleSelColor, colorSelect } = useGame();

  const { loading } = useGqlQuery(
    GAME_QUERY,
    { id, userId: user && user.id },
    setGame
  );

  let playerIndex = game?.players?.findIndex((el: player) => el.cards);

  useGameSocket();
  useTitle(
    `Gra: ${
      game.state === "started"
        ? game.players[
            game.players.findIndex((el: player) => el.id == game.turn)
          ].username
        : ""
    }${game.state === "ended" ? "Gra skończona" : ""}`
  );

  return (
    <Container>
      {loading ? (
        <CircularProgress />
      ) : (
        Object.keys(game).length > 0 && (
          <>
            <Card>
              {colorSelect && (
                <GameColorSelect handleSelColor={handleSelColor} />
              )}
              <GamePlayersRow values={[0, 1]} />
              <GameCenter />
              <GamePlayersRow values={[2, 3]} />
            </Card>
            <GameCards cards={game.players[playerIndex].cards} />
          </>
        )
      )}
    </Container>
  );
};

export default Game;
