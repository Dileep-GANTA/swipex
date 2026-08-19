import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ConversationList from '../components/ConversationList';
import MessageThread from '../components/MessageThread';
import { messagingApi } from '../services/messagingApi';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Sparkles } from 'lucide-react';

const Inbox = () => {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initInbox = async () => {
      setLoading(true);
      try {
        const convs = await messagingApi.getConversations();
        setConversations(convs || []);
        if (convs && convs.length > 0) {
          setActiveConversation(convs[0]);
        }
      } catch (err) {
        console.error('Failed to load inbox:', err);
      } finally {
        setLoading(false);
      }
    };

    initInbox();
  }, []);


  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    messagingApi.markAsRead(conv.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Inbox Top Header Banner */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Direct Messaging Inbox
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Communicate directly with hiring recruiters & job candidates for active applications.
            </p>
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Gemini AI Chat Assistant Active</span>
          </div>
        </div>

        {/* Messaging Layout: Sidebar Threads + Main Message Thread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Conversation Sidebar List (Cols 4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
            <div className="p-4 bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider">
              Active Conversations ({conversations.length})
            </div>
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelectConversation={handleSelectConversation}
              loading={loading}
            />
          </div>

          {/* Active Message Thread Window (Cols 8) */}
          <div className="lg:col-span-8">
            <MessageThread
              conversation={activeConversation}
              currentUserId={currentUser?.id}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default Inbox;
