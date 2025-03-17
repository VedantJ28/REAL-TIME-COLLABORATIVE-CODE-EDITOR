import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const handleJoin = () => {
    navigate("/editor");
  };

  return (
    <div>
      <h1>Welcome to Real-Time Code Editor</h1>
      <button onClick={handleJoin}>Start Coding</button>
    </div>
  );
};

export default Home;
