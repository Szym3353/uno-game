//Components
import RouterComponent from "./components/App/RouterComponent";
import LoadingToServer from "./components/App/LoadingToServer";
import ErrorsContainer from "./components/App/ErrorsContainer";

//CSS
import "./styles/main.css";

//Hooks
import useCheckPath from "./Hooks/useCheckPath";
import useAppSocket from "./Hooks/SocketListeners/useAppSocket";

function App() {
  useCheckPath();

  const { isConnected } = useAppSocket();

  return (
    <div className="App">
      {isConnected ? (
        <>
          <ErrorsContainer />
          <RouterComponent />
        </>
      ) : (
        <LoadingToServer />
      )}
    </div>
  );
}

export default App;
