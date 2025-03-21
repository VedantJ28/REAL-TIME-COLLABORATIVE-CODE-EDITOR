import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomPage from "./pages/RoomPage";
import EditorPage from "./pages/EditorPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import  Login  from "./pages/Login";
import { Signup } from "./pages/Register";
import Sidebar from "./components/sidebar/Sidebar";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Signup/>}/>
        <Route path="/sidebar" element={<Sidebar/>}/>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:roomId"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;