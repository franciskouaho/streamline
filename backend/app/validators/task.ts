import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    description: vine.string().nullable().optional(),
    projectId: vine.number(),
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
