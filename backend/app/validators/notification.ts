import vine from '@vinejs/vine'

export const notificationValidator = vine.compile(
  vine.object({
    type: vine.string().trim(),
    data: vine.object({}),
    read: vine.boolean().optional(),
    relatedType: vine.string().trim().optional(),
    relatedId: vine.number().optional(),
  })
)

export const markNotificationAsReadValidator = vine.compile(
  vine.object({
    read: vine.boolean().optional(),
  })
)
