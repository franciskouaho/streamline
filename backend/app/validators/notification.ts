import vine from '@vinejs/vine'

export interface NotificationData {
  type: string
  data: Record<string, any>
  read?: boolean
  relatedType?: string
  relatedId?: number
}

export interface MarkNotificationAsReadData {
  read?: boolean
}

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
