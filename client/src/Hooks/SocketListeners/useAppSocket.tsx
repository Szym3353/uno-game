import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { addError, errorType } from "../../store/errorSlice";
import {
  addToList,
  friendType,
  updateFriendStatus,
} from "../../store/friendSlice";
import useCommonData from "../useCommonData";

export default function useAppSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { user, dispatch } = useCommonData();

  useEffect(() => {
    socket.on("user:friendRequest:receive", (socketData: friendType) => {
      dispatch(addToList(socketData));
    });
    socket.on("user:friendRequest:accepted", (socketData: friendType) => {
      dispatch(addToList(socketData));
    });
    socket.on(
      "user:activityStatusChange:friend",
      (socketData: { friendId: string; status: "online" | "offline" }) => {
        dispatch(updateFriendStatus(socketData));
      }
    );
    socket.on("connect", () => {
      setIsConnected(true);
      socket.once("disconnect", function () {
        setIsConnected(false);
      });
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    if (user && user.id && isConnected) {
      socket.emit(
        "user:activityStatusChange",
        {
          status: "online",
          userId: user.id,
        },
        (err: errorType) => {
          if (err) {
            return dispatch(addError(err));
          }
        }
      );
    }
  }, [user, isConnected]);

  return { isConnected };
}
