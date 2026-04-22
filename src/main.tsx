import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
// import Store from "./components/Store";
import MockGame from "./components/MockGame";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
  <MockGame/>
    {/* <Store /> */}
  </BrowserRouter>
);