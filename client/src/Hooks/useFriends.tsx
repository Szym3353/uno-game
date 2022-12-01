import { socket } from "../socket";
import { addError, errorType } from "../store/errorSlice";
import { addToList, friendType, removeFromList } from "../store/friendSlice";
import useCommonData from "./useCommonData";

export default function useFriends() {
  const { user, dispatch } = useCommonData();
  const sendFriendRequest = (receiverId: string) => {
    socket.emit(
      "user:friendRequest:send",
      { receiverId, userId: user && user.id },
      (err: errorType, res: any) => {
        if (err) {
          dispatch(addError(err));
        }
      }
    );
  };

  const acceptRequest = (friendId: string) => {
    socket.emit(
      "user:friendRequest:accept",
      {
        userId: user && user.id,
        friendId,
      },
      (err: errorType, res: friendType) => {
        if (err) {
          dispatch(addError(err));
        }
        if (res) {
          dispatch(addToList(res));
        }
      }
    );
  };

  const declineRequest = (friendId: string) => {
    socket.emit(
      "user:friendRequest:decline",
      { userId: user && user.id, friendId },
      (err: errorType, res: string) => {
        if (err) {
          dispatch(addError(err));
        }
        if (res) {
          dispatch(removeFromList(res));
        }
      }
    );
  };

  return { sendFriendRequest, declineRequest, acceptRequest };
}
