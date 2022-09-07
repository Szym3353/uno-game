import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../store/store";

export default function useCommonData() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.userReducer.user);
  const errors = useSelector((state: RootState) => state.errorReducer);
  const lobby = useSelector((state: RootState) => state.lobbyReducer.lobby);

  return { user, navigate, dispatch, errors, lobby, location };
}