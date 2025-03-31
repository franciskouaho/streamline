export interface SubTask {
  id: number;
  title: string;
  isCompleted: boolean;
  taskId: number;
}

export interface Task {
  id: number;
  title: string;
  type: string;
  date: string;
  time?: string;
  assignees?: Array<{ id: number; image: any }>;
  subTasks?: SubTask[];
  isCompleted: boolean;
}
