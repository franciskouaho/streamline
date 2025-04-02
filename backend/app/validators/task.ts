import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
  vine.object({
    title: vine.string(),
    description: vine.string().optional(),
    dueDate: vine.string().optional(),
    assigneeId: vine.number().optional(),
    status: vine.enum(['todo', 'in_progress', 'done']).optional(),
    priority: vine.enum(['low', 'medium', 'high']).optional(),
    projectId: vine.number(), // Required field
  })
)

export const updateTaskValidator = vine.compile(
  vine.object({
    title: vine.string().optional(),
    description: vine.string().optional(),
    projectId: vine.number().optional(),
    assigneeId: vine.number().optional(),
    status: vine.enum(['todo', 'in_progress', 'done']).optional(),
    priority: vine.enum(['low', 'medium', 'high']).optional(),
    dueDate: vine.string().optional(),
    parentTaskId: vine.number().optional(),
  })
)
