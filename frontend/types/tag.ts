export interface Tag {
  id: number;
  name: string;
  color: string;
  icon?: string;
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTagInput {
  name: string;
  color: string;
  icon?: string;
}
