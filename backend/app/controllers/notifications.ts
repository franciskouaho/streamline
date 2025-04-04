import type { HttpContext } from '@adonisjs/core/http'
import { markNotificationAsReadValidator } from '#validators/notification'
import Notification from '#models/notification'

export default class Notifications {
  async index({ auth, response }: HttpContext) {
    try {
      const notifications = await Notification.query()
        .where('userId', auth.user!.id)
        .orderBy('createdAt', 'desc')

      return response.ok(notifications)
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return response.internalServerError({
        message: 'Une erreur est survenue lors de la récupération des notifications',
        error: error.message,
      })
    }
  }

  async markAsRead({ params, request, auth, response }: HttpContext) {
    try {
      const notification = await Notification.findOrFail(params.id)

      if (notification.userId !== auth.user!.id) {
        return response.forbidden({
          message: "Vous n'êtes pas autorisé à modifier cette notification",
        })
      }

      const data = await request.validateUsing(markNotificationAsReadValidator)
      await notification.merge({ read: data.read ?? true }).save()

      return response.ok(notification)
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
      return response.internalServerError({
        message: 'Une erreur est survenue lors du marquage de la notification',
        error: error.message,
      })
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const notification = await Notification.findOrFail(params.id)

      if (notification.userId !== auth.user!.id) {
        return response.forbidden({
          message: "Vous n'êtes pas autorisé à supprimer cette notification",
        })
      }

      await notification.delete()
      return response.noContent()
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error)
      return response.internalServerError({
        message: 'Une erreur est survenue lors de la suppression de la notification',
        error: error.message,
      })
    }
  }

  async markAllAsRead({ auth, response }: HttpContext) {
    try {
      await Notification.query()
        .where('userId', auth.user!.id)
        .where('read', false)
        .update({ read: true })

      return response.noContent()
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error)
      return response.internalServerError({
        message: 'Une erreur est survenue lors du marquage de toutes les notifications',
        error: error.message,
      })
    }
  }

  async sendTestNotification({ request, auth, response }: HttpContext) {
    try {
      const { device_token } = request.only(['device_token'])

      // Créer une notification de test dans la base de données
      await Notification.create({
        userId: auth.user!.id,
        type: 'test_notification',
        data: { message: 'Ceci est une notification de test' },
        read: false,
        relatedType: null,
        relatedId: null,
      })

      // Note: l'envoi réel de la notification push nécessiterait une intégration avec
      // Firebase Cloud Messaging ou un autre service similaire

      return response.ok({
        success: true,
        message: 'Notification de test envoyée et enregistrée',
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification de test:", error)
      return response.internalServerError({
        message: "Une erreur est survenue lors de l'envoi de la notification de test",
        error: error.message,
      })
    }
  }
}
