import { HttpContext } from '@adonisjs/core/http'
import { loginValidator, registerValidator } from '#validators/auth'
import User from '#models/user'
import Profile from '#models/profile'
import hash from '@adonisjs/core/services/hash'
import { AccessToken } from '@adonisjs/auth/access_tokens'

export default class AuthController {
  /**
   * Traite la demande de connexion d'un utilisateur
   */
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user: User | null = await User.findBy('email', email)

      if (!user) {
        return response.unauthorized({ message: 'Les identifiants fournis sont incorrects' })
      }

      // Vérifier le mot de passe avec le hash stocké
      const isValidPassword = await hash.verify(user.password, password)

      if (!isValidPassword) {
        return response.unauthorized({ message: 'Les identifiants fournis sont incorrects' })
      }

      const token: AccessToken = await User.accessTokens.create(user)

      return response.ok({
        token: token.value?.release(),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      })
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      return response.internalServerError({
        message: 'Une erreur est survenue lors de la connexion',
      })
    }
  }

  /**
   * Traite l'inscription d'un nouvel utilisateur
   */
  async register({ request, response }: HttpContext) {
    console.log('register', request.body())
    const userData = await request.validateUsing(registerValidator)

    const { email, password, fullName } = userData

    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser: User | null = await User.findBy('email', email)
      if (existingUser) {
        return response.conflict({ message: 'Un compte existe déjà avec cette adresse email' })
      }

      // Hasher le mot de passe avant la création
      const hashedPassword = await hash.make(password)

      // Créer l'utilisateur avec le mot de passe hashé
      const user: User = await User.create({
        email,
        password: hashedPassword, // Utiliser le mot de passe hashé
        fullName,
      })

      const token: AccessToken = await User.accessTokens.create(user)

      return response.created({
        token: token.value?.release(),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      })
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      return response.internalServerError({
        message: "Une erreur est survenue lors de l'inscription",
      })
    }
  }

  /**
   * Déconnecte un utilisateur
   */
  public async logout({ auth, response }: HttpContext) {
    const user = await auth.authenticate()

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return response.ok({
      success: true,
      message: 'User logged out',
      data: user,
    })
  }

  /**
   * Met à jour le profil de l'utilisateur connecté
   */
  async update({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = request.only(['fullName', 'email', 'bio', 'avatar', 'role'])

    try {
      // Mise à jour des données de l'utilisateur
      user.merge({
        fullName: data.fullName,
        email: data.email,
        avatar: data.avatar,
        role: data.role,
      })
      await user.save()

      // Mise à jour ou création du profil
      let profile = await Profile.findBy('userId', user.id)
      if (profile) {
        profile.bio = data.bio
        await profile.save()
      } else if (data.bio) {
        await Profile.create({
          userId: user.id,
          bio: data.bio,
        })
      }

      await user.load('profile')

      return response.ok({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
          photoURL: user.avatar,
          bio: user.profile?.bio,
          role: user.role,
        },
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      return response.internalServerError({
        message: 'Une erreur est survenue lors de la mise à jour du profil',
      })
    }
  }

  /**
   * Supprime le compte de l'utilisateur connecté
   */
  async deleteAccount({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      // Révoquer tous les tokens d'accès pour cet utilisateur

      await User.accessTokens.delete(user, user.currentAccessToken.identifier)

      // Supprimer l'utilisateur
      await user.delete()

      return response.ok({
        message: 'Compte supprimé avec succès',
      })
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error)
      return response.internalServerError({
        message: 'Une erreur est survenue lors de la suppression du compte',
      })
    }
  }

  /**
   * Retourne les informations de l'utilisateur connecté
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.user!
    await user.load('profile')

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        profile: user.profile,
      },
    })
  }
}
