import type { HttpContext } from '@adonisjs/core/http'

interface DeviceTokenData {
  deviceId: string
  pushToken: string
  deviceType: string
  deviceName?: string
  appVersion?: string
  osVersion?: string
}

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
    ]) as DeviceTokenData

    console.log(`Token enregistré pour l'utilisateur ${userId}:`, deviceData)

    return response.ok({
      success: true,
      message: "Token d'appareil enregistré avec succès",
    })
  }
}
