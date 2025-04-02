import type { HttpContext } from '@adonisjs/core/http'
import { notificationValidator, markNotificationAsReadValidator } from '#validators/notification'
import Notification from '#models/notification'

export default class Notifications {
  async index({ auth, response }: HttpContext) {
    const notifications = await Notification.query()
      .where('userId', auth.user!.id)
      .orderBy('createdAt', 'desc')
    return response.ok(notifications)
  }

  async markAsRead({ params, request, auth, response }: HttpContext) {
    const notification = await Notification.findOrFail(params.id)
    if (notification.userId !== auth.user!.id) {
      return response.forbidden()
    }
    const data = await request.validateUsing(markNotificationAsReadValidator)
    await notification.merge(data).save()
    return response.ok(notification)
  }

  async destroy({ params, auth, response }: HttpContext) {
    const notification = await Notification.findOrFail(params.id)
    if (notification.userId !== auth.user!.id) {
      return response.forbidden()
    }
    await notification.delete()
    return response.noContent()
  }
}
