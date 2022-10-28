import { useEffect } from "react";
import { socket } from "../../socket";

//Hooks
import useCommonData from "../useCommonData";

//Store
import {
  updateMiddle,
  updatePlayer,
  updateYoursCards,
} from "../../store/gameSlice";

export default function useGameSocket() {
  const { dispatch, user } = useCommonData();

  useEffect(() => {
    socket.on("played-card", (socketData) => {
      console.log("socketData on played card", socketData);
      dispatch(updatePlayer(socketData.user));
      dispatch(
        updateMiddle(socketData.playedCards[socketData.playedCards.length - 1])
      );

      if (user && user.id === socketData.user.id) {
        dispatch(
          updateYoursCards({ ...socketData.playerCards, id: socketData.userId })
        );
      }
    });
    socket.on("took-card", (socketData) => {
      dispatch(updatePlayer(socketData.user));
      if (user && user.id === socketData.user.id) {
        dispatch(
          updateYoursCards({
            ...socketData.playerCards,
            id: socketData.user.id,
          })
        );
      }
    });
    return () => {
      socket.off("played-card");
      socket.off("took-card");
    };
  }, []);
}
