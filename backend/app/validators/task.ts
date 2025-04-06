import vine from '@vinejs/vine'

export interface CreateTaskData {
  title: string
  description?: string | null
  projectId?: number
  assigneeId?: number | null
  status?: 'todo' | 'in_progress' | 'done'
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string | null
}

export interface UpdateTaskData {
  title?: string
  description?: string | null
  projectId?: number
  assigneeId?: number | null
  status?: 'todo' | 'in_progress' | 'done'
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string | null
}

export const createTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    description: vine.string().nullable().optional(),
    projectId: vine.number().optional(), // Rendre optionnel
    assigneeId: vine.number().nullable().optional(),
    status: vine.enum(['todo', 'in_progress', 'done']).optional(),
    priority: vine.enum(['low', 'medium', 'high']).optional(),
    dueDate: vine.string().nullable().optional(),
  })
)

export const updateTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).optional(),
    description: vine.string().nullable().optional(),
    projectId: vine.number().optional(),
    assigneeId: vine.number().nullable().optional(),
    status: vine.enum(['todo', 'in_progress', 'done']).optional(),
    priority: vine.enum(['low', 'medium', 'high']).optional(),
    dueDate: vine.string().nullable().optional(),
  })
)
