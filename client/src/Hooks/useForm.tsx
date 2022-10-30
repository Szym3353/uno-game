import { useState } from "react";
import { DocumentNode } from "graphql";
import { useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { login } from "../store/userSlice";
import { useNavigate } from "react-router-dom";

//Form types
type login = {
  email: string;
  password: string;
};

type register = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

//Errors types
type errors = {
  key: string;
  message: string;
};

export default function useForm(gql: DocumentNode) {
  const [formData, setFormData] = useState<login | register | {}>({});
  const [formErrors, setFormErrors] = useState<errors[] | []>([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //Mutation
  const [formFunc, { data, loading, error }] = useMutation(gql, {
    update(proxy, result) {
      dispatch(login(result.data[Object.keys(result.data)[0]]));
      navigate("/");
    },
    onError(error: any) {
      if (error.graphQLErrors[0]) {
        setFormErrors((prev: errors[] | []) => [
          ...prev,
          error.graphQLErrors[0].extensions.inputErrors,
        ]);
      }
    },
    variables: formData,
  });

  let handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFormData((prev: login | register | {}) => ({
      ...prev,
      [e.target.id.split("-")[1]]: e.target.value,
    }));
  };

  let handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors([]);
    formFunc();
  };

  return { formData, handleChange, handleSubmit, formErrors };
}
