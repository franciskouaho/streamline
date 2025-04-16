import { TaskStatusUpdateInput as TaskStatusUpdate } from './task';  // Importer depuis task.ts
import { Tag } from './tag';

export interface ProjectData {
    id: number;
    name: string;
    description: string | null;
    status: 'active' | 'completed' | 'archived' | 'on_hold';
    ownerId: number;
    image?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    settings?: Record<string, any> | null;
    createdAt: string;
    updatedAt: string | null;

    // Relations
    owner?: {
        id: number;
        fullName: string;
        email: string;
    };
    members?: Array<{
        id: number;
        fullName: string;
        email: string;
        role?: string;
    }>;
    tasks?: Array<{
        id: number;
        title: string;
        status: string;
        priority: string;
        dueDate?: string;
    }>;
}

export interface CreateProjectInput {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

export interface ProjectMember {
  id: number;
  userId: number;
  fullName: string;
  email?: string;
  photoURL?: string;
  role?: string;
  projectId?: number;
}

export interface Project {
  id: number | string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  members?: Array<{ id: number | string; name: string; }>;
  tasks?: Array<{ id: number | string; status: string; }>;
  role?: 'owner' | 'member';
  isInvitation?: boolean;
  createdAt?: string;
  progressPercentage?: number;
  tags?: Tag[]; // Ajout des tags
}

export interface ProjectTask {
  id: number | string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  assigneeId?: number;
  projectId?: number | string;
  tags?: Tag[]; // Ajout des tags aux tâches également
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

export interface ProjectCreateInput {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  members?: (number | string)[];
}

export interface ProjectStatusUpdateInput {
  id: number | string;
  status: string;
}

// Réutiliser l'interface de task.ts au lieu de la redéfinir
export type TaskStatusUpdateInput = TaskStatusUpdate;

export interface ProjectStats {
  total: number;
  ongoing: number;
  inProgress: number;
  completed: number;
  canceled: number;
}

export interface ProjectProgress {
  projectId: number;
  projectName: string; 
  completedPercentage: number;
}

export interface ProjectTimeline {
  date: string;
  inProcess: number;
  completed: number;
}

export interface Task {
  id: number | string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string | Date;
  assignee?: {
    id: number | string;
    fullName: string;
  };
  projectId: number | string;
  createdAt?: string;
  updatedAt?: string;
  tags?: Tag[];
}
