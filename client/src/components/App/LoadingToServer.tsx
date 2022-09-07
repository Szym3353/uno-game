import { Card, CardHeader, CircularProgress } from "@mui/material";
import React from "react";

const LoadingToServer = () => {
  return (
    <Card
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <CircularProgress />
      <CardHeader title={"Łączenie z serwerem..."} />
    </Card>
  );
};

export default LoadingToServer;
