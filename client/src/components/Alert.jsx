import React from "react";

const Alert = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative bg-white rounded-lg p-6 max-w-sm mx-auto">
        <p className="mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;