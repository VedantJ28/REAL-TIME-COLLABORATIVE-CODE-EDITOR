import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CodeEditor from "../components/Editor";
import ChatBox from "../components/ChatBox";
import UserList from "../components/UserList";

const EditorPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const user = searchParams.get("name") || "Guest";

  return (
    <div className="editor-page">
      <h2>Room ID: {roomId}</h2>
      <h3>Welcome, {user}!</h3>
      <UserList roomId={roomId} />
      <CodeEditor roomId={roomId} />
      <ChatBox roomId={roomId} user={user} />
    </div>
  );
};

export default EditorPage;
