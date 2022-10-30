import React from "react";

//Store
import { clearError, errorType } from "../../store/errorSlice";

//Components
import { Box } from "@mui/system";
import { Alert, Slide } from "@mui/material";

//Hooks
import useCommonData from "../../Hooks/useCommonData";

const ErrorsContainer = () => {
  let { errors, dispatch } = useCommonData();
  const containerRef = React.useRef(null);

  return (
    <Box
      sx={{
        position: "absolute",
        right: "10px",
        bottom: "10px",
        maxWidth: "400px",
        overflow: "hidden",
      }}
      ref={containerRef}
    >
      {errors.map((error: errorType, index: number) => (
        <Box
          sx={{
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={() => dispatch(clearError(index))}
        >
          <Slide
            direction="left"
            in={error ? true : false}
            container={containerRef.current}
          >
            <Alert sx={{ my: 1 }} severity={error.type}>
              {error.message}
            </Alert>
          </Slide>
        </Box>
      ))}
    </Box>
  );
};

export default ErrorsContainer;
