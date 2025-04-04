import type { HttpContext } from '@adonisjs/core/http'

export default class DeviceTokensController {
  async store({ request, auth, response }: HttpContext) {
    const userId = auth.user!.id

    const deviceData = request.only([
      'deviceId',
      'pushToken',
      'deviceType',
      'deviceName',
      'appVersion',
      'osVersion',
    ])

    console.log(`Token enregistré pour l'utilisateur ${userId}:`, deviceData)

    return response.ok({
      success: true,
      message: "Token d'appareil enregistré avec succès",
    })
  }
}
