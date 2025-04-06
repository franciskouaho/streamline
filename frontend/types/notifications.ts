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
  userId: number;
  type: string;
  title?: string;
  message?: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  // Nouveaux champs pour les invitations
  actionRequired?: boolean;
  actions?: {
    accept?: boolean;
    decline?: boolean;
  };
}

export interface DeviceRegistration {
  userId: number;
  deviceId: string;
  pushToken: string;
  deviceType: string;
  deviceName: string;
  appVersion: string;
  osVersion: string;
}
