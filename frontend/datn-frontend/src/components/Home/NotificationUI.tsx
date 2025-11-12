// src/components/Notification.tsx
import { useEffect, useState } from 'react';
import { getAllInappDeliveries, markInappAsRead } from '@/api/notificationApi';
import { getTimeAgo } from '@/lib/utils';

const NotificationUI = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  // Lấy danh sách thông báo từ backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getAllInappDeliveries();
        setNotifications(response.data);
      } catch (error) {
        console.error('Lấy thông báo thất bại:', error);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => n.is_read === false).length;

  // Xử lý click thông báo: đánh dấu đã đọc
  const handleNotificationClick = async (id: string) => {
    try {
      await markInappAsRead(id);

      setNotifications(prev =>
        prev.map(n => (n.inapp_deli_id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Đánh dấu thông báo đã đọc thất bại:', error);
    }
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 focus:outline-none relative">
        <div className="relative">
          <i className="fa-solid fa-bell text-xl"></i>
          {unreadCount > 0 && (
            <span
              className="
                absolute -top-1 -right-1
                bg-red-500 text-white text-[10px] font-bold
                w-4 h-4 flex items-center justify-center
                rounded-full shadow-sm
              "
            >
              {unreadCount}
            </span>
          )}
        </div>
        <span className="uppercase text-sm ml-1">Thông báo</span>
      </button>

      <div className="absolute right-0 top-[30px] min-w-[360px] bg-white shadow-lg rounded-lg py-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
        {notifications.length === 0 ? (
          <div className="px-4 py-3 text-gray-500 text-center">
            Không có thông báo mới
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.inapp_deli_id}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 flex items-start text-left"
              onClick={() => handleNotificationClick(item.inapp_deli_id)}
            >
              <div className="flex-1">
                <p className="text-gray-800 text-[15px] leading-snug">{item.content}</p>
                <span className="text-xs text-gray-500">{getTimeAgo(item.created_at)}</span>
              </div>
              {!item.is_read && (
                <span className="ml-3 mt-2 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationUI;
