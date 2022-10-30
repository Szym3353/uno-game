import gql from "graphql-tag";

export let LOGIN_MUTATION = gql`
  mutation login($email: String, $password: String) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export let REGISTER_MUTATION = gql`
  mutation register(
    $username: String
    $email: String
    $password: String
    $confirmPassword: String
  ) {
    register(
      username: $username
      email: $email
      password: $password
      confirmPassword: $confirmPassword
    ) {
      token
    }
  }
`;
