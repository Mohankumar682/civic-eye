import { useState, useEffect, useContext } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/Notifications.css';

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [isFirstFetch, setIsFirstFetch] = useState(true);
  const [toast, setToast] = useState(null);
  const [toastClosing, setToastClosing] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Immediate refresh every 4 seconds for real-time notification
      const interval = setInterval(fetchNotifications, 4000);
      return () => clearInterval(interval);
    }
  }, [token, isFirstFetch, prevUnreadCount]);

  const triggerToast = (notification) => {
    setToast(notification);
    setToastClosing(false);
    // Dismiss automatically after 5 seconds
    setTimeout(() => {
      dismissToast();
    }, 5000);
  };

  const dismissToast = () => {
    setToastClosing(true);
    setTimeout(() => {
      setToast(null);
      setToastClosing(false);
    }, 300);
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { 'x-auth-token': token }
      });
      setNotifications(res.data);
      
      // Get unread count
      const unreadRes = await axios.get('http://localhost:5000/api/notifications/unread', {
        headers: { 'x-auth-token': token }
      });
      const newUnreadCount = unreadRes.data.count;

      if (!isFirstFetch && newUnreadCount > prevUnreadCount) {
        // Find the newest unread notification
        const latestUnread = res.data.find(n => !n.read);
        if (latestUnread) {
          triggerToast(latestUnread);
        }
      }

      if (isFirstFetch) {
        setIsFirstFetch(false);
      }
      setUnreadCount(newUnreadCount);
      setPrevUnreadCount(newUnreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'status_change': '📝',
      'upvote': '👍',
      'new_issue': '📍'
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="notification-panel-wrapper">
      {toast && (
        <div className="live-toast-container">
          <div className={`live-toast ${toastClosing ? 'closing' : ''}`}>
            <span className="live-toast-icon">
              {getNotificationIcon(toast.type)}
            </span>
            <div className="live-toast-body">
              <p className="live-toast-title">New Update Received!</p>
              <p className="live-toast-message">{toast.message}</p>
            </div>
            <button className="live-toast-close" onClick={dismissToast}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <button 
        className="notification-bell"
        onClick={() => setShowPanel(!showPanel)}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {showPanel && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-mark-all">
                Mark all as read
              </button>
            )}
            <button 
              className="btn-close"
              onClick={() => setShowPanel(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="panel-content">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={40} />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div 
                    key={notification._id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    <span className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="notification-content">
                      <p className="message">{notification.message}</p>
                      <span className="timestamp">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {!notification.read && <span className="unread-dot"></span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
