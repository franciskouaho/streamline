import vine from '@vinejs/vine'

export const commentValidator = vine.compile(
  vine.object({
    content: vine.string(),
    taskId: vine.number().when(
      vine.object({
        projectId: vine.number().exists(),
      }),
      (group) => group.nullable().optional()
    ),
    projectId: vine.number().when(
      vine.object({
        taskId: vine.number().exists(),
      }),
      (group) => group.nullable().optional()
    ),
    attachments: vine.object().optional(),
    parentCommentId: vine.number().optional(),
  })
)
