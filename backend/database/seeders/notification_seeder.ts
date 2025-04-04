import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Notification from '#models/notification'

export default class NotificationSeeder extends BaseSeeder {
  async run() {
    // Récupérer un utilisateur existant (ou créer un si nécessaire)
    const user = await User.firstOrCreate(
      { email: 'test@example.com' },
      {
        email: 'test@example.com',
        password: 'password',
        fullName: 'Test User',
        isActive: true,
        role: 'user',
      }
    )

    // Créer quelques notifications de test
    await Notification.createMany([
      {
        userId: user.id,
        type: 'task_assigned',
        data: {
          message: "Vous avez été assigné à une nouvelle tâche: Conception de la page d'accueil",
          taskId: 1,
          taskTitle: "Conception de la page d'accueil",
        },
        read: false,
        relatedType: 'task',
        relatedId: 1,
      },
      {
        userId: user.id,
        type: 'task_deadline',
        data: {
          message: 'Rappel: La tâche "Rédaction du contenu" est due demain',
          taskId: 2,
          taskTitle: 'Rédaction du contenu',
        },
        read: false,
        relatedType: 'task',
        relatedId: 2,
      },
      {
        userId: user.id,
        type: 'project_update',
        data: {
          message: 'Le projet "Refonte Site Web" a été mis à jour',
          projectId: 1,
          projectName: 'Refonte Site Web',
        },
        read: false,
        relatedType: 'project',
        relatedId: 1,
      },
    ])

    console.log('Notifications de test créées avec succès')
  }
}
