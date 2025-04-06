import vine from '@vinejs/vine'

export interface CommentData {
  content: string
  taskId?: number | null
  projectId?: number | null
  attachments?: any
  parentCommentId?: number
}

export const commentValidator = vine.compile(
  vine.object({
    content: vine.string(),
    taskId: vine.number().nullable().optional(),
    projectId: vine.number().nullable().optional(),
    attachments: vine.any().optional(),
    parentCommentId: vine.number().optional(),
  })
)
