import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WalletProvider, AllDefaultWallets } from "@suiet/wallet-kit";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <WalletProvider defaultWallets={AllDefaultWallets} autoConnect>
    <App />
  </WalletProvider>
);
