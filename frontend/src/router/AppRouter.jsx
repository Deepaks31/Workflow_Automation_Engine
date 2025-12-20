import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "../auth/Signup";
import Login from "../auth/Login";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
