import api from './api';
import { INotificationSettings, INotification, DeviceTokenParams } from '../types/notifications';

export const fetchNotifications = async () => {
  try {
    const response = await api.get<INotification[]>('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: number) => {
  const response = await api.put(`/notifications/${notificationId}/read`, { read: true });
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.post('/notifications/mark-all-read');
  return response.data;
};

export const deleteNotification = async (notificationId: number) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

export const fetchNotificationSettings = async (userId: string) => {
  const response = await api.get<INotificationSettings>(`/notification-settings/${userId}`);
  return response.data;
};

export const updateNotificationSettings = async (userId: string, settings: Partial<INotificationSettings>) => {
  const response = await api.put(`/notification-settings/${userId}`, settings);
  return response.data;
};

export const registerDeviceToken = async (params: DeviceTokenParams) => {
  const response = await api.post('/device-tokens', params);
  return response.data;
};

export const sendTestNotification = async (userId: string, deviceToken: string) => {
  const response = await api.post('/send-test-notification', { user_id: userId, device_token: deviceToken });
  return response.data;
};
