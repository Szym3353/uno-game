import React, { useEffect } from "react";

//Hooks
import useCommonData from "../../Hooks/useCommonData";

//Router
import { Routes, Route } from "react-router-dom";

//Page components
import Homepage from "../../pages/Homepage";
import Lobby from "../../pages/Lobby";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import Game from "../../pages/Game";

const RouterComponent = () => {
  const { errors, navigate } = useCommonData();

  //Check if error has changePath value
  useEffect(() => {
    if (errors.length > 0) {
      let lastError = errors[errors.length - 1];
      if (lastError.action === "changePath") {
        navigate(lastError.path || "/");
      }
    }
  }, [errors]);

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lobby/:id" element={<Lobby />} />
      <Route path="/game/:id" element={<Game />} />
    </Routes>
  );
};

export default RouterComponent;
