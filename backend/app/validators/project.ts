import vine from '@vinejs/vine'

export const createProjectValidator = vine.compile(
  vine.object({
    name: vine.string(),
    description: vine.string().optional(),
    status: vine.enum(['active', 'completed', 'archived', 'on_hold']).optional(),
    image: vine.string().optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
  })
)

export const updateProjectValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    description: vine.string().optional(),
    status: vine.enum(['active', 'completed', 'archived', 'on_hold']).optional(),
    image: vine.string().optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
  })
)
