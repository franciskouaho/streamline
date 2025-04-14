export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | string;
  priority?: 'low' | 'medium' | 'high' | string;
  dueDate?: string;
  date?: string;
  projectId?: number | null;  // Permettre null pour cette propriété
  assigneeId?: number | null;
  assignee?: {
    id: number;
    fullName: string;
    email?: string;
    photoURL?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  time?: string;
  assignees?: Array<{
    id: number;
    image: any;
  }>;
}

export interface SubTask {
  id: number;
  title: string;
  completed?: boolean;
  taskId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  dueDate?: string;
  status?: string;
  priority?: string;
  projectId?: number;
  assigneeId?: number;
}

export interface TaskStatusUpdateInput {
  id: number;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId?: number | null;
  assigneeId?: number | null;
}
