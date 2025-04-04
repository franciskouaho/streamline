import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Project from '#models/project'
import { DateTime } from 'luxon'

export default class ProjectSeeder extends BaseSeeder {
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

    // Créer un projet par défaut
    await Project.firstOrCreate(
      { id: 1 },
      {
        name: 'Projet par défaut',
        description: 'Projet par défaut pour les tests et les nouvelles tâches',
        status: 'active',
        ownerId: user.id,
        startDate: DateTime.now(),
        endDate: DateTime.now().plus({ months: 3 }),
      }
    )

    console.log('Projet par défaut créé avec succès')
  }
}
