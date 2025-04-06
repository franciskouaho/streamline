import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import { commentValidator, CommentData } from '#validators/comment'

export default class Comments {
  async index({ request, response }: HttpContext) {
    const { taskId, projectId } = request.qs() as { taskId?: number; projectId?: number }
    const query = Comment.query()

    if (taskId) {
      query.where('taskId', taskId)
    } else if (projectId) {
      query.where('projectId', projectId)
    }

    const comments = await query.preload('user')
    return response.ok(comments)
  }

  async store({ request, auth, response }: HttpContext) {
    const data = (await request.validateUsing(commentValidator)) as CommentData

    const comment = await Comment.create({
      content: data.content,
      userId: auth.user!.id,
      taskId: data.taskId || null,
      projectId: data.projectId || null,
      parentCommentId: data.parentCommentId || null,
      // Conversion en JSON valide pour le stockage
      attachments: data.attachments ? JSON.parse(JSON.stringify(data.attachments)) : null,
    })

    await comment.load('user')
    return response.created(comment)
  }

  async show({ params, response }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    await comment.load('user')

    // Charger les réponses si c'est un commentaire parent
    if (!comment.parentCommentId) {
      await comment.load('replies', (query) => {
        query.preload('user')
      })
    }

    return response.ok(comment)
  }

  async update({ params, request, response }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    const data = await request.validateUsing(commentValidator)

    await comment
      .merge({
        ...data,
        // Conversion en JSON valide pour le stockage
        attachments: data.attachments
          ? JSON.parse(JSON.stringify(data.attachments))
          : comment.attachments,
      })
      .save()

    await comment.load('user')
    return response.ok(comment)
  }

  async destroy({ params, response }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    await comment.delete()
    return response.noContent()
  }
}
