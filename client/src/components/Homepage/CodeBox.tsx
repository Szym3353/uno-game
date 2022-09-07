import React, { useState } from "react";

//Components
import { Button, Card, CardHeader, TextField } from "@mui/material";

//Hooks
import useLobby from "../../Hooks/useLobby";

const CodeBox = () => {
  let { joinLobby } = useLobby();

  let [codeBoxValue, setCodeBoxValue] = useState<string>("");

  return (
    <Card
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        p: 2,
        boxShadow: "1px 2px 6px rgba(0,0,0,0.6)",
        textAlign: "center",
        zIndex: "100",
      }}
    >
      <CardHeader title={"Wprowadź kod"} />
      <TextField
        onChange={(e) => setCodeBoxValue(e.currentTarget.value)}
        sx={{ display: "block", mb: 2 }}
      />
      <Button
        onClick={() => joinLobby(codeBoxValue)}
        variant="contained"
        sx={{ width: "100%" }}
      >
        Dołącz
      </Button>
    </Card>
  );
};

export default CodeBox;
