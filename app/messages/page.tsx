'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: { full_name: string | null; email: string } | null;
  receiver: { full_name: string | null; email: string } | null;
}

interface Conversation {
  otherId: string;
  otherName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }
      setCurrentUserId(user.id);

      // Get all messages involving this user
      const { data } = await supabase
        .from('chat_messages')
        .select(`
          id, sender_id, receiver_id, content, is_read, created_at,
          sender:users!chat_messages_sender_id_fkey ( full_name, email ),
          receiver:users!chat_messages_receiver_id_fkey ( full_name, email )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      const msgs = (data as unknown as Message[]) || [];

      // Build conversations
      const convMap = new Map<string, { lastMessage: string; lastTime: string; unread: number; name: string }>();
      for (const msg of msgs) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
        const otherName = otherUser?.full_name || otherUser?.email || otherId;
        const existing = convMap.get(otherId);
        const unreadAdd = (!msg.is_read && msg.receiver_id === user.id) ? 1 : 0;
        convMap.set(otherId, {
          lastMessage: msg.content,
          lastTime: msg.created_at,
          unread: (existing?.unread || 0) + unreadAdd,
          name: otherName,
        });
      }

      const convs: Conversation[] = Array.from(convMap.entries()).map(([id, v]) => ({
        otherId: id,
        otherName: v.name,
        lastMessage: v.lastMessage,
        lastTime: v.lastTime,
        unread: v.unread,
      }));
      setConversations(convs);
      setLoading(false);

      if (convs.length > 0) openConversation(convs[0].otherId, msgs, user.id);
    }
    load();
  }, [router]);

  function openConversation(otherId: string, msgs: Message[], uid: string) {
    setActiveConv(otherId);
    const filtered = msgs.filter(m =>
      (m.sender_id === uid && m.receiver_id === otherId) ||
      (m.receiver_id === uid && m.sender_id === otherId)
    );
    setMessages(filtered);

    // Mark as read
    const supabase = createClient();
    supabase.from('chat_messages')
      .update({ is_read: true })
      .eq('receiver_id', uid)
      .eq('sender_id', otherId)
      .then(() => {});
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    setSending(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: activeConv,
        content: newMessage.trim(),
      })
      .select(`
        id, sender_id, receiver_id, content, is_read, created_at,
        sender:users!chat_messages_sender_id_fkey ( full_name, email ),
        receiver:users!chat_messages_receiver_id_fkey ( full_name, email )
      `)
      .single();

    if (!error && data) {
      setMessages(prev => [...prev, data as unknown as Message]);
      setNewMessage('');
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading messages...</div>
      </div>
    );
  }

  const activeConvData = conversations.find(c => c.otherId === activeConv);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black  mb-6">Messages</h1>

        <div
          className="bg-white flex overflow-hidden"
          style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)', height: 'calc(100vh - 220px)', minHeight: '500px' }}
        >
          {/* Left panel: Conversations */}
          <div
            className="flex-shrink-0 border-r border-gray-100 overflow-y-auto"
            style={{ width: '280px' }}
          >
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold  text-sm">Conversations</h2>
            </div>

            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">💬</div>
                <p className="text-xs text-gray-400">No messages yet</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.otherId}
                  onClick={() => {
                    setActiveConv(conv.otherId);
                    const supabase = createClient();
                    supabase.from('chat_messages')
                      .select(`id, sender_id, receiver_id, content, is_read, created_at,
                        sender:users!chat_messages_sender_id_fkey ( full_name, email ),
                        receiver:users!chat_messages_receiver_id_fkey ( full_name, email )
                      `)
                      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${conv.otherId}),and(receiver_id.eq.${currentUserId},sender_id.eq.${conv.otherId})`)
                      .order('created_at', { ascending: true })
                      .then(({ data }) => setMessages((data as unknown as Message[]) || []));
                  }}
                  className="w-full text-left p-4 transition-colors border-b border-gray-50"
                  style={{
                    background: activeConv === conv.otherId ? 'var(--bg)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-shrink-0 flex items-center justify-center font-bold text-sm"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000', color: 'var(--surface)' }}
                    >
                      {conv.otherName[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold  truncate">{conv.otherName}</p>
                        {conv.unread > 0 && (
                          <span
                            className="flex-shrink-0 text-xs font-bold text-white ml-1 px-1.5"
                            style={{ background: '#000', borderRadius: 'var(--radius-pill)', minWidth: '18px', textAlign: 'center' }}
                          >
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right panel: Chat window */}
          <div className="flex-1 flex flex-col">
            {activeConv ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div
                    className="flex items-center justify-center font-bold text-sm"
                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#000', color: 'var(--surface)' }}
                  >
                    {activeConvData?.otherName[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-bold  text-sm">{activeConvData?.otherName}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => {
                    const isMine = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className="px-4 py-2.5 text-sm max-w-xs"
                          style={{
                            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isMine ? 'var(--active-bg)' : 'var(--bg)',
                            color: isMine ? 'var(--surface)' : 'var(--text-primary)',
                          }}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs mt-1" style={{ opacity: 0.6 }}>
                            {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send message */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 text-sm  outline-none"
                    style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-pill)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-5 py-2.5 text-sm font-bold text-white"
                    style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)', opacity: sending ? 0.6 : 1 }}
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-400 text-sm">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
