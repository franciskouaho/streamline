import vine from '@vinejs/vine'

export const notificationValidator = vine.compile(
  vine.object({
    userId: vine.number(),
    type: vine.string(),
    data: vine.object(),
    read: vine.boolean().optional().default(false),
    relatedType: vine.string().optional(),
    relatedId: vine.number().optional(),
  })
)

export const markNotificationAsReadValidator = vine.compile(
  vine.object({
    read: vine.boolean().default(true),
  })
)
