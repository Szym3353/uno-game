import {
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  List,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { LOBBIES_LIST_QUERY } from "../../../Gql/queries";
import useGqlQuery from "../../../Hooks/useGqlQuery";
import SingleLobbyInfo from "./SingleLobbyInfo";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CodeBox from "./CodeBox";

const JoinBox = () => {
  const [page, setPage] = useState<number>(0);
  const { loading, data, refetch } = useGqlQuery(LOBBIES_LIST_QUERY, {
    page,
  });

  useEffect(() => {
    console.log("page", page);
    refetch({ page });
  }, [page]);

  return (
    <Card
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "100",
      }}
    >
      <CardHeader title="Dołącz do pokoju" />
      <List>
        {loading ? (
          <CircularProgress />
        ) : (
          data.getPublicLobbies.map(
            (lobbyInfo: {
              code: string;
              users: number;
              hostUsername: string;
            }) => {
              return <SingleLobbyInfo lobbyInfo={lobbyInfo} />;
            }
          )
        )}
      </List>
      <Button
        onClick={() => setPage((prev: number) => prev - 1)}
        disabled={page < 1}
      >
        <KeyboardArrowLeftIcon />
      </Button>
      <Button onClick={() => setPage((prev: number) => prev + 1)}>
        <KeyboardArrowRightIcon />
      </Button>
      <Divider />
      <CodeBox />
    </Card>
  );
};

export default JoinBox;
