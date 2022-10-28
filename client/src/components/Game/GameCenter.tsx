import { Box, Button } from "@mui/material";
import React from "react";
import useCommonData from "../../Hooks/useCommonData";
import useGame from "../../Hooks/useGame";

const GameCenter = () => {
  const { game } = useCommonData();
  const {
    getCardName,
    checkFirstCard,
    handleCheckCard,
    handlePlayCard,
    handleTakeCard,
  } = useGame();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <img
          alt="spare cards"
          className="card uno-spare"
          src="/cards/cardBg.png"
          onClick={() => handleCheckCard()}
        />
        <img
          alt="latest card"
          className="card uno-spare"
          src={getCardName(game?.centerCards?.latestCard)}
        />
      </Box>
      <Box
        sx={{
          minHeight: "150px",
          mt: 2,
          width: "200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {checkFirstCard && (
          <>
            <Box sx={{ mb: 2 }}>
              <Button
                onClick={() => handleTakeCard(1)}
                sx={{ mx: 1 }}
                variant={"contained"}
              >
                Weź
              </Button>
              <Button
                onClick={() => handlePlayCard(checkFirstCard)}
                sx={{ mx: 1 }}
                variant={"contained"}
              >
                Zagraj
              </Button>
            </Box>
            <img
              alt="check first card img"
              className="card"
              src={getCardName(checkFirstCard)}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default GameCenter;
