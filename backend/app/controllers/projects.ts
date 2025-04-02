import type { HttpContext } from '@adonisjs/core/http'
import { createProjectValidator, updateProjectValidator } from '#validators/project'
import Project from '#models/project'

export default class Projects {
  async index({ response }: HttpContext) {
    const projects = await Project.query().preload('owner').preload('members').preload('tasks')
    return response.ok(projects)
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
      // Récupérer et valider les données
      const requestBody = request.body()
      console.log('Raw request body:', requestBody)

      const data = await request.validateUsing(createProjectValidator)
      console.log('Validated data:', data)

      if (!auth.user) {
        return response.unauthorized('User not authenticated')
      }

      // Créer le projet
      const project = await Project.create({
        name: data.name,
        description: data.description || null,
        status: data.status || 'active',
        ownerId: auth.user.id,
        startDate: null,
        endDate: null,
        settings: null,
      })

      await project.refresh()
      console.log('Created project:', project.toJSON())

      return response.created(project)
    } catch (error) {
      console.error('Project creation error details:', {
        error: error.message,
        stack: error.stack,
        validation: error.messages,
      })

      return response.internalServerError({
        message: 'Error creating project',
        error: error.message,
        details: error.messages,
      })
    }
  }

  async update({ request, params, response }: HttpContext) {
    const project = await Project.findOrFail(params.id)
    const data = await request.validateUsing(updateProjectValidator)
    await project.merge(data).save()
    return response.ok(project)
  }

  async destroy({ params, response }: HttpContext) {
    const project = await Project.findOrFail(params.id)
    await project.delete()
    return response.noContent()
  }
}
