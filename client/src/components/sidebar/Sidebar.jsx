import { useState } from "react";
import { Home, FileText, Settings } from "lucide-react";


const cn = (...classes) => classes.filter(Boolean).join(" ");


// Sidebar Sections
const HomeSection = () => <div className="p-4">Home Content</div>;
const FilesSection = () => <div className="p-4">Files Content</div>;
const SettingsSection = () => <div className="p-4">Settings Content</div>;

const sections = {
  home: <HomeSection />, 
  files: <FilesSection />, 
  settings: <SettingsSection />,
};

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Mini Sidebar */}
      <div className="w-16 flex flex-col items-center py-4 bg-gray-800">
        <div className="w-full flex flex-col items-center space-y-6">
          <button
            className={cn("p-2 rounded-lg flex justify-center", activeSection === "home" && "bg-gray-700")}
            onClick={() => setActiveSection("home")}
          >
            <Home size={24} />
          </button>
          <button
            className={cn("p-2 rounded-lg flex justify-center", activeSection === "files" && "bg-gray-700")}
            onClick={() => setActiveSection("files")}
          >
            <FileText size={24} />
          </button>
        </div>
        <div className="flex-1"></div>
        <button
          className={cn("p-2 rounded-lg mb-4 flex justify-center", activeSection === "settings" && "bg-gray-700")}
          onClick={() => setActiveSection("settings")}
        >
          <Settings size={24} />
        </button>
      </div>
      
      {/* Divider Line */}
      <div className="w-0.5 bg-gray-600"></div>

      {/* Major Sidebar */}
      <div className="w-80 bg-gray-800 p-4">{sections[activeSection]}</div>
    </div>
  );
}
