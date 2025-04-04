export interface INotificationSettings {
  task_assigned: boolean;
  task_deadline: boolean;
  task_comment: boolean;
  project_update: boolean;
  team_message: boolean;
  app_updates: boolean;
  subscription_alerts: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface INotification {
  id: number;
  type: string;
  data: any;
  read: boolean;
  relatedType: string | null;
  relatedId: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface DeviceTokenParams {
  userId: string;
  deviceId: string;
  pushToken: string;
  deviceType: string;
  deviceName: string;
  appVersion: string;
  osVersion: string;
}
