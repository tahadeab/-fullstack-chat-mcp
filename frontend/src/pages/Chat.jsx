import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { conversationsAPI, usersAPI } from '../api';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import UserList from '../components/UserList';

export default function Chat() {
  const { user, logout, conversations, activeConversation, fetchConversations, fetchUsers, users } = useStore();
  const [showUserList, setShowUserList] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, []);

  const handleNewChat = async (selectedUser) => {
    const conversation = await conversationsAPI.create({
      participantIds: [selectedUser.id],
      type: 'direct',
    });
    
    if (conversation) {
      fetchConversations();
      setShowNewChat(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-primary-700">Chat</h1>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="New Chat"
            >
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span className="font-medium text-gray-700">{user?.username}</span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <ConversationList />
      </div>

      {/* Main Chat Area */}
      <ChatWindow />

      {/* User List Panel (optional) */}
      {showUserList && (
        <div className="w-64 bg-white border-l border-gray-200">
          <UserList />
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Chat</h2>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleNewChat(u)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition"
                >
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{u.username}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
