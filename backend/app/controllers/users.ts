import type { HttpContext } from '@adonisjs/core/http'
import { createUser, updateUser, login, passwordReset } from '#validators/user'
import User from '#models/user'
import hash from '@adonisjs/core/hash'
import crypto from 'node:crypto'

export default class Users {
  async index({ response }: HttpContext) {
    const users = await User.query().preload('profile')
    return response.ok(users)
  }

  async show({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.load('profile')
    return response.ok(user)
  }

  async store({ request, response }: HttpContext) {
    console.log('request', request)
    const data = await request.validateUsing(createUser)
    console.log('data', data)
    data.password = await hash.make(data.password)
    const user = await User.create(data)
    return response.created(user)
  }

  async update({ request, params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = await request.validateUsing(updateUser)
    if (data.password) {
      data.password = await hash.make(data.password)
    }
    await user.merge(data).save()
    return response.ok(user)
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.noContent()
  }

  async authenticate({ request, response, auth }: HttpContext) {
    const { email, password, remember } = await request.validateUsing(login)
    const user = await auth.attempt(email, password)

    // Si remember est true, on met à jour le remember_me_token
    if (remember) {
      const rememberToken = crypto.randomBytes(20).toString('hex')
      await user.merge({ remember_me_token: rememberToken }).save()
    }

    const token = await auth.use('api').generate(user, {
      expiresIn: remember ? '30 days' : '1 day',
    })

    return response.ok({
      token: token.value,
      user,
    })
  }
}
