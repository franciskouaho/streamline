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
