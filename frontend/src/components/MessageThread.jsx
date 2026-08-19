import React, { useState, useEffect, useRef } from 'react';
import { messagingApi } from '../services/messagingApi';
import { Send, Sparkles, Wand2, Loader2, MessageSquare, Check, CheckCheck } from 'lucide-react';

const MessageThread = ({ conversation, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  const [polishing, setPolishing] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    if (!conversation) return;
    setLoading(true);
    try {
      const data = await messagingApi.getMessages(conversation.id);
      setMessages(data || []);
      // Also fetch AI smart reply chips
      const assist = await messagingApi.getAIAssist(conversation.id, 'smart_replies');
      setSmartReplies(assist.smart_replies || []);
    } catch (err) {
      console.error('Failed to load message thread:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      if (conversation) {
        messagingApi.getMessages(conversation.id).then((data) => {
          if (data) setMessages(data);
        });
      }
    }, 4000); // Polling for new messages every 4s
    return () => clearInterval(interval);
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend = null) => {
    const content = textToSend || inputText;
    if (!content || !content.strip ? !content.trim() : !content.trim() || !conversation) return;
    setSending(true);
    try {
      const newMsg = await messagingApi.sendMessage(conversation.id, content.trim());
      setMessages((prev) => [...prev, newMsg]);
      if (!textToSend) setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleAIPolish = async () => {
    if (!inputText || !inputText.trim() || !conversation) return;
    setPolishing(true);
    try {
      const res = await messagingApi.getAIAssist(conversation.id, 'polish_message', inputText.trim());
      if (res.polished_message) {
        setInputText(res.polished_message);
      }
    } catch (err) {
      console.error('AI polish failed:', err);
    } finally {
      setPolishing(false);
    }
  };

  if (!conversation) {
    return (
      <div className="h-[550px] bg-slate-50/50 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 border border-teal-100 shadow-sm">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Select a Conversation</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Choose a candidate or recruiter thread from the left list to view active chat history.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[580px] bg-white rounded-3xl border border-slate-200/90 shadow-xl flex flex-col overflow-hidden">
      
      {/* Thread Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-md">
            {conversation.other_party_name ? conversation.other_party_name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white leading-tight">
              {conversation.other_party_name}
            </h3>
            <p className="text-xs text-teal-300 font-medium">
              {conversation.job_title} • <span className="text-slate-300">{conversation.company_name}</span>
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-400/30">
          Application Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-slate-50/50">
        {loading && messages.length === 0 ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No messages yet. Send a greeting to start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-xs ${
                    isMe
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                <div className="flex items-center space-x-1 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (msg.is_read ? <CheckCheck className="w-3 h-3 text-teal-600" /> : <Check className="w-3 h-3 text-slate-400" />)}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Smart Reply Quick Chips */}
      {smartReplies.length > 0 && (
        <div className="px-4 py-2 bg-slate-100/80 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">AI Quick Reply:</span>
          {smartReplies.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors whitespace-nowrap shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Box Footer */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center space-x-2 shrink-0">
        <button
          onClick={handleAIPolish}
          disabled={!inputText.trim() || polishing}
          title="Polish draft message with Gemini AI"
          className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {polishing ? <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> : <Wand2 className="w-4 h-4 text-purple-600" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || sending}
          className="p-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

    </div>
  );
};

export default MessageThread;
