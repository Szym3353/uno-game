import React from "react";

import { Link as RouterLink } from "react-router-dom";

//Components
import { CircularProgress, Link, Paper, Typography } from "@mui/material";

const LoggedUserInfo = ({
  loading,
  userData,
}: {
  loading: boolean;
  userData: { ranking: number; points: number; username: string };
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        my: 5,
        boxShadow: "1px 1px 6px rgba(0,0,0,0.4)",
        width: "fit-content",
        display: "inline-block",
      }}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Typography variant="h6">{userData.username}</Typography>
          <Typography variant="subtitle1">
            Punkty: {userData.points} | Ranking: #{userData.ranking}
          </Typography>
          <Link display={"block"}>
            <RouterLink to="/stats">Ranking</RouterLink>
          </Link>
          <Link>
            <RouterLink to="/">Edytuj profil</RouterLink>
          </Link>
        </>
      )}
    </Paper>
  );
};

export default LoggedUserInfo;
