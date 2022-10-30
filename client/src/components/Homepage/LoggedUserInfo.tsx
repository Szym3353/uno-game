import React from "react";

import { Link as RouterLink } from "react-router-dom";

//Components
import { Link, Paper, Typography } from "@mui/material";

const LoggedUserInfo = () => {
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
      <Typography variant="h6">Username</Typography>
      <Typography variant="subtitle1">Punkty: 200 | Ranking: #2</Typography>
      <Link display={"block"}>
        <RouterLink to="/stats">Ranking</RouterLink>
      </Link>
      <Link>
        <RouterLink to="/">Edytuj profil</RouterLink>
      </Link>
    </Paper>
  );
};

export default LoggedUserInfo;
