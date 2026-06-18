import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiPaperclip, FiSmile, FiTrash2, FiEdit2, FiCheck, FiX, FiHash } from 'react-icons/fi';
import useTeamStore from '../stores/useTeamStore';
import useAuthStore from '../stores/useAuthStore';
import { connectSocket } from '../services/socket';
import api from '../services/api';
import Avatar from '../components/common/Avatar';

function MessageBubble({ message, isOwn, onEdit, onDelete, onReaction, editingId, setEditingId }) {
  const [editContent, setEditContent] = useState('');
  const isEditing = editingId === message._id;

  const startEdit = () => {
    setEditingId(message._id);
    setEditContent(message.content);
  };

  const submitEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === message.content) {
      setEditingId(null);
      return;
    }
    setEditingId(null);
    await onEdit(message._id, trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar — always rendered so it never glitches away */}
      <div className="flex-shrink-0 mt-1">
        <Avatar user={message.sender} size="md" />
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* Sender name & time — always rendered for non-own messages */}
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-medium text-dark-700 dark:text-dark-300">
              {message.sender?.name || 'Unknown'}
            </span>
            <span className="text-[10px] text-dark-400">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-2.5 ${
            isEditing
              ? 'bg-white dark:bg-[#1a1c26] ring-2 ring-primary-500/40 shadow-lg'
              : isOwn
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-md'
                : 'bg-dark-50 dark:bg-dark-800/50 text-dark-900 dark:text-dark-100 rounded-tl-md border border-dark-100 dark:border-dark-800/60'
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitEdit();
                  }
                  if (e.key === 'Escape') {
                    setEditingId(null);
                  }
                }}
                className="w-full bg-dark-50 dark:bg-dark-800/50 text-dark-900 dark:text-dark-100 text-sm rounded-lg px-3 py-2 outline-none border border-dark-200 dark:border-dark-700 resize-none focus:ring-2 focus:ring-primary-500/30"
                rows={2}
                autoFocus
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={submitEdit}
                  className="p-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1.5 rounded-lg bg-dark-200 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-300 dark:hover:bg-dark-600 transition-colors"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed">{message.content}</p>

              {message.edited && (
                <span className={`text-[10px] ${isOwn ? 'text-white/60' : 'text-dark-400'} ml-1`}>
                  (edited)
                </span>
              )}

              {isOwn && (
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[10px] text-white/60">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Reactions */}
        <AnimatePresence>
          {message.reactions?.length > 0 && !isEditing && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className="flex gap-1 mt-1"
            >
              {message.reactions.map((reaction) => (
                <motion.button
                  key={reaction.emoji}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onReaction(message._id, reaction.emoji)}
                  className={`px-2 py-0.5 rounded-full text-xs border transition-colors duration-150 ${
                    reaction.users?.includes('current')
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 shadow-sm'
                      : 'bg-dark-50 dark:bg-dark-800/50 border-dark-100 dark:border-dark-700/50 hover:bg-dark-100 dark:hover:bg-dark-700'
                  }`}
                >
                  {reaction.emoji} <span className="font-medium">{reaction.users?.length}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick reactions — hidden while editing */}
        {!isEditing && (
          <div className={`flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isOwn ? 'flex-row-reverse' : ''}`}>
            {['👍', '❤️', '😂', '😮'].map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onReaction(message._id, emoji)}
                className="text-sm opacity-60 hover:opacity-100 transition-opacity duration-100"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Actions (own messages) — hidden while editing */}
      {isOwn && !isEditing && (
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={startEdit}
            className="p-1 rounded text-dark-400 hover:text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors duration-150"
          >
            <FiEdit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(message._id)}
            className="p-1 rounded text-dark-400 hover:text-red-500 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors duration-150"
          >
            <FiTrash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function Chat() {
  const { team, fetchMyTeam } = useTeamStore();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  useEffect(() => {
    if (!token || !team?._id) return;

    let mounted = true;

    connectSocket(token).then((socket) => {
      if (!mounted) return;
      socketRef.current = socket;

      socket.emit('join_team', team._id);

      api.get(`/messages/${team._id}`).then(({ data }) => {
        if (!mounted) return;
        setMessages(data);
        setIsLoading(false);
      });

      socket.on('new_message', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on('user_typing', (data) => {
        if (data.isTyping) {
          setTypingUsers((prev) => [...prev.filter((u) => u.userId !== data.userId), data]);
        } else {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        }
      });

      socket.on('message_updated', (data) => {
        setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
      });

      socket.on('message_removed', (data) => {
        setMessages((prev) => prev.filter((m) => m._id !== data._id));
      });
    });

    return () => {
      mounted = false;
      if (socketRef.current && team?._id) {
        socketRef.current.emit('leave_team', team._id);
      }
    };
  }, [token, team?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, editingId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data } = await api.post(`/messages/${team._id}`, { content: newMessage });
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', { ...data, teamId: team._id });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (isTyping) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { teamId: team._id, isTyping });
    }
  };

  const handleEdit = async (messageId, content) => {
    try {
      const { data } = await api.put(`/messages/${messageId}`, { content });
      setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
      setEditingId(null);
      if (socketRef.current?.connected) {
        socketRef.current.emit('message_edited', { ...data, teamId: team._id });
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      if (socketRef.current?.connected) {
        socketRef.current.emit('message_deleted', { _id: messageId, teamId: team._id });
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const { data } = await api.post(`/messages/${messageId}/reactions`, { emoji });
      setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
      if (socketRef.current?.connected) {
        socketRef.current.emit('reaction_added', { ...data, teamId: team._id });
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  if (!team) {
    return (
      <div className="flex items-center justify-center h-64 text-dark-400">
        Join or create a team to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="card p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <FiHash className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-dark-900 dark:text-dark-100 truncate">
              {team?.name} Chat
            </h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs text-dark-500">{team?.members?.length} members online</p>
        </div>
        <div className="flex -space-x-2">
          {team?.members?.slice(0, 5).map((member) => (
            <div key={member.user?._id} className="border-2 border-white dark:border-surface-dark rounded-full" title={member.user?.name}>
              <Avatar user={member.user} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 px-1 smooth-scroll">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3" style={{ flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
                <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                <div className="space-y-2" style={{ width: `${60 + Math.random() * 30}%` }}>
                  <div className="skeleton h-8 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-dark-400">
            <FiHash className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.sender?._id === user?._id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReaction={handleReaction}
                editingId={editingId}
                setEditingId={setEditingId}
              />
            ))}
          </>
        )}

        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-2 px-3 py-2"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-dark-400"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.12,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-dark-400">
                {typingUsers.map((u) => u.name).join(', ')} typing...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="card p-3">
        <div className="flex items-center gap-3">
          <button type="button" className="p-2 rounded-lg text-dark-400 hover:text-dark-600 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors duration-150">
            <FiPaperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(true);
              }}
              onBlur={() => handleTyping(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={`Message #${team?.name || 'chat'}`}
              className="w-full bg-transparent border-0 outline-none text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 py-1"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!newMessage.trim()}
            whileHover={{ scale: newMessage.trim() ? 1.05 : 1 }}
            whileTap={{ scale: newMessage.trim() ? 0.95 : 1 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 shadow-lg shadow-primary-500/20"
          >
            <FiSend className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}