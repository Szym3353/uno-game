import { useEffect } from "react";
import { socket } from "../../socket";

//Store
import { addError } from "../../store/errorSlice";
import {
  chatMessage,
  lobbyUser,
  receiveMessage,
  userJoined,
  userLeft,
  leaveLobby as kickedFromLobby,
} from "../../store/lobbySlice";

//Hooks
import useCommonData from "../useCommonData";

export default function useLobbySocket() {
  const { dispatch, navigate, user } = useCommonData();

  useEffect(() => {
    socket.on("user-joined", (data: lobbyUser) => {
      dispatch(userJoined(data));
    });
    socket.on("user-left-game", (data: lobbyUser) => {
      dispatch(userJoined(data));
    });
    socket.on("user-left", (data: string) => {
      dispatch(userLeft(data));
    });
    socket.on("starting-game", (data: string) => {
      navigate(`/game/${data}`);
    });
    socket.on("kicking-user", (data: string) => {
      if (user) {
        if (user.id === data) {
          dispatch(kickedFromLobby());
          dispatch(
            addError({
              message: "Zostałeś wyrzucony z pokoju",
              type: "warning",
              action: "changePath",
              path: "/",
            })
          );
        }
      }
    });
    socket.on("lobby-message-receive", (data: chatMessage) => {
      dispatch(receiveMessage(data));
    });
    return () => {
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("kicking-user");
      socket.off("lobby-message-receive");
    };
  }, []);
}
