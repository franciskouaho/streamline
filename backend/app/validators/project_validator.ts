import vine from '@vinejs/vine'

export const createProjectValidator = vine.compile(
  vine.object({
    name: vine.string(),
    description: vine.string().optional(),
    status: vine.string().optional().default('active'),
    image: vine.string().optional(),
    startDate: vine.date().optional(),
    endDate: vine.date().optional(),
    settings: vine.object().optional(),
  })
)

export const updateProjectValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    description: vine.string().optional(),
    status: vine.string().optional(),
    image: vine.string().optional(),
    startDate: vine.date().optional(),
    endDate: vine.date().optional(),
    settings: vine.object().optional(),
  })
)
