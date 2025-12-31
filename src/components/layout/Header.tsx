'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeftRight, Bell, CreditCard, Menu, MessageSquare, Search, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  title?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  fromUser?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  group?: {
    id: string;
    name: string;
  };
}

export default function Header({ user, title, showSearch = false, onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications: Notification[] = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (params: { notificationIds?: string[]; markAllRead?: boolean }) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'group_invite':
        return <Users className="w-4 h-4 text-accent-blue" />;
      case 'expense_added':
        return <CreditCard className="w-4 h-4 text-accent-amber" />;
      case 'settlement_received':
        return <ArrowLeftRight className="w-4 h-4 text-accent-emerald" />;
      case 'reminder':
        return <MessageSquare className="w-4 h-4 text-accent-rose" />;
      default:
        return <Bell className="w-4 h-4 text-text-tertiary" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ notificationIds: [notification.id] });
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-primary/80 backdrop-blur-lg border-b border-border-subtle">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-primary-hover transition-colors text-text-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo for mobile */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-emerald to-accent-emerald-dark flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-text">MoneyMate</span>
          </Link>

          {/* Page title for desktop */}
          {title && (
            <h1 className="hidden lg:block text-xl font-semibold text-text">
              {title}
            </h1>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          {showSearch && (
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-elevated border border-border-subtle hover:border-border text-text-tertiary hover:text-text-secondary transition-all">
              <Search className="w-4 h-4" />
              <span className="text-sm">Search...</span>
              <kbd className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary-hover text-text-tertiary">
                /
              </kbd>
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-primary-elevated border border-transparent hover:border-border-subtle transition-all text-text-secondary hover:text-text"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-accent-rose text-white text-xs font-medium rounded-full px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-primary-elevated border border-border rounded-xl shadow-lg overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="font-medium text-text">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAsReadMutation.mutate({ markAllRead: true })}
                      className="text-xs text-accent-emerald hover:text-accent-emerald-dark"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                      <p className="text-sm text-text-tertiary">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-primary-hover transition-colors text-left border-b border-border-subtle last:border-0 ${!notification.isRead ? 'bg-accent-emerald/5' : ''
                          }`}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-hover flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${notification.isRead ? 'text-text-secondary' : 'text-text'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-text-tertiary mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 w-2 h-2 bg-accent-emerald rounded-full mt-2" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          {user && (
            <Link href="/profile" className="flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-9 h-9 rounded-full ring-2 ring-border-subtle hover:ring-accent-emerald transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent-emerald/20 flex items-center justify-center text-accent-emerald font-medium text-sm ring-2 ring-border-subtle hover:ring-accent-emerald transition-all">
                  {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
