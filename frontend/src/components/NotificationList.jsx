import { useEffect, useMemo, useState } from "react";
import { notificationsApi, tokenStorage } from "../services/api";
import { disconnectSocket, getSocket } from "../services/socket";
import "./NotificationList.css";

function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState("loading");
  const currentUser = tokenStorage.getUser();

  useEffect(() => {
    let ignore = false;

    const loadNotifications = async () => {
      if (!currentUser?.id) return;

      try {
        const data = await notificationsApi.getAll();
        if (!ignore) {
          setNotifications(Array.isArray(data) ? data : []);
          setStatus("ready");
        }
      } catch (error) {
        if (!ignore) {
          setStatus("error");
        }
      }
    };

    loadNotifications();

    const socket = getSocket();
    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket?.on("notification", handleNotification);

    return () => {
      ignore = true;
      socket?.off("notification", handleNotification);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    const handleAuthChange = () => {
      if (!tokenStorage.getUser()) {
        disconnectSocket();
      }
    };

    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification
      )
    );

    try {
      await notificationsApi.markAsRead(id);
    } catch (error) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, is_read: false } : notification
        )
      );
    }
  };

  return (
    <section className="notifications-panel" aria-labelledby="notifications-title">
      <div className="notifications-header">
        <div>
          <span className="notifications-eyebrow">Notifications</span>
          <h2 id="notifications-title">Recent updates</h2>
        </div>
        <span className="notifications-count">{unreadCount} unread</span>
      </div>

      {status === "loading" ? (
        <p className="notifications-state">Loading notifications...</p>
      ) : status === "error" ? (
        <p className="notifications-state">Notifications could not be loaded.</p>
      ) : notifications.length === 0 ? (
        <p className="notifications-state">No notifications yet.</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`notification-item${notification.is_read ? "" : " unread"}`}
            >
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <time dateTime={notification.created_at}>
                  {new Date(notification.created_at).toLocaleString()}
                </time>
              </div>
              {!notification.is_read && (
                <button type="button" onClick={() => markAsRead(notification.id)}>
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default NotificationList;
