import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import ProjectMember from '#models/project_member'
import Project from '#models/project'

export default class TeamMembersController {
  async index({ auth, response }: HttpContext) {
    try {
      console.log('Fetching team members...')
      console.log('Current user ID:', auth.user!.id)

      // Créer un Map pour éviter les doublons
      const membersMap = new Map<string | number, any>()

      // On ne montre plus l'utilisateur connecté dans la liste
      // Récupérer uniquement les membres avec qui l'utilisateur a une relation directe

      // 1. Récupérer les membres des projets où l'utilisateur est propriétaire
      const ownedProjects = await Project.query()
        .where('owner_id', auth.user!.id)
        .preload('members', (query) => {
          query.preload('user')
        })

      // 2. Récupérer les membres des projets où l'utilisateur est membre
      const projectMemberships = await ProjectMember.query()
        .where('user_id', auth.user!.id)
        .select('project_id')

      const projectIds = projectMemberships.map((m) => m.projectId)

      const sharedProjects = await Project.query()
        .whereIn('id', projectIds)
        .preload('members', (query) => {
          query.preload('user')
        })

      // Ajouter uniquement les membres avec qui l'utilisateur partage des projets
      const addMemberFromProject = (project: any) => {
        project.members.forEach((member: any) => {
          if (member.user && member.user.id !== auth.user!.id) {
            membersMap.set(member.user.id, {
              id: member.user.id,
              fullName: member.user.fullName || member.user.email,
              email: member.user.email,
              photoURL: member.user.avatar,
              role: member.role || 'member',
              status: 'active',
              projectCount: 0,
            })
          }
        })
      }

      // Traiter les projets possédés et partagés
      ownedProjects.forEach(addMemberFromProject)
      sharedProjects.forEach(addMemberFromProject)

      console.log('Final members map:', membersMap)

      return response.ok(Array.from(membersMap.values()))
    } catch (error) {
      console.error('Error in TeamMembersController.index:', error)
      return response.internalServerError({
        message: "Une erreur est survenue lors de la récupération des membres de l'équipe",
        error: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)

      // Obtenir les projets auxquels cet utilisateur participe
      const projectMembers = await ProjectMember.query().where('userId', user.id).preload('project')

      const projects = projectMembers.map((member) => member.project)

      return response.ok({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        photoURL: user.avatar,
        role: user.role,
        status: 'active',
        projects,
      })
    } catch (error) {
      console.error('Error fetching team member:', error)
      return response.internalServerError({
        message: "Une erreur est survenue lors de la récupération du membre de l'équipe",
        error: error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      const { role } = request.only(['role'])

      await user.merge({ role }).save()

      return response.ok({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        photoURL: user.avatar,
        role: user.role,
        status: 'active',
      })
    } catch (error) {
      console.error('Error updating team member:', error)
      return response.internalServerError({
        message: "Une erreur est survenue lors de la mise à jour du membre de l'équipe",
        error: error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await ProjectMember.query().where('userId', params.id).delete()

      return response.ok({
        message: "Membre supprimé avec succès de l'équipe",
      })
    } catch (error) {
      console.error('Error removing team member:', error)
      return response.internalServerError({
        message: "Une erreur est survenue lors de la suppression du membre de l'équipe",
        error: error.message,
      })
    }
  }

  // Route de diagnostic pour afficher tous les utilisateurs
  async debug({ response }: HttpContext) {
    try {
      // Récupérer tous les utilisateurs sans filtre
      const allUsers = await User.query().debug(true)

      return response.ok({
        totalUsers: allUsers.length,
        users: allUsers.map((user) => ({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        })),
      })
    } catch (error) {
      console.error('Error in debug route:', error)
      return response.internalServerError({
        message: 'Erreur lors du diagnostic',
        error: error.message,
      })
    }
  }
}
