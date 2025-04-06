import vine from '@vinejs/vine'

export interface TeamInvitationData {
  email: string
  name?: string
  role?: string
  sendNotification?: boolean
}

export interface TeamInvitationResponseData {
  notificationId?: number
}

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
