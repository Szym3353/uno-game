import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import ApolloProviderComp from "./components/App/ApolloProvider";
import { Provider } from "react-redux";
import store from "./store/store";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ApolloProviderComp>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ApolloProviderComp>
  </React.StrictMode>
);
