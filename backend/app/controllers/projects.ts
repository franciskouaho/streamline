import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import {
  createProjectValidator,
  updateProjectValidator,
  CreateProjectData,
  UpdateProjectData,
} from '#validators/project'
import Project from '#models/project'
import ProjectMember from '#models/project_member'
import Notification from '#models/notification'
import User from '#models/user'

interface SerializedMember {
  id: number
  userId: number
  user?: {
    fullName: string
    email: string
    avatar: string | null
  }
  role: string
}

export default class Projects {
  async index({ request, auth, response }: HttpContext) {
    try {
      const filter = request.input('filter', 'all') as 'all' | 'owned' | 'member'
      console.log('Filter requested:', filter, 'User ID:', auth.user!.id)

      let projects: Project[] = []

      // Récupérer d'abord les projets où l'utilisateur est explicitement membre
      const membershipIds = await ProjectMember.query()
        .where('user_id', auth.user!.id)
        .select('project_id')

      const allowedProjectIds = membershipIds.map((m) => m.projectId)

      if (filter === 'owned') {
        // Uniquement les projets possédés
        projects = await Project.query().where('owner_id', auth.user!.id)
      } else if (filter === 'member') {
        // Uniquement les projets où l'utilisateur est membre
        if (allowedProjectIds.length > 0) {
          projects = await Project.query().whereIn('id', allowedProjectIds)
        }
      } else {
        // Combiner les projets possédés et ceux où l'utilisateur est membre
        projects = await Project.query().where((query) => {
          query.where('owner_id', auth.user!.id).orWhereIn('id', allowedProjectIds)
        })
      }

      // Charger les relations pour les projets trouvés
      for (const project of projects) {
        await project.load('owner')
        await project.load('members', (query) => {
          query.select(['id', 'project_id', 'user_id', 'role'])
        })
        await project.load('tasks')
      }

      // Vérification de sécurité supplémentaire
      const filteredProjects = projects.filter(
        (project) => project.ownerId === auth.user!.id || allowedProjectIds.includes(project.id)
      )

      return response.ok(filteredProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      return response.internalServerError({
        message: 'Error fetching projects',
        error: error.message,
        stack: error.stack,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const project = await Project.findOrFail(params.id)
      await project.load('owner')

      // Charger les membres avec les informations complètes des utilisateurs
      await project.load('members', (query) => {
        query.preload('user', (userQuery) => {
          userQuery.select(['id', 'full_name', 'email', 'avatar'])
        })
      })

      await project.load('tasks')

      // Définir une interface pour le type du membre projeté
      interface SerializedMember {
        id: number
        userId: number
        user?: {
          id: number
          fullName: string
          email: string
          avatar?: string
        }
        role: string
      }

      // Transformer les données pour inclure les informations de l'utilisateur dans chaque membre
      const serializedProject = project.serialize()
      serializedProject.members = serializedProject.members.map((member: SerializedMember) => {
        if (member.user) {
          return {
            id: member.id,
            userId: member.userId,
            fullName: member.user.fullName,
            email: member.user.email,
            photoURL: member.user.avatar,
            role: member.role,
          }
        }
        return member
      })

      return response.ok(serializedProject)
    } catch (error) {
      console.error('Error fetching project details:', error)
      return response.internalServerError({
        message: 'Error fetching project details',
        error: error.message,
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const data = (await request.validateUsing(createProjectValidator)) as CreateProjectData
      console.log('Received project data:', data)

      if (!auth.user) {
        return response.unauthorized('User not authenticated')
      }

      const projectData: Partial<Project> = {
        name: data.name,
        description: data.description || null,
        status: data.status || 'active',
        ownerId: auth.user.id,
        startDate: data.startDate ? DateTime.fromISO(data.startDate) : null,
        endDate: data.endDate ? DateTime.fromISO(data.endDate) : null,
        settings: null,
      }

      console.log('Creating project with:', projectData)
      const project = await Project.create(projectData)

      // Ajouter les membres sélectionnés au projet
      if (data.members && Array.isArray(data.members) && data.members.length > 0) {
        for (const memberId of data.members) {
          try {
            // Vérifier si le membre existe
            const member = await User.find(memberId)
            if (member) {
              // Créer le lien membre-projet
              await ProjectMember.create({
                projectId: project.id,
                userId: Number(memberId),
                role: 'member',
              })

              // Créer la notification
              await Notification.create({
                userId: Number(memberId),
                type: 'project_invitation',
                data: {
                  projectId: String(project.id),
                  projectName: project.name,
                  inviterName: auth.user.fullName || auth.user.email,
                } as unknown as JSON,
                read: false,
                relatedType: 'project',
                relatedId: project.id,
              })
            }
          } catch (memberError) {
            console.error(`Error adding member ${memberId}:`, memberError)
          }
        }
      }

      // Actualiser le projet avec les relations
      await project.refresh()
      await project.load('members')

      return response.created(project)
    } catch (error) {
      console.error('Project creation error:', error)
      return response.internalServerError({
        message: 'Error creating project',
        error: error.message,
      })
    }
  }

  async update({ request, params, response }: HttpContext) {
    try {
      const project = await Project.findOrFail(params.id)
      const data = (await request.validateUsing(updateProjectValidator)) as UpdateProjectData

      // Préparer les données à mettre à jour (avec typage partiel)
      const updateData: Partial<Project> = {}

      // Copier les propriétés simples
      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.status !== undefined) updateData.status = data.status
      if (data.image !== undefined) updateData.image = data.image

      // Convertir les dates si elles sont présentes
      if (data.startDate) {
        updateData.startDate = DateTime.fromISO(data.startDate)
      } else if (data.startDate === null) {
        updateData.startDate = null
      }

      if (data.endDate) {
        updateData.endDate = DateTime.fromISO(data.endDate)
      } else if (data.endDate === null) {
        updateData.endDate = null
      }

      // Merger les données avec le projet
      await project.merge(updateData).save()
      return response.ok(project)
    } catch (error) {
      console.error('Project update error:', error)
      return response.internalServerError({
        message: 'Error updating project',
        error: error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    const project = await Project.findOrFail(params.id)
    await project.delete()
    return response.noContent()
  }

  async stats({ auth, response }: HttpContext) {
    try {
      // Approche simplifiée pour éviter les problèmes avec JSON
      // D'abord compter le total des projets
      const ownedProjectsCount = await Project.query()
        .where('owner_id', auth.user!.id)
        .count('* as count')
        .firstOrFail()

      // Récupérer les IDs des projets où l'utilisateur est membre
      const memberProjectIds = await ProjectMember.query()
        .select('project_id')
        .where('user_id', auth.user!.id)
        .exec()

      // Compter les projets complétés
      const completedProjectsCount = await Project.query()
        .where((query) => {
          query.where('owner_id', auth.user!.id).orWhereIn(
            'id',
            memberProjectIds.map((m) => m.projectId)
          )
        })
        .where('status', 'completed')
        .count('* as count')
        .firstOrFail()

      // Compter les projets en cours
      const inProgressProjectsCount = await Project.query()
        .where((query) => {
          query.where('owner_id', auth.user!.id).orWhereIn(
            'id',
            memberProjectIds.map((m) => m.projectId)
          )
        })
        .where('status', 'in_progress')
        .count('* as count')
        .firstOrFail()

      // Calculer le total de tous les projets (propres + membre)
      const memberProjectsCount = await Project.query()
        .whereIn(
          'id',
          memberProjectIds.map((m) => m.projectId)
        )
        .whereNot('owner_id', auth.user!.id)
        .count('* as count')
        .firstOrFail()

      const totalCount =
        Number.parseInt(ownedProjectsCount.$extras.count) +
        Number.parseInt(memberProjectsCount.$extras.count)

      return response.ok({
        total: totalCount,
        completed: completedProjectsCount.$extras.count,
        in_progress: inProgressProjectsCount.$extras.count,
      })
    } catch (error) {
      console.error('Error fetching project stats:', error)
      return response.internalServerError({
        message: 'Error fetching project stats',
        error: error.message,
      })
    }
  }

  async timeline({ auth, response }: HttpContext) {
    try {
      // Approche simplifiée similaire pour la timeline
      // D'abord récupérer les projets que l'utilisateur possède
      const ownedProjects = await Project.query()
        .where('owner_id', auth.user!.id)
        .orderBy('created_at', 'desc')
        .preload('owner')
        .limit(5)

      // Ensuite récupérer les IDs des projets où l'utilisateur est membre
      const memberProjectIds = await ProjectMember.query()
        .select('project_id')
        .where('user_id', auth.user!.id)
        .exec()

      let memberProjects: Project[] = []
      if (memberProjectIds.length > 0) {
        // Récupérer les projets correspondants
        memberProjects = await Project.query()
          .whereIn(
            'id',
            memberProjectIds.map((m) => m.projectId)
          )
          .whereNot('owner_id', auth.user!.id)
          .orderBy('created_at', 'desc')
          .preload('owner')
          .limit(5)
      }

      // Combiner les deux listes, trier par date et limiter à 5
      const allProjects = [...ownedProjects, ...memberProjects]
        .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
        .slice(0, 5)

      return response.ok(allProjects)
    } catch (error) {
      console.error('Error fetching project timeline:', error)
      return response.internalServerError({
        message: 'Error fetching project timeline',
        error: error.message,
      })
    }
  }
}
