import type { HttpContext } from '@adonisjs/core/http'
import { commentValidator } from '#validators/comment'
import Comment from '#models/comment'

export default class Comments {
  async index({ request, response }: HttpContext) {
    const { taskId, projectId } = request.qs()
    const query = Comment.query().preload('user').preload('replies')

    if (taskId) query.where('taskId', taskId)
    if (projectId) query.where('projectId', projectId)

    const comments = await query
    return response.ok(comments)
  }

  async store({ request, auth, response }: HttpContext) {
    const data = await request.validateUsing(commentValidator)
    const comment = await Comment.create({
      ...data,
      userId: auth.user!.id,
    })
    await comment.load('user')
    return response.created(comment)
  }

  async show({ params, response }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    await comment.load('user')
    await comment.load('replies')
    return response.ok(comment)
  }

  async update({ params, request, auth, response }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    if (comment.userId !== auth.user!.id) {
      return response.forbidden()
    }
    const data = await request.validateUsing(commentValidator)
    await comment.merge(data).save()
    return response.ok(comment)
  }

  async destroy({ params, auth, response }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    if (comment.userId !== auth.user!.id) {
      return response.forbidden()
    }
    await comment.delete()
    return response.noContent()
  }
}
