'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  order: '📦',
  message: '💬',
  payment: '💳',
  info: 'ℹ️',
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, message, link, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setNotifications((data as Notification[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function markRead(notifId: string) {
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-black">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-semibold text-black underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white text-center py-16" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)' }}>
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="font-black text-black mb-2">No notifications</h3>
            <p className="text-gray-400 text-sm">You're all caught up! Notifications will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className="bg-white flex items-start gap-4 cursor-pointer"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderLeft: notif.is_read ? 'none' : '3px solid #000000',
                }}
                onClick={() => {
                  if (!notif.is_read) markRead(notif.id);
                  if (notif.link) router.push(notif.link);
                }}
              >
                <span className="text-2xl flex-shrink-0">{TYPE_ICONS[notif.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-black">{notif.title}</h3>
                    {!notif.is_read && (
                      <button
                        onClick={e => { e.stopPropagation(); markRead(notif.id); }}
                        className="text-xs text-gray-400 flex-shrink-0 hover:text-black"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
