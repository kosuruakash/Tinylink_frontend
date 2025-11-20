import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Component/Home";
import Dashboard from "./Component/Dashboard";
import "./App.css";

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} /> {/* This is the Dashboard page */}
    <Route path="/code/:code" element={<Dashboard />} />{" "}
    {/* Stats page for individual code */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
