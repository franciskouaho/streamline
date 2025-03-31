import api from '../../../services/api';
import { INotificationSettings } from '../types/notifications';

export const fetchNotificationSettings = async (userId: string) => {
  const response = await api.get<INotificationSettings>(`/notification-settings/${userId}`);
  return response.data;
};

export const updateNotificationSettings = async (userId: string, settings: Partial<INotificationSettings>) => {
  const response = await api.put(`/notification-settings/${userId}`, settings);
  return response.data;
};

export const registerDeviceToken = async (params: {
  userId: string;
  deviceId: string;
  pushToken: string;
  deviceType: string;
  deviceName: string;
  appVersion: string;
  osVersion: string;
}) => {
  const response = await api.post('/device-tokens', params);
  return response.data;
};

export const sendTestNotification = async (userId: string, deviceToken: string) => {
  const response = await api.post('/send-test-notification', { user_id: userId, device_token: deviceToken });
  return response.data;
};
