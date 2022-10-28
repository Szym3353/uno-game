import { gql, useQuery } from "@apollo/client";
import { socket } from "../socket";
import { addError, errorType } from "../store/errorSlice";
import { chatMessage, receiveMessage, userLeft } from "../store/lobbySlice";
import useCommonData from "./useCommonData";

export default function useLobby() {
  const { user, lobby, navigate, dispatch } = useCommonData();

  const createLobby = () => {
    console.log("tworzę lobby");
    socket.emit(
      "create-lobby",
      { hostId: user && user.id },
      (err: errorType, res: string) => {
        if (err) {
          return dispatch(addError(err));
        }
        navigate(`/lobby/${res}`);
      }
    );
  };

  const joinLobby = (code: string) => {
    console.log("join ", code);
    socket.emit(
      "join-lobby",
      { userId: user && user.id, code },
      (err: errorType, res: string) => {
        if (err) {
          return dispatch(addError(err));
        }
        if (res) {
          navigate(`/lobby/${res}`);
        }
      }
    );
  };

  const startGame = () => {
    socket.emit(
      "start-game",
      {
        lobbyId: lobby.id,
      },
      (err: errorType, res: string) => {
        console.log("err, res", err, res);
        if (err) {
          return dispatch(addError(err));
        }
        if (res) {
          console.log(res);
          navigate(`/game/${res}`);
        }
      }
    );
  };

  const sendMessage = (message: string) => {
    socket.emit(
      "send-lobby-message",
      {
        message,
        authorId: user && user.id,
        lobbyId: lobby.id,
      },
      (err: errorType, res: chatMessage) => {
        if (err) {
          return dispatch(addError(err));
        }
        if (res) {
          dispatch(receiveMessage(res));
        }
      }
    );
  };

  const kickUser = (id: string) => {
    socket.emit(
      "kick-user",
      { userId: id, lobbyId: lobby.id, kickerId: (user && user.id) || "" },
      (err: errorType, res: boolean) => {
        if (err) {
          return dispatch(addError(err));
        }
        if (res) {
          dispatch(userLeft(id));
        }
      }
    );
  };

  const leaveLobby = () => {
    socket.emit(
      "leave-lobby",
      { userId: user && user.id, lobbyId: lobby.id },
      (err: errorType, res: boolean) => {
        if (err) {
          return dispatch(addError(err));
        }
        if (res) {
          navigate("/");
        }
      }
    );
  };

  return {
    createLobby,
    leaveLobby,
    joinLobby,
    kickUser,
    sendMessage,
    startGame,
  };
}
