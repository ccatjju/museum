import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lights from "./component/Lights.jsx";
import Street from "./component/Street.jsx";
import Test from "./component/Test.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lights />} />
        <Route path="street" element={<Street />} />
        <Route path="test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
