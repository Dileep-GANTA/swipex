import api from './api';

export const messagingApi = {
  // Create or get active conversation thread
  createOrGetConversation: async (jobId, jobSeekerId = null) => {
    const response = await api.post('/conversations', {
      job_id: jobId,
      job_seeker_id: jobSeekerId,
    });
    return response.data;
  },

  // List all conversations for current logged-in user
  getConversations: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  // Get message history for a conversation thread
  getMessages: async (conversationId) => {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Send a message in a conversation thread
  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data;
  },

  // Mark thread as read
  markAsRead: async (conversationId) => {
    const response = await api.patch(`/conversations/${conversationId}/read`);
    return response.data;
  },

  // AI Chat Assistance (Polish message or Smart Quick-Reply chips)
  getAIAssist: async (conversationId, mode = 'smart_replies', draftContent = '') => {
    const response = await api.post(
      `/conversations/${conversationId}/ai-assist?mode=${mode}&draft_content=${encodeURIComponent(draftContent)}`
    );
    return response.data;
  },
};
