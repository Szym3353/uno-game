import React from "react";
import gql from "graphql-tag";

//Components
import FormComponent from "../components/Form/FormComponent";
import { Card, CardHeader } from "@mui/material";
import { Container } from "@mui/system";
import { Link } from "react-router-dom";

//Login
import useTitle from "../Hooks/useTitle";

const Login = () => {
  useTitle("Login");
  let inputs = [
    {
      name: "email",
      type: "email",
      label: "Adres e-mail",
    },
    { name: "password", type: "password", label: "Hasło" },
  ];

  return (
    <Container sx={{ display: "flex", justifyContent: "center" }}>
      <Card sx={{ display: "inline-block", p: 3, width: "400px" }}>
        <CardHeader title={"Zaloguj się"} sx={{ mb: 1 }} />
        <FormComponent
          gql={LOGIN_MUTATION}
          title="login"
          buttonValue="Zaloguj"
          inputs={inputs}
        />
        <Link to="/register">Nie posiadasz jeszcze konta? Zarejestruj się</Link>
      </Card>
    </Container>
  );
};

export default Login;

let LOGIN_MUTATION = gql`
  mutation login($email: String, $password: String) {
    login(email: $email, password: $password) {
      token
    }
  }
`;
