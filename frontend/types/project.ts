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
  userId?: number;
  projectId?: number;
  role?: string;
  fullName?: string;
  email?: string;
  photoURL?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  members?: Array<{
    id: number;
    fullName?: string;
    email?: string;
    photoURL?: string;
  }>;
  tasks?: Task[];
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

export interface TaskStatusUpdateInput {
  id: number;
  status: string;
  priority?: string;
  dueDate?: string;
  assigneeId?: number;
}

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
}
