import vine from '@vinejs/vine'

export const projectMemberValidator = vine.compile(
  vine.object({
    userId: vine.number(),
    projectId: vine.number(),
    role: vine.string().optional(),
    permissions: vine.any().optional(),
  })
)
