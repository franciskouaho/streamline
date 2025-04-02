import vine from '@vinejs/vine'

export const projectMemberValidator = vine.compile(
  vine.object({
    projectId: vine.number(),
    userId: vine.number(),
    role: vine.string().optional().default('member'),
    permissions: vine.object().optional(),
  })
)
