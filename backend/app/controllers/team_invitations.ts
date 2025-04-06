import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import {
  teamInvitationValidator,
  teamInvitationResponseValidator,
} from '#validators/team_invitation'
import TeamInvitation from '#models/team_invitation'
import Notification from '#models/notification'
import User from '#models/user'

export default class TeamInvitationsController {
  async index({ auth, response }: HttpContext) {
    try {
      const invitations = await TeamInvitation.query()
        .where('invitedBy', auth.user!.id)
        .orderBy('createdAt', 'desc')
        .preload('inviter')

      return response.ok(invitations)
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error)
      return response.internalServerError({
        message: 'Une erreur est survenue lors de la récupération des invitations',
        error: error.message,
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(teamInvitationValidator)

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findBy('email', data.email)

      // Vérifier si une invitation est déjà en cours pour cet email
      const existingInvitation = await TeamInvitation.query()
        .where('email', data.email)
        .where('status', 'pending')
        .first()

      if (existingInvitation) {
        return response.conflict({
          message: 'Une invitation est déjà en cours pour cet e-mail',
        })
      }

      // Générer un token unique
      const token = randomBytes(32).toString('hex')

      // Créer l'invitation
      const invitation = await TeamInvitation.create({
        email: data.email,
        name: data.name || '',
        role: data.role || 'member',
        invitedBy: auth.user!.id,
        status: 'pending',
        expiresAt: DateTime.now().plus({ days: 7 }),
        token,
      })

      // Si l'utilisateur est déjà inscrit, créer une notification
      if (existingUser && data.sendNotification) {
        await Notification.create({
          userId: existingUser.id,
          type: 'team_invitation',
          data: {
            invitationId: invitation.id,
            inviterName: auth.user!.fullName || auth.user!.email,
            message: `Vous avez été invité à rejoindre l'équipe par ${auth.user!.fullName || auth.user!.email}`,
          },
          read: false,
          relatedType: 'team_invitation',
          relatedId: invitation.id,
        })
      }

      // TODO: Envoyer un email si l'utilisateur n'est pas encore inscrit

      return response.created(invitation)
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error)
      return response.internalServerError({
        message: "Une erreur est survenue lors de la création de l'invitation",
        error: error.message,
      })
    }
  }

  async show({ params, auth, response }: HttpContext) {
    try {
      const invitation = await TeamInvitation.findOrFail(params.id)

      // Vérifier que l'utilisateur a le droit de voir cette invitation
      if (invitation.invitedBy !== auth.user!.id && invitation.email !== auth.user!.email) {
        return response.forbidden({
          message: "Vous n'avez pas les droits pour accéder à cette invitation",
        })
      }

      await invitation.load('inviter')

      return response.ok(invitation)
    } catch (error) {
      console.error("Erreur lors de la récupération de l'invitation:", error)
      return response.internalServerError({
        message: "Une erreur est survenue lors de la récupération de l'invitation",
        error: error.message,
      })
    }
  }

  async accept({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(teamInvitationResponseValidator)
      const invitation = await TeamInvitation.findOrFail(params.id)

      // Vérifier que l'invitation est bien destinée à l'utilisateur connecté
      if (invitation.email !== auth.user!.email) {
        return response.forbidden({
          message: 'Cette invitation ne vous est pas destinée',
        })
      }

      // Vérifier que l'invitation est toujours en attente
      if (invitation.status !== 'pending') {
        return response.badRequest({
          message: `Cette invitation a déjà été ${invitation.status === 'accepted' ? 'acceptée' : 'refusée ou a expiré'}`,
        })
      }

      // Vérifier que l'invitation n'a pas expiré
      if (invitation.expiresAt && invitation.expiresAt < DateTime.now()) {
        await invitation.merge({ status: 'expired' }).save()
        return response.badRequest({
          message: 'Cette invitation a expiré',
        })
      }

      // Mettre à jour le statut de l'invitation
      await invitation.merge({ status: 'accepted' }).save()

      // Si une notification a été spécifiée, la marquer comme lue
      if (data.notificationId) {
        const notification = await Notification.find(data.notificationId)
        if (notification && notification.userId === auth.user!.id) {
          await notification.merge({ read: true }).save()
        }
      }

      // L'utilisateur est désormais un membre de l'équipe
      // Ici, vous pourriez ajouter une logique supplémentaire selon votre modèle de données
      // Par exemple, ajouter l'utilisateur à tous les projets par défaut

      return response.ok({
        message: 'Invitation acceptée avec succès',
        invitation,
      })
    } catch (error) {
      console.error("Erreur lors de l'acceptation de l'invitation:", error)
      return response.internalServerError({
        message: "Une erreur est survenue lors de l'acceptation de l'invitation",
        error: error.message,
      })
    }
  }

  async decline({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(teamInvitationResponseValidator)
      const invitation = await TeamInvitation.findOrFail(params.id)

      // Vérifier que l'invitation est bien destinée à l'utilisateur connecté
      if (invitation.email !== auth.user!.email) {
        return response.forbidden({
          message: 'Cette invitation ne vous est pas destinée',
        })
      }

      // Vérifier que l'invitation est toujours en attente
      if (invitation.status !== 'pending') {
        return response.badRequest({
          message: `Cette invitation a déjà été ${invitation.status === 'declined' ? 'refusée' : 'acceptée ou a expiré'}`,
        })
      }

      // Mettre à jour le statut de l'invitation
      await invitation.merge({ status: 'declined' }).save()

      // Si une notification a été spécifiée, la marquer comme lue
      if (data.notificationId) {
        const notification = await Notification.find(data.notificationId)
        if (notification && notification.userId === auth.user!.id) {
          await notification.merge({ read: true }).save()
        }
      }

      return response.ok({
        message: 'Invitation refusée',
        invitation,
      })
    } catch (error) {
      console.error("Erreur lors du refus de l'invitation:", error)
      return response.internalServerError({
        message: "Une erreur est survenue lors du refus de l'invitation",
        error: error.message,
      })
    }
  }

  async resend({ params, auth, response }: HttpContext) {
    try {
      const invitation = await TeamInvitation.findOrFail(params.id)

      // Vérifier que l'utilisateur est bien l'auteur de l'invitation
      if (invitation.invitedBy !== auth.user!.id) {
        return response.forbidden({
          message: "Vous n'avez pas les droits pour renvoyer cette invitation",
        })
      }

      // Vérifier que l'invitation est toujours en attente
      if (invitation.status !== 'pending') {
        return response.badRequest({
          message: 'Seules les invitations en attente peuvent être renvoyées',
        })
      }

      // Mettre à jour la date d'expiration
      await invitation
        .merge({
          expiresAt: DateTime.now().plus({ days: 7 }),
          updatedAt: DateTime.now(),
        })
        .save()

      // Vérifier si l'utilisateur existe
      const existingUser = await User.findBy('email', invitation.email)

      if (existingUser) {
        // Créer une nouvelle notification
        await Notification.create({
          userId: existingUser.id,
          type: 'team_invitation',
          data: {
            invitationId: invitation.id,
            inviterName: auth.user!.fullName || auth.user!.email,
            message: `Vous avez été invité à rejoindre l'équipe par ${auth.user!.fullName || auth.user!.email}`,
          },
          read: false,
          relatedType: 'team_invitation',
          relatedId: invitation.id,
        })
      }

      // TODO: Renvoyer un email si l'utilisateur n'est pas encore inscrit

      return response.ok({
        message: 'Invitation renvoyée avec succès',
        invitation,
      })
    } catch (error) {
      console.error("Erreur lors du renvoi de l'invitation:", error)
      return response.internalServerError({
        message: "Une erreur est survenue lors du renvoi de l'invitation",
        error: error.message,
      })
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const invitation = await TeamInvitation.findOrFail(params.id)

      // Vérifier que l'utilisateur est bien l'auteur de l'invitation
      if (invitation.invitedBy !== auth.user!.id) {
        return response.forbidden({
          message: "Vous n'avez pas les droits pour supprimer cette invitation",
        })
      }

      // Supprimer les notifications associées
      await Notification.query()
        .where('relatedType', 'team_invitation')
        .where('relatedId', invitation.id)
        .delete()

      // Supprimer l'invitation
      await invitation.delete()

      return response.ok({
        message: 'Invitation supprimée avec succès',
      })
    } catch (error) {
      console.error("Erreur lors de la suppression de l'invitation:", error)
      return response.internalServerError({
        message: "Une erreur est survenue lors de la suppression de l'invitation",
        error: error.message,
      })
    }
  }
}
