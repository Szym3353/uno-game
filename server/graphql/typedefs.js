const gql = require("graphql-tag");

module.exports = gql`
  type token {
    token: String!
  }
  type chatMessage {
    message: String
    author: String
    createdAt: String
    messageType: String
  }
  type isAnywhere {
    userIn: String
    id: String
  }
  type lobbyUser {
    host: Boolean
    username: String
    id: String
    stillInGame: Boolean
  }
  type lobby {
    id: ID
    gameState: String
    gameId: String
    code: String
    lobbyChat: [chatMessage]
    users: [lobbyUser]
    status: String
  }
  type gameCards {
    latestCard: card
    numberOfCards: Int!
    cards: [card]
  }
  type card {
    value: String!
    color: String!
    special: Boolean!
    description: String!
  }
  type gamePlayer {
    username: String!
    id: String!
    numberOfCards: Int!
    cards: [card]
    stopped: Int!
    points: Int!
  }
  type winner {
    username: String!
    points: Int!
  }
  type lobbyInfo {
    hostUsername: String
    users: Int
    code: String
  }
  type stats {
    username: String
    id: ID
    ranking: Int!
    points: Int!
  }
  type game {
    id: ID!
    lobbyId: String!
    players: [gamePlayer!]
    direction: Int!
    winners: [winner]
    centerCards: gameCards
    spareCards: gameCards
    turn: String!
    specialActive: Boolean
    onPlus: Int
  }
  type Query {
    isUserAnywhere(id: String, userId: String): isAnywhere
    getLobby(id: String, userId: String): lobby
    getGame(id: String, userId: String): game
    getStats(page: Int, id: String): stats
    getPublicLobbies(page: Int): [lobbyInfo]
  }
  type Mutation {
    login(email: String, password: String): token!
    register(
      username: String
      email: String
      password: String
      confirmPassword: String
    ): token!
  }
`;
