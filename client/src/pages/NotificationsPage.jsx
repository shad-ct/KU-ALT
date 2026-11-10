import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import api from '../api/client';
import { Bell, CheckCheck } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterUnread, setFilterUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const url = filterUnread ? '/notifications?unread=true' : '/notifications';
      const res = await api.get(url);
      setNotifications(res.data?.data || []);
      setUnreadCount(res.data?.meta?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterUnread]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Updates on your applications, committee reviews, and university notices."
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="h-[36px] px-3.5 rounded-md border border-border-strong bg-surface hover:bg-surface-sub text-[13px] font-medium text-text inline-flex items-center gap-2 transition-colors"
            >
              <CheckCheck size={16} strokeWidth={1.75} className="text-text-muted" />
              <span>Mark all as read</span>
            </button>
          ) : null
        }
      />

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-surface-sub p-1 rounded-md border border-border inline-flex items-center gap-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!filterUnread}
            onClick={() => setFilterUnread(false)}
            className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all inline-flex items-center gap-1.5 ${
              !filterUnread
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <span>All notices</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterUnread}
            onClick={() => setFilterUnread(true)}
            className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all inline-flex items-center gap-1.5 ${
              filterUnread
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <span>Unread only</span>
            {unreadCount > 0 && (
              <span className={`text-[11px] tabular-nums px-1.5 py-0.5 rounded ${
                filterUnread ? 'bg-surface-sub text-text' : 'bg-surface/60 text-text-muted'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-surface border border-border rounded-lg divide-y divide-border overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-[14px] text-text-muted">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-text-muted">
            No notifications in your inbox.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !n.read_at ? 'bg-accent-50/40' : 'hover:bg-surface-sub/50'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      !n.read_at ? 'bg-accent-600' : 'bg-border-strong'
                    }`}
                  />
                  <h3 className="text-[14px] leading-[20px] font-medium text-text">{n.title}</h3>
                  {n.type && (
                    <span className="text-[12px] font-mono text-text-muted">
                      [{n.type.toLowerCase()}]
                    </span>
                  )}
                </div>
                <p className="text-[14px] leading-[22px] text-text-muted pl-4">{n.body}</p>
                <div className="text-[12px] text-text-muted pl-4 tabular-nums">
                  {new Date(n.created_at).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {!n.read_at && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  title="Mark as read"
                  aria-label="Mark as read"
                  className="p-1.5 text-text-muted hover:text-text rounded-md border border-border bg-surface hover:bg-surface-sub flex-shrink-0 transition-colors"
                >
                  <CheckCheck size={16} strokeWidth={1.75} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
