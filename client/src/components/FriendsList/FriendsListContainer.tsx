import { Card, Tab, Tabs, CircularProgress } from "@mui/material";
import React, { useState } from "react";

import useGqlQuery from "../../Hooks/useGqlQuery";
import { FRIENDS_QUERY } from "../../Gql/queries";
import useCommonData from "../../Hooks/useCommonData";
import { friendType, setFriends } from "../../store/friendSlice";
import FriendsList from "./List/FriendsList";
import ShowButton from "./List/ShowButton";

const FriendsListContainer = () => {
  let { user, friends } = useCommonData();
  let [showFriendsList, setShowFriendsList] = useState<boolean>(false);
  let [tabsIndex, setTabsIndex] = useState<number>(0);

  const handleTabsChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabsIndex(newValue);
  };

  let { loading } = useGqlQuery(
    FRIENDS_QUERY,
    { userId: (user && user.id) || "" },
    setFriends
  );

  return (
    <>
      <ShowButton setShowFriendsList={setShowFriendsList} />
      {showFriendsList ? (
        <Card
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "2px 3px 7px rgba(0,0,0,0.5)",
            width: "400px",
            zIndex: "10000",
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Tabs value={tabsIndex} onChange={handleTabsChange}>
                <Tab label="Znajomi" />
                <Tab label="Oczekujące" />
              </Tabs>
              {tabsIndex === 0 && (
                <FriendsList
                  tabIndex={0}
                  friends={friends.filter(
                    (el: friendType) => el.status === "friend"
                  )}
                />
              )}
              {tabsIndex === 1 && (
                <FriendsList
                  tabIndex={1}
                  friends={friends.filter(
                    (el: friendType) => el.status === "request:request"
                  )}
                />
              )}
            </>
          )}
        </Card>
      ) : (
        ""
      )}
    </>
  );
};

export default FriendsListContainer;
