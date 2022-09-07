import React, { useEffect, useState } from "react";
import { socket } from "./socket";

//Components
import RouterComponent from "./components/App/RouterComponent";
import LoadingToServer from "./components/App/LoadingToServer";

//CSS
import "./styles/main.css";
import useCheckPath from "./Hooks/useCheckPath";

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  //Check path hook
  useCheckPath();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
      setIsConnected(true);
    });
    socket.on("disconnect", () => {
      setIsConnected(false);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div className="App">
      {isConnected ? <RouterComponent /> : <LoadingToServer />}
    </div>
  );
}

export default App;
