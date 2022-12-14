import gql from "graphql-tag";

export const STATS_QUERY = gql`
  query getStats($page: Int, $id: String) {
    getStats(page: $page, id: $id) {
      points
      ranking
    }
  }
`;

export const GAME_QUERY = gql`
  query getGame($id: String, $userId: String) {
    getGame(id: $id, userId: $userId) {
      onPlus
      specialActive
      turn
      spareCards {
        cards {
          color
          value
          special
          description
        }
        numberOfCards
        latestCard {
          value
          color
          special
          description
        }
      }
      centerCards {
        cards {
          color
          value
          special
          description
        }
        numberOfCards
        latestCard {
          value
          color
          special
          description
        }
      }
      winners {
        username
      }
      direction
      players {
        points
        stopped
        cards {
          special
          description
          color
          value
        }
        numberOfCards
        id
        username
      }
      lobbyId
      id
    }
  }
`;

export const LOBBIES_LIST_QUERY = gql`
  query getPublicLobbies($page: Int) {
    getPublicLobbies(page: $page) {
      code
      hostUsername
      users
    }
  }
`;

export const FRIENDS_QUERY = gql`
  query getFriends($userId: String) {
    getFriends(userId: $userId) {
      friendId
      username
      status
      activityStatus
    }
  }
`;

export const LOBBY_QUERY = gql`
  query getLobby($id: String, $userId: String) {
    getLobby(id: $id, userId: $userId) {
      id
      gameState
      gameId
      code
      status
      users {
        username
        id
        host
        stillInGame
      }
      lobbyChat {
        message
        author
        createdAt
        messageType
      }
    }
  }
`;
