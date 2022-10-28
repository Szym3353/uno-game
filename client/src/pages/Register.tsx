import React from "react";
import gql from "graphql-tag";

//Components
import FormComponent from "../components/Form/FormComponent";
import { Card, CardHeader } from "@mui/material";
import { Link } from "react-router-dom";
import { Container } from "@mui/system";

//Hooks
import useTitle from "../Hooks/useTitle";

const Register = () => {
  useTitle("Register");
  let inputs = [
    { name: "username", label: "Nazwa użytkownika" },
    { name: "email", type: "email", label: "Adres e-mail" },
    { name: "password", type: "password", label: "Hasło" },
    { name: "confirmPassword", type: "password", label: "Potwierdź hasło" },
  ];

  return (
    <Container sx={{ display: "flex", justifyContent: "center" }}>
      <Card sx={{ display: "inline-block", p: 3, width: "400px" }}>
        <CardHeader title={"Zarejestruj się"} />
        <FormComponent
          title="register"
          buttonValue="Zarejestruj"
          inputs={inputs}
          gql={REGISTER_MUTATION}
        />
        <Link to="/login">Masz już konto? Zaloguj się</Link>
      </Card>
    </Container>
  );
};
export default Register;

let REGISTER_MUTATION = gql`
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
