/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Image, MessageSquare, Check, CheckCheck, Phone, Video, Info } from 'lucide-react';
import { ConversationWithDetails, MessageWithSender } from '../types.ts';

interface ChatSectionProps {
  token: string;
  currentUser: { id: string; email: string; username: string; name: string };
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export default function ChatSection({ token, currentUser, addToast }: ChatSectionProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
    }
  }, [selectedConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
        
        // Clear unread counts
        setConversations(conversations.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConv) return;

    const currentText = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      const response = await fetch(`/api/chat/conversations/${selectedConv.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: currentText }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessages([...messages, data.message]);
        
        // Refresh conversations list to update latest messages on side
        fetchConversations();
        
        // Simulate high fidelity typing indicator and answer from the conversational partner
        triggerSimulatedReply();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  const triggerSimulatedReply = () => {
    if (!selectedConv) return;
    
    setTimeout(() => {
      setIsTyping(true);
    }, 1500);

    setTimeout(async () => {
      setIsTyping(false);
      try {
        const otherParticipant = selectedConv.participantsDetails.find(p => p.id !== currentUser.id);
        const replyText = getAestheticReply(otherParticipant?.name || 'Partner');
        
        const response = await fetch(`/api/chat/conversations/${selectedConv.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: replyText,
            // Simulating message originating from partner id
            senderId: otherParticipant?.id || 'u_marcus'
          }),
        });
        const data = await response.json();
        if (response.ok) {
          // Adjust sender details back for mockup display
          const replyMsg: MessageWithSender = {
            ...data.message,
            senderId: otherParticipant?.id || 'u_marcus',
            sender: otherParticipant || { id: 'u_marcus', name: 'Marcus Chen', username: 'marcus.designs', avatarUrl: '' }
          };
          setMessages((prev) => [...prev, replyMsg]);
          fetchConversations();
        }
      } catch (err) {
        console.error(err);
      }
    }, 4500);
  };

  const getAestheticReply = (name: string): string => {
    const replies = [
      `That looks incredibly beautiful. I love the warm lighting of Lantern.`,
      `We should organize the photography session soon. Does next Tuesday work?`,
      `Agreed, let's keep collaborating on minimal spatial architectures.`,
      `Perfect, looking forward to the expo. Keep documenting!`,
      `Thanks for sharing! I love how clean the dashboard interface feels.`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[78vh] rounded-3xl border border-neutral-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-md grid grid-cols-1 md:grid-cols-12 overflow-hidden" id="chat-section-root">
      
      {/* Conversations Side Drawer */}
      <div className="md:col-span-4 border-r border-neutral-100 dark:border-slate-900 flex flex-col h-full bg-neutral-50/50 dark:bg-slate-950" id="chat-sidebar">
        <div className="p-4 border-b border-neutral-100 dark:border-slate-900 flex justify-between items-center" id="chat-sidebar-header">
          <h2 className="font-display font-bold text-lg text-neutral-900 dark:text-white">Direct Messages</h2>
          <span className="text-[10px] py-0.5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold rounded-full">
            Realtime Live
          </span>
        </div>

        <div className="flex-grow overflow-y-auto divide-y divide-neutral-50 dark:divide-slate-900/40 p-2 space-y-1" id="chat-conversations-list">
          {conversations.map((conv) => {
            const isSelected = selectedConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20'
                    : 'hover:bg-neutral-100/50 dark:hover:bg-slate-900/30'
                }`}
                id={`conversation-row-${conv.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={conv.displayAvatar}
                      className="h-10 w-10 object-cover rounded-full border border-neutral-100 dark:border-slate-800"
                      alt={conv.displayName}
                    />
                    {/* Live Online Marker fallback */}
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]">
                      {conv.displayName}
                    </h4>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate max-w-[150px] font-medium">
                      {conv.lastMessageText || 'No messages yet'}
                    </p>
                  </div>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="h-5 w-5 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Conversation Window */}
      <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-slate-950" id="chat-window">
        {selectedConv ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-neutral-100 dark:border-slate-900 flex items-center justify-between bg-white dark:bg-slate-950 z-10 shadow-sm" id="chat-thread-header">
              <div className="flex items-center gap-3">
                <img
                  src={selectedConv.displayAvatar}
                  className="h-10 w-10 object-cover rounded-full border border-neutral-100 dark:border-slate-800"
                  alt="Avatar"
                />
                <div className="text-left">
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{selectedConv.displayName}</h3>
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Active Now</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                <button className="p-2 hover:bg-neutral-50 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer">
                  <Phone className="h-4.5 w-4.5" />
                </button>
                <button className="p-2 hover:bg-neutral-50 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer">
                  <Video className="h-4.5 w-4.5" />
                </button>
                <button className="p-2 hover:bg-neutral-50 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer">
                  <Info className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-neutral-50/20 dark:bg-slate-950" id="chat-messages-container">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    id={`message-bubble-${msg.id}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.sender?.avatarUrl || selectedConv.displayAvatar}
                        className="h-7 w-7 rounded-full object-cover mb-1 border border-neutral-100 dark:border-slate-800"
                        alt="Sender"
                      />
                    )}

                    <div className="flex flex-col gap-1 max-w-[70%]">
                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-amber-500 text-white rounded-br-none shadow-md shadow-amber-500/10'
                            : 'bg-neutral-100 dark:bg-slate-900 text-neutral-800 dark:text-neutral-200 rounded-bl-none border border-neutral-100/50 dark:border-slate-900/50'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Info & seen indicator */}
                      <div className={`flex items-center gap-1.5 text-[9px] text-neutral-400 dark:text-neutral-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && (
                          <span className="text-amber-500">
                            <CheckCheck className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Animated Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2.5 justify-start animate-pulse" id="typing-indicator-container">
                  <img
                    src={selectedConv.displayAvatar}
                    className="h-7 w-7 rounded-full object-cover"
                    alt="Typing..."
                  />
                  <div className="px-4 py-3 bg-neutral-100 dark:bg-slate-900 rounded-2xl rounded-bl-none flex items-center gap-1">
                    <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer toolbar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-100 dark:border-slate-900 flex gap-3 items-center" id="chat-input-form">
              <button
                type="button"
                onClick={() => addToast('info', 'Attachment engine connected to sandbox.')}
                className="p-2 text-neutral-400 hover:text-amber-500 transition-colors cursor-pointer"
                aria-label="Upload photo"
              >
                <Image className="h-5 w-5" />
              </button>
              
              <input
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-grow text-sm px-4 py-3 rounded-xl bg-neutral-50 dark:bg-slate-900/40 border border-neutral-100 dark:border-slate-900 text-neutral-900 dark:text-neutral-100 outline-none focus:border-amber-500 transition-colors"
                id="chat-message-textbox"
              />

              <button
                type="submit"
                disabled={isSending || !messageText.trim()}
                className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-40 disabled:hover:bg-amber-500 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center" id="chat-empty-state">
            <div className="h-16 w-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="font-display font-bold text-lg text-neutral-800 dark:text-white">Your Messenger</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 leading-relaxed">
              Open one of your active threads from the sidebar, or search for other creators to spark an elegant direct connection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
