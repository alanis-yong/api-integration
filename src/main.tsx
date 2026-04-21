import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import Store from "./components/Store";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Store />
  </BrowserRouter>
);