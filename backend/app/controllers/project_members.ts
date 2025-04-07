import type { HttpContext } from '@adonisjs/core/http'
import ProjectMember from '#models/project_member'
import Project from '#models/project'
import User from '#models/user'

export default class ProjectMembersController {
  /**
   * Liste tous les membres d'un projet
   */
  async index({ params, response }: HttpContext) {
    try {
      const projectId = params.projectId
      if (!projectId) {
        return response.badRequest({ message: 'Project ID is required' })
      }

      // Au lieu de récupérer le projet, nous allons simplement l'utiliser dans la requête
      const members = await ProjectMember.query().where('projectId', projectId).preload('user')

      return response.ok(members)
    } catch (error) {
      console.error('Error fetching project members:', error)
      return response.internalServerError({
        message: 'Error fetching project members',
        error: error.message,
      })
    }
  }

  /**
   * Ajoute un nouveau membre au projet
   */
  async store({ request, params, auth, response }: HttpContext) {
    try {
      const projectId = Number.parseInt(params.projectId, 10)
      const { memberId, role = 'member' } = request.body() as {
        memberId: number | string
        role?: string
      }

      console.log('Received request to add member:', { projectId, memberId, role })

      // Vérifier que memberId est défini et valide
      if (!memberId) {
        return response.badRequest({
          message: 'Member ID is required',
        })
      }

      // Assurer que memberId est un nombre
      const userId = Number(memberId)

      if (isNaN(userId)) {
        return response.badRequest({
          message: 'Invalid member ID format',
        })
      }

      // Vérifier si le projet existe
      const project = await Project.findOrFail(projectId)

      // Vérifier si l'utilisateur a le droit d'ajouter des membres
      if (project.ownerId !== auth.user!.id) {
        return response.forbidden({
          message: 'You are not the owner of this project',
        })
      }

      // Vérifier si l'utilisateur à ajouter existe
      const user = await User.find(userId)
      if (!user) {
        return response.badRequest({
          message: `User with ID ${userId} not found`,
        })
      }

      // Vérifier si l'utilisateur est déjà membre
      const existingMember = await ProjectMember.query()
        .where('project_id', projectId)
        .where('user_id', userId)
        .first()

      if (existingMember) {
        return response.conflict({
          message: 'User is already a member of this project',
        })
      }

      // Créer le membre
      const member = await ProjectMember.create({
        projectId,
        userId,
        role,
      })

      await member.load('user')
      console.log('Member added successfully:', {
        id: member.id,
        userId: member.userId,
        projectId: member.projectId,
      })
      return response.created(member)
    } catch (error) {
      console.error('Error adding project member:', error)
      return response.internalServerError({
        message: 'Error adding project member',
        error: error.message,
      })
    }
  }

  /**
   * Route de diagnostic pour aider au débogage des membres de projets
   */
  async debug({ auth, response }: HttpContext) {
    try {
      // 1. Récupérer tous les projets possédés par l'utilisateur
      const ownedProjects = await Project.query().where('owner_id', auth.user!.id)

      // 2. Récupérer tous les memberships de l'utilisateur
      const memberships = await ProjectMember.query().where('user_id', auth.user!.id)

      // 3. Récupérer tous les projets où l'utilisateur est membre
      const memberProjectIds = memberships.map((m) => m.projectId)
      const memberProjects = await Project.query().whereIn('id', memberProjectIds)

      return response.ok({
        userId: auth.user!.id,
        ownedProjects: ownedProjects.map((p) => ({
          id: p.id,
          name: p.name,
        })),
        memberships: memberships.map((m) => ({
          id: m.id,
          projectId: m.projectId,
          role: m.role,
        })),
        memberProjects: memberProjects.map((p) => ({
          id: p.id,
          name: p.name,
          ownerId: p.ownerId,
        })),
      })
    } catch (error) {
      console.error('Error in debug route:', error)
      return response.internalServerError({
        message: 'Error in debug route',
        error: error.message,
      })
    }
  }

  async updateMember({ params, request, response }: HttpContext) {
    try {
      const { projectId, id } = params
      const { role } = request.only(['role'])

      const member = await ProjectMember.query()
        .where('projectId', projectId)
        .where('userId', id)
        .firstOrFail()

      await member.merge({ role }).save()

      return response.ok(member)
    } catch (error) {
      console.error('Error updating project member:', error)
      return response.internalServerError({
        message: 'Error updating project member',
        error: error.message,
      })
    }
  }

  async removeMember({ params, response }: HttpContext) {
    try {
      const { projectId, id } = params

      const member = await ProjectMember.query()
        .where('projectId', projectId)
        .where('userId', id)
        .firstOrFail()

      await member.delete()

      return response.noContent()
    } catch (error) {
      console.error('Error removing project member:', error)
      return response.internalServerError({
        message: 'Error removing project member',
        error: error.message,
      })
    }
  }
}
