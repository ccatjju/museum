import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Lights from "./component/Lights.jsx";
import Test from "./component/Test.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lights />} />
        <Route path="test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
