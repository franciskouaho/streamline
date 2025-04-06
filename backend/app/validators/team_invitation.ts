import vine from '@vinejs/vine'

export const teamInvitationValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    name: vine.string().optional(),
    role: vine.string().optional(),
    sendNotification: vine.boolean().optional(),
  })
)

export const teamInvitationResponseValidator = vine.compile(
  vine.object({
    notificationId: vine.number().optional(),
  })
)
