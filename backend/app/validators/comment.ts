import vine from '@vinejs/vine'

export const commentValidator = vine.compile(
  vine.object({
    content: vine.string(),
    taskId: vine.number().nullable().optional(),
    projectId: vine.number().nullable().optional(),
    attachments: vine.any().optional(),
    parentCommentId: vine.number().optional(),
  })
)
