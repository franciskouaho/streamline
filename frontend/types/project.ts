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
  projectId: number;
  role: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
  };
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  ownerId: number;
  startDate: string;
  endDate: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
  };
  members?: ProjectMember[];
  tasks?: Array<{
    id: number;
    title: string;
    status: string;
  }>;
}

export interface ProjectStats {
  ongoing: number;
  inProgress: number;
  completed: number;
  canceled: number;
  total: number;
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
