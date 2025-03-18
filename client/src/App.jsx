import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomPage from "./pages/RoomPage";
import EditorPage from "./pages/EditorPage";
import AuthPage from "./pages/AuthPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomPage />} />
        <Route path="/editor/:roomId" element={<EditorPage />} />
        <Route path= "/auth" element={<AuthPage />} />
      </Routes>
    </Router>
  );
};

export default App;
