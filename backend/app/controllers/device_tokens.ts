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

    // Ici, vous implémenteriez la logique pour enregistrer le token dans la base de données
    // Cette logique pourrait impliquer:
    // 1. Rechercher si ce device existe déjà pour cet utilisateur
    // 2. Si oui, mettre à jour le token
    // 3. Si non, créer un nouvel enregistrement

    console.log(`Token enregistré pour l'utilisateur ${userId}:`, deviceData)

    return response.ok({
      success: true,
      message: "Token d'appareil enregistré avec succès",
    })
  }
}
