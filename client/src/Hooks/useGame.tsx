import { useState } from "react";
import { socket } from "../socket";
import { addError, errorType } from "../store/errorSlice";
import { card, leaveGame, player } from "../store/gameSlice";
import useCommonData from "./useCommonData";

export default function useGame() {
  const { user, game, dispatch, navigate } = useCommonData();
  const [checkFirstCard, setCheckFirstCard] = useState<null | card>(null);
  const [colorSelect, setColorSelect] = useState<null | card>(null);
  const [multipleSelect, setMultipleSelect] = useState<number[]>([]);
  const [tempIndexHolder, setTempIndexHolder] = useState<number | undefined>(
    undefined
  );

  function getCardName(card: card) {
    let nameColor = "";
    switch (card.color) {
      case "red":
        nameColor = "cz";
        break;
      case "blue":
        nameColor = "b";
        break;
      case "yellow":
        nameColor = "ż";
        break;
      case "green":
        nameColor = "z";
        break;
      case "black":
        nameColor = "black";
    }

    return `/cards/${card.value}${nameColor}.png`;
  }

  const handleSelect = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    cardIndex: number
  ) => {
    e.preventDefault();

    let playerIndex = game.players.findIndex(
      (el: player) => el.id === ((user && user.id) || "")
    );
    let playerCards = game.players[playerIndex].cards;
    if (!playerCards) return;
    let cardValue = playerCards[cardIndex].value;

    //Unselect if clicked again
    if (multipleSelect.includes(cardIndex)) {
      return setMultipleSelect(
        multipleSelect.filter((el: number) => el !== cardIndex)
      );
    }

    if (multipleSelect.length > 0) {
      if (cardValue !== playerCards[multipleSelect[0]].value) {
        setMultipleSelect([cardIndex]);
      } else {
        if (multipleSelect.length >= 4) {
          return setMultipleSelect((prev) => [
            prev[1],
            prev[2],
            prev[3],
            cardIndex,
          ]);
        }
        setMultipleSelect((prev) => [...prev, cardIndex]);
      }
    } else {
      setMultipleSelect([cardIndex]);
    }
  };

  const handlePlayCard = (card: card, cardIndex?: number | undefined) => {
    if (card.color !== "black") {
      socket.emit(
        "play-card",
        {
          userId: (user && user.id) || "",
          cards: [{ ...card, cardIndex }],
          gameId: game.id,
          middle: cardIndex !== undefined ? false : true,
        },
        (err: errorType) => {
          if (err === null) {
            setCheckFirstCard(null);
            setColorSelect(null);
            setMultipleSelect([]);
            setTempIndexHolder(undefined);
          } else {
            return dispatch(addError(err));
          }
        }
      );
    } else {
      setColorSelect(card);
      setTempIndexHolder(cardIndex);
    }
  };

  const handleTakeCard = (number: number) => {
    socket.emit(
      "take-card",
      {
        number,
        userId: (user && user.id) || "",
        gameId: game.id,
      },
      (err: errorType) => {
        if (err) {
          return dispatch(addError(err));
        }
      }
    );
    setCheckFirstCard(null);
  };

  const handleLeaveGame = () => {
    if (game.state === "ended" && user) {
      socket.emit(
        "leave-game",
        {
          gameId: game.id,
          userId: user.id,
        },
        (err: errorType, res: string) => {
          if (res) {
            navigate(`/lobby/${res}`);
          } else {
            navigate("/");
          }
          if (err) {
            return dispatch(addError(err));
          }
          dispatch(leaveGame());
        }
      );
    }
  };

  const handleCheckCard = () => {
    if (!user) return;
    if (game.turn === user.id) {
      socket.emit(
        "check-first",
        { gameId: game.id, userId: user.id },
        (err: errorType, res: card) => {
          if (err) {
            return dispatch(addError(err));
          }
          if (res) {
            setCheckFirstCard(res);
            console.log("CHECK CARD", res);
          }
        }
      );
    }
  };

  const handleSelColor = (color: string) => {
    if (colorSelect) {
      handlePlayCard({ ...colorSelect, color }, tempIndexHolder);
    }
  };

  return {
    getCardName,
    handlePlayCard,
    handleSelect,
    multipleSelect,
    handleCheckCard,
    checkFirstCard,
    handleTakeCard,
    handleSelColor,
    colorSelect,
    handleLeaveGame,
  };
}
