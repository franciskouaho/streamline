import { HttpContext } from '@adonisjs/core/http'
import { loginValidator, registerValidator } from '#validators/auth'
import User from '#models/user'
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
        token: token.value.release(),
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
        token: token.value.release(),
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
  /* async logout({ auth, response }: HttpContext) {
    await auth.use('api').revoke()
    return response.ok({
      message: 'Déconnecté avec succès',
    })
  }*/

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
