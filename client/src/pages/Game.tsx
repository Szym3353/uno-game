import { Box, Button, Card, CardHeader } from "@mui/material";
import { Container } from "@mui/system";
import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import useGqlQuery from "../Hooks/useGqlQuery";
import gql from "graphql-tag";
import { useParams } from "react-router-dom";
import { setGame } from "../store/gameSlice";
import useCommonData from "../Hooks/useCommonData";

const Game = () => {
  const { id } = useParams();
  let { user } = useCommonData();
  const { loading } = useGqlQuery(
    GAME_QUERY,
    { id, userId: user && user.id },
    setGame
  );
  return (
    <Container>
      <Card>
        <Grid xs={12} spacing={0} container>
          <Grid xs={2}>
            <Card sx={{ border: "1px solid red" }}>
              <CardHeader title="Player" />
            </Card>
          </Grid>
          <Grid xs={2} xsOffset={"auto"}>
            <Card sx={{ border: "1px solid red" }}>
              <CardHeader title="Player" />
            </Card>
          </Grid>
        </Grid>
        <Box>
          <div>karta</div>
          <Box>
            <Button variant="contained">Dobierz kartę</Button>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default Game;

const GAME_QUERY = gql`
  query getGame($id: String, $userId: String) {
    getGame(id: $id, userId: $userId) {
      id
      lobbyId
      state
      turn
      players {
        id
        username
        numberOfCards
        stopped
        points
        cards {
          value
          color
          special
          description
        }
      }
      direction
      winners {
        username
        points
      }
      lobbyChat {
        message
        author
        createdAt
        messageType
      }
      centerCards {
        latestCard {
          color
          value
          special
          description
        }
        numberOfCards
      }
      spareCards {
        numberOfCards
      }
      specialActive
      onPlus
    }
  }
`;
