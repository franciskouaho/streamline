import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
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

      const projectData = {
        name: data.name,
        description: data.description,
        status: data.status || 'active',
        ownerId: auth.user.id,
        startDate: data.startDate ? DateTime.fromISO(data.startDate) : null,
        endDate: data.endDate ? DateTime.fromISO(data.endDate) : null,
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
    try {
      const project = await Project.findOrFail(params.id)
      const data = await request.validateUsing(updateProjectValidator)

      // Préparer les données à mettre à jour
      const updateData: any = { ...data }

      // Convertir les dates si elles sont présentes
      if (data.startDate) {
        updateData.startDate = DateTime.fromISO(data.startDate)
      } else if (data.startDate === null) {
        updateData.startDate = null
      }

      if (data.endDate) {
        updateData.endDate = DateTime.fromISO(data.endDate)
      } else if (data.endDate === null) {
        updateData.endDate = null
      }

      await project.merge(updateData).save()
      return response.ok(project)
    } catch (error) {
      console.error('Project update error:', error)
      return response.internalServerError({
        message: 'Error updating project',
        error: error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    const project = await Project.findOrFail(params.id)
    await project.delete()
    return response.noContent()
  }
}
