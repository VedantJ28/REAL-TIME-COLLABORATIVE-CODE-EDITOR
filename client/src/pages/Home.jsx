import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#121212] p-4 flex flex-col">
      <header className="mt-10">
        <div className="flex items-center justify-center space-x-4 md:space-x-6">
          <img
            src="/logo.png"
            alt="Company Logo"
            className="w-16 h-16 md:w-20 md:h-20"
          />
          <h1 className="text-3xl md:text-5xl font-bold tracking-wide text-[#EEEEEE]">
            CodeCollab
          </h1>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow mt-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#EEEEEE]">
          Welcome to Real-Time Code Editor
        </h2>
        <p className="mt-2 text-base md:text-lg text-center text-[#B0BEC5]">
          Edit and collaborate on code in real time!
        </p>

        {/* Features Section */}
        <section className="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-md ring-2 ring-[#333333] transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <h3 className="text-xl font-bold text-[#EEEEEE] mb-2">
              Real-time Collaboration
            </h3>
            <p className="text-sm text-[#B0BEC5]">
              Work together with peers in live coding sessions.
            </p>
          </div>
          <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-md ring-2 ring-[#333333] transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <h3 className="text-xl font-bold text-[#EEEEEE] mb-2">
              Live Code Editing
            </h3>
            <p className="text-sm text-[#B0BEC5]">
              See instant updates as you and your team code.
            </p>
          </div>
          <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-md ring-2 ring-[#333333] transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <h3 className="text-xl font-bold text-[#EEEEEE] mb-2">
              Seamless Integration
            </h3>
            <p className="text-sm text-[#B0BEC5]">
              Integrate smoothly with your favorite dev tools.
            </p>
          </div>
        </section>

        <button
          onClick={handleJoin}
          className="mt-6 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#2962FF] to-[#00B0FF] text-[#121212] font-semibold rounded-lg shadow-xl hover:brightness-110 transition transform hover:scale-105"
        >
          Start Coding
        </button>
      </main>

      <footer className="text-[#B0BEC5] text-xs md:text-sm text-center pb-4">
        &copy; {new Date().getFullYear()} Real-Time Code Editor. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Home;