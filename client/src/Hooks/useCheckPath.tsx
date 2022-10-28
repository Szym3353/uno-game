import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { socket } from "../socket";
import { addError } from "../store/errorSlice";
import useCommonData from "./useCommonData";

export default function useCheckPath() {
  let { user, dispatch, navigate, location } = useCommonData();

  let { loading, data, error } = useQuery(IS_ANYWHERE, {
    variables: { id: user && user.id },
  });

  useEffect(() => {
    if (user) {
      if (error) {
        dispatch(
          addError({ message: error.graphQLErrors[0].message, type: "error" })
        );
      }
      if (data) {
        if (data.isUserAnywhere.userIn !== "") {
          socket.emit("rejoin", { id: data.isUserAnywhere.id });
          if (
            !location.pathname.includes(
              `/${data.isUserAnywhere.userIn}/${data.isUserAnywhere.id}`
            )
          ) {
            navigate(
              `/${data.isUserAnywhere.userIn}/${data.isUserAnywhere.id}`
            );
          }
        }
      }
    } else {
      if (
        !location.pathname.includes("/register") &&
        !location.pathname.includes("/login")
      ) {
        navigate("/login");
      }
    }
  }, [loading]);
}

let IS_ANYWHERE = gql`
  query isUserAnywhere($id: String) {
    isUserAnywhere(id: $id) {
      userIn
      id
    }
  }
`;
