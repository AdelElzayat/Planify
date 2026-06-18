import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiPaperclip, FiSmile, FiTrash2, FiEdit2, FiCheck, FiX, FiHash, FiUsers, FiSearch, FiInbox } from 'react-icons/fi';
import { BsPinAngle } from 'react-icons/bs';
import useTeamStore from '../stores/useTeamStore';
import useAuthStore from '../stores/useAuthStore';
import { connectSocket } from '../services/socket';
import api from '../services/api';
import Avatar from '../components/common/Avatar';

// ---------------------------------------------------------------------------
// Message group – groups consecutive messages from the same sender
// ---------------------------------------------------------------------------
function MessageGroup({ messages, userId, onEdit, onDelete, onReaction, editingId, editContent, setEditContent, setEditingId }) {
  const first = messages[0];
  const sender = first.sender;

  return (
    <div className="flex gap-3 group hover:bg-dark-50 dark:hover:bg-dark-900/30 px-4 py-0.5 rounded transition-colors duration-75">
      {/* Avatar column – only on the first message of the group */}
      <div className="flex-shrink-0 w-10 pt-0.5">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Avatar user={sender} size="md" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {messages.map((msg, idx) => {
          const isOwn = sender?._id === userId;
          const isEditing = editingId === msg._id;
          const isFirst = idx === 0;

          const startEdit = () => {
            setEditingId(msg._id);
            setEditContent(msg.content);
          };

          const submitEdit = () => {
            const trimmed = editContent.trim();
            if (!trimmed || trimmed === msg.content) {
              setEditingId(null);
              return;
            }
            setEditingId(null);
            onEdit(msg._id, trimmed);
          };

          return (
            <div key={msg._id} id={`msg-${msg._id}`} className="group/message relative">
              {/* Sender name + date – only on first message */}
              {isFirst && (
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-sm font-semibold text-dark-900 dark:text-dark-100 hover:underline cursor-pointer">
                    {sender?.name || 'Unknown'}
                  </span>
                  <span className="text-[10px] text-dark-400 ml-1">
                    {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}

              {/* Message content row – text + timestamp on the right */}
              <div className={`relative flex items-start gap-2 ${isEditing ? 'mt-1' : ''}`}>
                <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2 py-1">
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
                      className="w-full bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-dark-100 text-sm rounded-lg px-3 py-2 outline-none border border-dark-200 dark:border-dark-700 resize-none focus:ring-2 focus:ring-primary-500/30"
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
                      <span className="text-xs text-dark-400 ml-1">escape to cancel • enter to save</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-dark-900 dark:text-dark-100 leading-relaxed py-0.5">
                    <span>{msg.content}</span>
                    {msg.edited && (
                      <span className="text-[10px] text-dark-400 ml-1">(edited)</span>
                    )}
                  </div>
                )}
                </div>
                {/* Timestamp on the right – shows on hover like Discord */}
                {!isEditing && (
                  <span className="text-[10px] text-dark-400 flex-shrink-0 pt-1.5 opacity-0 group-hover/message:opacity-100 transition-opacity duration-100">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              {/* Reactions */}
              <AnimatePresence>
                {msg.reactions?.length > 0 && !isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex gap-1 mt-0.5"
                  >
                    {msg.reactions.map((reaction) => (
                      <motion.button
                        key={reaction.emoji}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onReaction(msg._id, reaction.emoji)}
                        className={`px-2 py-0.5 rounded-full text-xs border transition-colors duration-150 ${
                          reaction.users?.includes(userId)
                            ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 shadow-sm'
                            : 'bg-transparent border-dark-200 dark:border-dark-700/50 hover:bg-dark-100 dark:hover:bg-dark-800'
                        }`}
                      >
                        {reaction.emoji} <span className="font-medium">{reaction.users?.length}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hover actions */}
              {!isEditing && (
                <div className="absolute -top-3 right-0 hidden group-hover/message:flex items-center gap-0.5 bg-white dark:bg-[#1e202e] border border-dark-200 dark:border-dark-700 rounded-lg shadow-lg px-1 py-0.5 z-10">
                  {['👍', '❤️', '😂', '😮'].map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onReaction(msg._id, emoji)}
                      className="text-sm hover:bg-dark-100 dark:hover:bg-dark-800 rounded p-0.5 transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                  {isOwn && (
                    <>
                      <div className="w-px h-4 bg-dark-200 dark:bg-dark-700 mx-0.5" />
                      <button
                        onClick={startEdit}
                        className="p-0.5 rounded text-dark-400 hover:text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(msg._id)}
                        className="p-0.5 rounded text-dark-400 hover:text-red-500 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Chat Component
// ---------------------------------------------------------------------------
export default function Chat() {
  const { team, fetchMyTeam } = useTeamStore();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showMembers, setShowMembers] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  // ── Socket connection ──
  useEffect(() => {
    if (!token || !team?._id) return;

    let mounted = true;

    const setupSocketConnection = async () => {
      const socket = await connectSocket(token);
      if (!mounted) return;
      socketRef.current = socket;

      socket.emit('join_team', team._id);

      // Fetch initial messages (last 50)
      fetchMessages(team._id);

      socket.on('new_message', (message) => {
        setMessages((prev) => {
          // Deduplicate: skip if temp message or already exists
          if (prev.some((m) => m._id === message._id || m._id === `temp-${message._id}`)) return prev;
          return [...prev, message];
        });
        // Auto-scroll to bottom on new messages
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
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

      // On reconnect, fetch any missed messages
      socket.on('connect', () => {
        console.log('Socket reconnected, joining team...');
        if (team?._id) {
          socket.emit('join_team', team._id);
        }
      });
    };

    setupSocketConnection();

    return () => {
      mounted = false;
      if (socketRef.current && team?._id) {
        socketRef.current.emit('leave_team', team._id);
      }
    };
  }, [token, team?._id]);

  // ── Fetch messages (initial or paginated) ──
  const fetchMessages = async (teamId, before = null) => {
    try {
      const params = before ? `?before=${before}&limit=50` : '?limit=50';
      const { data } = await api.get(`/messages/${teamId}${params}`);

      if (before) {
        // Paginated: prepend older messages
        setMessages((prev) => [...data.messages, ...prev]);
        setHasMoreMessages(data.hasMore);

        // Restore scroll position after prepending
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
              messagesContainerRef.current.scrollHeight - prevScrollHeightRef.current;
          }
        });
      } else {
        // Initial load
        setMessages(data.messages);
        setHasMoreMessages(data.hasMore);
        setIsLoading(false);
        initialLoadDone.current = true;

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView();
        }, 100);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      if (!before) setIsLoading(false);
    }
  };

  // ── Infinite scroll: load more when scrolling to top ──
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || isLoadingMore || !hasMoreMessages) return;

    const { scrollTop } = messagesContainerRef.current;

    // Trigger load more when within 200px of the top
    if (scrollTop < 200) {
      const oldestMsg = messages[0];
      if (oldestMsg && !oldestMsg._id.startsWith('temp-')) {
        setIsLoadingMore(true);
        prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
        fetchMessages(team._id, oldestMsg._id).finally(() => {
          setIsLoadingMore(false);
        });
      }
    }
  }, [isLoadingMore, hasMoreMessages, messages, team?._id]);

  useEffect(() => {
    if (initialLoadDone.current) {
      // Add scroll listener after initial load
      const container = messagesContainerRef.current;
      if (container) {
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }
  }, [handleScroll, initialLoadDone.current]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !team?._id) return;

    const content = newMessage;
    setNewMessage('');

    // Optimistic: add to UI instantly
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      content,
      sender: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      team: team._id,
      createdAt: new Date(),
      edited: false,
      reactions: [],
      messageType: 'text',
    };
    setMessages((prev) => [...prev, tempMsg]);

    // Auto-scroll
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    // Fire API in background
    api.post(`/messages/${team._id}`, { content }).then(({ data }) => {
      setMessages((prev) => prev.map((m) => (m._id === tempMsg._id ? data : m)));
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', { ...data, teamId: team._id });
      }
    }).catch((err) => {
      console.error('Failed to send message:', err);
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
    });
  };

  const handleTyping = (isTyping) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { teamId: team._id, isTyping });
    }
  };

  const handleEdit = async (messageId, content) => {
    setEditingId(null);
    setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, content, edited: true } : m)));

    api.put(`/messages/${messageId}`, { content }).then(({ data }) => {
      setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
      if (socketRef.current?.connected) {
        socketRef.current.emit('message_edited', { ...data, teamId: team._id });
      }
    }).catch((err) => {
      console.error('Failed to edit message:', err);
    });
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    setMessages((prev) => prev.filter((m) => m._id !== messageId));

    api.delete(`/messages/${messageId}`).then(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('message_deleted', { _id: messageId, teamId: team._id });
      }
    }).catch((err) => {
      console.error('Failed to delete message:', err);
    });
  };

  const handleReaction = async (messageId, emoji) => {
    setMessages((prev) => prev.map((m) => {
      if (m._id !== messageId) return m;
      const reactions = [...(m.reactions || [])];
      const existing = reactions.find((r) => r.emoji === emoji);
      const uid = user._id;
      if (existing) {
        const idx = existing.users.indexOf(uid);
        if (idx > -1) {
          existing.users = existing.users.filter((u) => u !== uid);
          if (existing.users.length === 0) {
            return { ...m, reactions: reactions.filter((r) => r.emoji !== emoji) };
          }
        } else {
          existing.users = [...existing.users, uid];
        }
      } else {
        reactions.push({ emoji, users: [uid] });
      }
      return { ...m, reactions };
    }));

    api.post(`/messages/${messageId}/reactions`, { emoji }).then(({ data }) => {
      setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
      if (socketRef.current?.connected) {
        socketRef.current.emit('reaction_added', { ...data, teamId: team._id });
      }
    }).catch((err) => {
      console.error('Failed to add reaction:', err);
    });
  };

  // Group messages by sender (consecutive)
  const groupedMessages = messages.reduce((groups, msg) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup[0].sender?._id === msg.sender?._id) {
      lastGroup.push(msg);
    } else {
      groups.push([msg]);
    }
    return groups;
  }, []);

  // Online members
  const onlineMembers = team?.members?.filter((m) => m.user?._id) || [];

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full text-dark-400">
        Join or create a team to start chatting
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-dark-100 dark:border-dark-800/60 bg-white dark:bg-[#1a1c26]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Channel Header ── */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-100 dark:border-dark-800/60 bg-white dark:bg-[#1a1c26] flex-shrink-0">
          <FiHash className="w-5 h-5 text-dark-400 flex-shrink-0" />
          <h2 className="font-semibold text-dark-900 dark:text-dark-100 text-base truncate">
            {team?.name || 'chat'}
          </h2>
          <div className="hidden sm:flex items-center ml-auto gap-1 text-dark-400">
            <button className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors" title="Pinned Messages">
              <BsPinAngle className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors" title="Search">
              <FiSearch className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors" title="Inbox">
              <FiInbox className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className={`p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors ${
                showMembers ? 'text-primary-500 bg-dark-100 dark:bg-dark-800' : ''
              }`}
              title="Toggle Member List"
            >
              <FiUsers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Messages Area ── */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto smooth-scroll bg-white dark:bg-[#1a1c26]">
          {/* Loading more indicator */}
          <AnimatePresence>
            {isLoadingMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-4"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary-500"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-dark-400 ml-2">Loading older messages...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 px-4">
                  <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-dark-400 px-4">
              <FiHash className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-semibold text-dark-500 dark:text-dark-300">Welcome to #{team?.name || 'chat'}</p>
              <p className="text-sm mt-1 text-dark-400">This is the start of the conversation.</p>
            </div>
          ) : (
            <div className="py-2 space-y-0">
              {groupedMessages.map((group, idx) => {
                const prevGroup = groupedMessages[idx - 1];
                let showDivider = false;
                if (prevGroup) {
                  const lastMsg = prevGroup[prevGroup.length - 1];
                  const firstMsg = group[0];
                  const diff = new Date(firstMsg.createdAt) - new Date(lastMsg.createdAt);
                  if (diff > 5 * 60 * 1000) showDivider = true;
                }

                return (
                  <div key={group[0]._id || `${group[0].createdAt}-${idx}`}>
                    {showDivider && (
                      <div className="flex items-center gap-2 px-4 py-2">
                        <div className="flex-1 h-px bg-dark-200 dark:bg-dark-800" />
                        <span className="text-[10px] text-dark-400 font-medium uppercase flex-shrink-0">
                          {new Date(group[0].createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex-1 h-px bg-dark-200 dark:bg-dark-800" />
                      </div>
                    )}
                    <MessageGroup
                      messages={group}
                      userId={user?._id}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onReaction={handleReaction}
                      editingId={editingId}
                      editContent={editContent}
                      setEditContent={setEditContent}
                      setEditingId={setEditingId}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {!hasMoreMessages && messages.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="flex-1 h-px bg-dark-200 dark:bg-dark-800" />
              <span className="text-[10px] text-dark-400 font-medium">Beginning of conversation</span>
              <div className="flex-1 h-px bg-dark-200 dark:bg-dark-800" />
            </div>
          )}

          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-2 px-4 py-1.5 ml-[68px]"
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

        {/* ── Message Input ── */}
        <div className="px-4 py-3 bg-white dark:bg-[#1a1c26] flex-shrink-0">
          <form onSubmit={handleSend} className="relative">
            <div className="flex items-end gap-2 bg-dark-50 dark:bg-dark-800/80 rounded-lg px-3 py-2 border border-dark-100 dark:border-dark-700/50 focus-within:border-primary-500/40 focus-within:ring-1 focus-within:ring-primary-500/30 transition-all duration-150">
              <button
                type="button"
                className="p-1 rounded text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors flex-shrink-0 self-end mb-0.5"
              >
                <FiPaperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <input
                  ref={inputRef}
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
                  className="w-full bg-transparent border-0 outline-none text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 dark:placeholder-dark-500 py-1"
                />
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 self-end mb-0.5">
                <button
                  type="button"
                  className="p-1 rounded text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
                >
                  <FiSmile className="w-5 h-5" />
                </button>
                <motion.button
                  type="submit"
                  disabled={!newMessage.trim()}
                  whileHover={{ scale: newMessage.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: newMessage.trim() ? 0.95 : 1 }}
                  className="p-1.5 rounded-lg bg-primary-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 hover:bg-primary-600"
                >
                  <FiSend className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Members Sidebar ── */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="border-l border-dark-100 dark:border-dark-800/60 bg-white dark:bg-[#1a1c26] overflow-hidden flex-shrink-0 hidden md:block"
          >
            <div className="w-[240px] h-full flex flex-col">
              <div className="px-4 py-3 border-b border-dark-100 dark:border-dark-800/60">
                <h3 className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Members — {onlineMembers.length}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                <div className="px-2 py-1">
                  <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">Online — {onlineMembers.length}</p>
                </div>
                {onlineMembers.map((member) => (
                  <div
                    key={member.user?._id || member._id}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-dark-50 dark:hover:bg-dark-800/50 cursor-pointer transition-colors group"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar user={member.user} size="sm" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1a1c26]" />
                    </div>
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-300 truncate group-hover:text-dark-900 dark:group-hover:text-dark-100 transition-colors">
                      {member.user?.name || 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile members toggle */}
      <div className="fixed bottom-20 right-4 md:hidden z-50">
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="p-3 rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-colors"
        >
          <FiUsers className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}