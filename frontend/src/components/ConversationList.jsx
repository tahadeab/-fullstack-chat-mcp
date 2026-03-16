import { useStore } from '../store';

export default function ConversationList() {
  const { conversations, activeConversation, setActiveConversation } = useStore();

  const getConversationName = (conv) => {
    if (conv.type === 'group') {
      return conv.name || 'Group Chat';
    }
    const otherParticipant = conv.participants.find(
      (p) => p.user.status !== undefined && p.user.id !== useStore.getState().user?.id
    );
    return otherParticipant?.user?.username || 'New Chat';
  };

  const getLastMessage = (conv) => {
    if (conv.messages?.length > 0) {
      return conv.messages[0].content;
    }
    return 'No messages yet';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No conversations yet</p>
          <p className="text-sm mt-1">Start a new chat!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv)}
              className={`w-full p-4 hover:bg-gray-50 transition text-left ${
                activeConversation?.id === conv.id ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {getConversationName(conv)[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {getConversationName(conv)}
                    </h3>
                    {conv.messages?.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(conv.messages[0].createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {getLastMessage(conv)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
