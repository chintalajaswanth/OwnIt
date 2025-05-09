// Updated ChatLayout with fresh colors and styles
import React from 'react';
import { Outlet } from 'react-router-dom';
import ChatList from './ChatList';

const ChatLayout = () => {
  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white shadow-lg rounded-2xl overflow-hidden border border-indigo-100">
          <ChatList />
        </div>
        <div className="md:col-span-2 bg-white shadow-lg rounded-2xl overflow-hidden border border-indigo-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;