import React, { useState } from "react";

//Components
import LoggedUserInfo from "../components/Homepage/LoggedUserInfo";
import CodeBox from "../components/Homepage/CodeBox";
import Button from "@mui/material/Button";
import { Card, CardHeader, Container } from "@mui/material";
import { Box } from "@mui/system";

//Store
import { logout } from "../store/userSlice";

//Hooks
import useLobby from "../Hooks/useLobby";
import useCommonData from "../Hooks/useCommonData";
import useTitle from "../Hooks/useTitle";

const Homepage = () => {
  const { createLobby } = useLobby();
  const { dispatch } = useCommonData();
  const [showCodeBox, setShowCodeBox] = useState<boolean>(false);

  useTitle("HomePage");

  return (
    <Container>
      {showCodeBox && <CodeBox />}
      <Card sx={{ p: 2 }}>
        <Box display={"flex"} justifyContent={"space-between"} sx={{ px: 1 }}>
          <CardHeader title={"Uno"} />
          <Button onClick={() => dispatch(logout())} variant="contained">
            Wyloguj
          </Button>
        </Box>
        <LoggedUserInfo />
        <Box>
          <Button onClick={createLobby} variant="contained">
            Stwórz lobby
          </Button>
          <Button
            sx={{ bgcolor: "teal", "&:hover": { bgcolor: "#035e5e" }, mx: 2 }}
            variant="contained"
            onClick={() => setShowCodeBox((prev: boolean) => !prev)}
          >
            Dołącz do lobby
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default Homepage;
