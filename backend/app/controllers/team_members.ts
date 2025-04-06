import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import ProjectMember from '#models/project_member'
import TeamInvitation from '#models/team_invitation'

export default class TeamMembersController {
  async index({ auth, response }: HttpContext) {
    try {
      console.log('Fetching invitations...')
      const invitations = await TeamInvitation.query()
        .where('invited_by', auth.user!.id)
        .whereIn('status', ['pending', 'accepted'])
        .preload('user')
        .debug(true)

      // Créer un Map pour éviter les doublons
      const membersMap = new Map<string | number, any>()

      // Ajouter les invitations en attente et acceptées
      for (const invitation of invitations) {
        console.log('Processing invitation:', invitation)
        if (invitation.status === 'accepted' && invitation.userId) {
          // Ajouter les membres avec invitations acceptées
          membersMap.set(invitation.userId, {
            id: invitation.userId,
            fullName: invitation.name || invitation.email,
            email: invitation.email,
            photoURL: invitation.user?.avatar,
            role: invitation.role,
            status: 'active',
            projectCount: 0,
          })
        } else if (invitation.status === 'pending') {
          const tempId = `inv_${invitation.id}`
          membersMap.set(tempId, {
            id: tempId,
            fullName: invitation.name || invitation.email,
            email: invitation.email,
            photoURL: null,
            role: invitation.role,
            status: 'pending',
            invitationId: invitation.id,
          })
        }
      }

      console.log('Final members map:', Array.from(membersMap.values()))
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
}
