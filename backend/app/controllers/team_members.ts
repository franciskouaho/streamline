import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import ProjectMember from '#models/project_member'
import TeamInvitation from '#models/team_invitation'

export default class TeamMembersController {
  async index({ auth, response }: HttpContext) {
    try {
      console.log('Fetching team members...')
      console.log('Current user ID:', auth.user!.id)
      console.log('Current user email:', auth.user!.email)

      // Obtenir toutes les invitations pour les logs de débogage
      const allInvitations = await TeamInvitation.query()
        .debug(true)
        .whereIn('status', ['accepted', 'pending'])

      console.log(
        'All active invitations in the system:',
        allInvitations.map((inv) => ({
          id: inv.id,
          inviter_id: inv.invitedBy,
          invitee_email: inv.email,
          invitee_id: inv.userId,
          status: inv.status,
        }))
      )

      // Créer un Map pour éviter les doublons
      const membersMap = new Map<string | number, any>()

      // Récupérer l'utilisateur connecté
      const currentUser = auth.user!

      // Ajouter l'utilisateur connecté comme premier membre de l'équipe
      membersMap.set(currentUser.id, {
        id: currentUser.id,
        fullName: currentUser.fullName || currentUser.email,
        email: currentUser.email,
        photoURL: currentUser.avatar,
        role: currentUser.role || 'admin',
        status: 'active',
        projectCount: 0,
      })

      // CORRECTION CRITIQUE: Traiter les invitations acceptées même si elles n'ont pas d'userId
      // Pour les invitations où je suis l'inviteur
      const invitationsICreated = await TeamInvitation.query()
        .where('invited_by', auth.user!.id)
        .where('status', 'accepted')
        .debug(true)

      console.log(`Found ${invitationsICreated.length} accepted invitations that I sent`)

      // Pour chaque invitation acceptée, rechercher l'utilisateur par email
      for (const invitation of invitationsICreated) {
        // Si l'userId est défini, utiliser cette valeur
        if (invitation.userId) {
          const invitedUser = await User.find(invitation.userId)
          if (invitedUser && invitedUser.id !== currentUser.id) {
            console.log(`Adding user from userId: ${invitedUser.email} (ID: ${invitedUser.id})`)
            membersMap.set(invitedUser.id, {
              id: invitedUser.id,
              fullName: invitedUser.fullName || invitedUser.email,
              email: invitedUser.email,
              photoURL: invitedUser.avatar,
              role: invitation.role || 'member',
              status: 'active',
              projectCount: 0,
            })
          }
        }
        // Si l'userId n'est pas défini, rechercher par email
        else {
          const invitedUser = await User.findBy('email', invitation.email)
          if (invitedUser && invitedUser.id !== currentUser.id) {
            console.log(
              `Adding user from email lookup: ${invitedUser.email} (ID: ${invitedUser.id})`
            )

            // Mettre à jour l'invitation avec l'ID utilisateur trouvé
            await invitation.merge({ userId: invitedUser.id }).save()

            membersMap.set(invitedUser.id, {
              id: invitedUser.id,
              fullName: invitedUser.fullName || invitedUser.email,
              email: invitedUser.email,
              photoURL: invitedUser.avatar,
              role: invitation.role || 'member',
              status: 'active',
              projectCount: 0,
            })
          }
        }
      }

      // Récupérer l'utilisateur qui a invité l'utilisateur courant
      const invitationsIAccepted = await TeamInvitation.query()
        .where('email', auth.user!.email)
        .where('status', 'accepted')
        .whereNot('invited_by', auth.user!.id)
        .debug(true)

      console.log(`Found ${invitationsIAccepted.length} invitations I accepted`)

      // Ajouter ces utilisateurs inviteurs à la liste des membres
      for (const invitation of invitationsIAccepted) {
        const inviter = await User.find(invitation.invitedBy)
        if (inviter && inviter.id !== currentUser.id) {
          console.log(`Adding user who invited me: ${inviter.email} (ID: ${inviter.id})`)
          membersMap.set(inviter.id, {
            id: inviter.id,
            fullName: inviter.fullName || inviter.email,
            email: inviter.email,
            photoURL: inviter.avatar,
            role: inviter.role || 'admin', // L'inviteur est généralement admin
            status: 'active',
            projectCount: 0,
          })
        }
      }

      // Ajouter les invitations en attente que j'ai envoyées
      const pendingInvitations = await TeamInvitation.query()
        .where('invited_by', auth.user!.id)
        .where('status', 'pending')
        .debug(true)

      console.log(`Found ${pendingInvitations.length} pending invitations I sent`)

      for (const invitation of pendingInvitations) {
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

      // Débogage pour vérifier les membres finaux
      console.log('Final members map count:', membersMap.size)
      console.log(
        'Members to be displayed:',
        Array.from(membersMap.values()).map((m) => ({
          id: m.id,
          name: m.fullName,
          email: m.email,
          status: m.status,
        }))
      )

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
