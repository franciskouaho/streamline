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
      const data = await request.validateUsing(createProjectValidator)
      console.log('Received project data:', data)

      if (!auth.user) {
        return response.unauthorized('User not authenticated')
      }

      // Conversion explicite des dates
      const projectData = {
        name: data.name,
        description: data.description,
        status: data.status || 'active',
        ownerId: auth.user.id,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        settings: null,
      }

      console.log('Creating project with:', projectData)
      const project = await Project.create(projectData)
      await project.refresh()

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
