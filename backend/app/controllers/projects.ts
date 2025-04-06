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

export default class Projects {
  async index({ request, auth, response }: HttpContext) {
    try {
      const filter = request.input('filter', 'all') as 'all' | 'owned' | 'member'
      console.log('Filter requested:', filter, 'User ID:', auth.user!.id)

      let projects: Project[] = []

      // Vérification: est-ce que la table project_members contient des entrées pour cet utilisateur?
      const allMemberships = await ProjectMember.query().where('user_id', auth.user!.id).exec()

      console.log(
        'DEBUG - Tous les memberships pour user',
        auth.user!.id,
        ':',
        allMemberships.length
      )
      console.log(
        'DEBUG - Memberships details:',
        allMemberships.map((m) => ({
          id: m.id,
          projectId: m.projectId,
          userId: m.userId,
          role: m.role,
        }))
      )

      if (filter === 'owned') {
        // Récupérer les projets possédés par l'utilisateur
        projects = await Project.query().where('owner_id', auth.user!.id)
        console.log('SQL debug - owned projects:', projects.length)
      } else if (filter === 'member') {
        // Correction importante: ne pas utiliser .where('user_id', auth.user!.id)
        // mais plutôt .where('user_id', '=', auth.user!.id) pour être explicite
        const memberProjectIds = await ProjectMember.query()
          .select('project_id')
          .where('user_id', '=', auth.user!.id)
          .exec()

        console.log('DEBUG - memberProjectIds:', memberProjectIds)

        if (memberProjectIds && memberProjectIds.length > 0) {
          const projectIds = memberProjectIds.map((m) => m.projectId)
          console.log('DEBUG - projectIds as member:', projectIds)

          // Récupérer tous les projets, même ceux dont l'utilisateur est propriétaire
          // (pour éviter de filtrer par erreur)
          projects = await Project.query().whereIn('id', projectIds)

          // Filtrer après si nécessaire
          const excludeOwned = request.input('excludeOwned', false) === true
          if (excludeOwned) {
            projects = projects.filter((p) => p.ownerId !== auth.user!.id)
          }
        }

        console.log('SQL debug - member projects:', projects.length)
      } else {
        // filter === 'all'
        // 1. Récupérer tous les projets possédés
        const ownedProjects = await Project.query().where('owner_id', auth.user!.id)
        console.log('DEBUG - Owned projects count:', ownedProjects.length)
        console.log(
          'DEBUG - Owned projects:',
          ownedProjects.map((p) => p.id)
        )

        // 2. Récupérer tous les IDs des projets où l'utilisateur est membre
        const memberProjectIds = await ProjectMember.query()
          .select('project_id')
          .where('user_id', '=', auth.user!.id)
          .exec()

        console.log(
          'DEBUG - Member project IDs:',
          memberProjectIds.map((m) => m.projectId)
        )

        // 3. Récupérer ces projets
        let memberProjects: Project[] = []
        if (memberProjectIds && memberProjectIds.length > 0) {
          const projectIds = memberProjectIds.map((m) => m.projectId)

          memberProjects = await Project.query().whereIn('id', projectIds)

          console.log('DEBUG - Member projects after query:', memberProjects.length)
          console.log(
            'DEBUG - Member projects IDs:',
            memberProjects.map((p) => p.id)
          )
        }

        // 4. Combiner sans doublons (basé sur l'ID)
        const projectMap = new Map()

        // Ajouter les projets possédés
        ownedProjects.forEach((project) => {
          projectMap.set(project.id, project)
        })

        // Ajouter les projets où l'utilisateur est membre
        memberProjects.forEach((project) => {
          if (!projectMap.has(project.id)) {
            projectMap.set(project.id, project)
          }
        })

        // Convertir la Map en tableau
        projects = Array.from(projectMap.values())

        console.log(
          `SQL debug - all projects: ${projects.length} (owned: ${ownedProjects.length}, member: ${memberProjects.length})`
        )
      }

      // Vérifier que nous avons des projets à retourner
      console.log(
        'Projects before loading relations:',
        projects.map((p) => ({ id: p.id, name: p.name, ownerId: p.ownerId }))
      )

      // Charger les relations pour les projets trouvés
      for (const project of projects) {
        await project.load('owner')
        await project.load('members', (query) => {
          // Éviter de charger user, mais récupérer les données nécessaires
          query.select(['id', 'project_id', 'user_id', 'role'])
        })
        await project.load('tasks')
      }

      // Enrichir les projets avec des informations supplémentaires
      const enrichedProjects = projects.map((project) => {
        // Vérifier si l'utilisateur est membre de ce projet
        const isMember = project.members.some((member) => {
          console.log(
            `DEBUG - Checking member in project ${project.id}:`,
            member.userId,
            '=?=',
            auth.user!.id
          )
          return member.userId === auth.user!.id
        })

        return {
          ...project.serialize(),
          userRole: project.ownerId === auth.user!.id ? 'owner' : 'member',
          isOwner: project.ownerId === auth.user!.id,
          isMember: isMember || project.ownerId === auth.user!.id,
        }
      })

      return response.ok(enrichedProjects)
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
    const project = await Project.findOrFail(params.id)
    await project.load('owner')
    await project.load('members')
    await project.load('tasks')
    return response.ok(project)
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
                  // Conversion explicite en JSON pour éviter l'erreur de typage
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
