import React from "react";
import { Button, FormControl, Input, InputLabel } from "@mui/material";
import useForm from "../../Hooks/useForm";
import { DocumentNode } from "graphql";

type inputType = {
  name: string;
  type?: string;
  label: string;
};

const FormComponent = ({
  title,
  inputs,
  buttonValue,
  gql,
}: {
  title: string;
  inputs: inputType[];
  buttonValue: string;
  gql: DocumentNode;
}) => {
  let { handleChange, handleSubmit, formErrors } = useForm(gql);

  let getError = (keyName: string) => {
    if (formErrors && formErrors[0]) {
      if (Object.keys(formErrors[0]).length > 0) {
        return Object.keys(formErrors[0]).includes(keyName) ? true : false;
      }
    }
    return false;
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      {inputs.map((el: inputType, i: number) => (
        <FormControl
          error={
            formErrors[0]
              ? Object.keys(formErrors[0]).length > 0
                ? Object.keys(formErrors[0]).includes(el.name)
                : false
              : false
          }
          key={i}
          sx={{ my: 2 }}
          fullWidth
          required
        >
          <InputLabel htmlFor={`${title}-${el.name}`}>{el.label}</InputLabel>
          <Input
            onChange={(e) => handleChange(e)}
            id={`${title}-${el.name}`}
            type={el.type}
          />
        </FormControl>
      ))}
      <Button variant="contained" type="submit">
        {buttonValue}
      </Button>
    </form>
  );
};

export default FormComponent;
