import { DocumentNode, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { addError } from "../store/errorSlice";
import useCommonData from "./useCommonData";

export default function useGqlQuery(
  gql: DocumentNode,
  variables: any,
  action?: any
) {
  const { dispatch } = useCommonData();

  const { data, loading, error } = useQuery(gql, { variables });

  useEffect(() => {
    if (error) {
      dispatch(
        addError({
          message: error?.graphQLErrors[0]?.message || "",
          action: "changePath",
          path: "/",
          type: "error",
        })
      );
    } else if (data && action) {
      dispatch(action(Object.values(data)[0]));
    }
  }, [loading]);

  return { loading, data };
}
