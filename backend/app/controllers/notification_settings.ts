import type { HttpContext } from '@adonisjs/core/http'
import NotificationSetting from '#models/notification_setting'

// Interface pour les données de notification settings
interface NotificationSettingsData {
  taskAssigned?: boolean
  taskDeadline?: boolean
  taskComment?: boolean
  projectUpdate?: boolean
  teamMessage?: boolean
  appUpdates?: boolean
  subscriptionAlerts?: boolean
  quietHoursEnabled?: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}

export default class NotificationSettingsController {
  async show({ params, auth, response }: HttpContext) {
    const userId = params.id ? Number.parseInt(params.id, 10) : auth.user!.id

    // Vérifier que l'utilisateur ne demande que ses propres paramètres
    if (userId !== auth.user!.id && auth.user!.role !== 'admin') {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    let settings = await NotificationSetting.findBy('userId', userId)

    // Si l'utilisateur n'a pas encore de paramètres, créons-en par défaut
    if (!settings) {
      settings = await NotificationSetting.create({
        userId,
        taskAssigned: true,
        taskDeadline: true,
        taskComment: true,
        projectUpdate: true,
        teamMessage: true,
        appUpdates: true,
        subscriptionAlerts: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
      })
    }

    return response.ok(settings)
  }

  async update({ params, request, auth, response }: HttpContext) {
    const userId = params.id ? Number.parseInt(params.id, 10) : auth.user!.id

    // Vérifier que l'utilisateur ne modifie que ses propres paramètres
    if (userId !== auth.user!.id && auth.user!.role !== 'admin') {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    const data = request.only([
      'taskAssigned',
      'taskDeadline',
      'taskComment',
      'projectUpdate',
      'teamMessage',
      'appUpdates',
      'subscriptionAlerts',
      'quietHoursEnabled',
      'quietHoursStart',
      'quietHoursEnd',
    ]) as NotificationSettingsData

    let settings = await NotificationSetting.findBy('userId', userId)

    if (!settings) {
      settings = await NotificationSetting.create({
        userId,
        ...data,
      })
    } else {
      await settings.merge(data).save()
    }

    return response.ok(settings)
  }
}
