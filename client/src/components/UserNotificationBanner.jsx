import React, { useState, useEffect } from "react";

const UserNotificationBanner = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`px-4 py-2 rounded shadow-lg text-white ${
            notification.type === "join" ? "bg-green-500" : "bg-red-500"
          } flex justify-between items-center`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 text-white font-bold"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default UserNotificationBanner;