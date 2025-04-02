import type { HttpContext } from '@adonisjs/core/http'
import { createTaskValidator, updateTaskValidator } from '#validators/task'
import Task from '#models/task'

export default class Tasks {
  async index({ request, response }: HttpContext) {
    const { projectId } = request.qs()
    const query = Task.query().preload('assignee').preload('subtasks').preload('comments')

    if (projectId) {
      query.where('projectId', projectId)
    }

    const tasks = await query
    return response.ok(tasks)
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      console.log('Request body:', request.body())

      const data = await request.validateUsing(createTaskValidator)
      console.log('Validated data:', data)

      if (!auth.user) {
        console.log('User not authenticated')
        return response.unauthorized('User not authenticated')
      }

      const taskData = {
        ...data,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        createdBy: auth.user.id,
      }

      console.log('Creating task with data:', taskData)
      const task = await Task.create(taskData)

      console.log('Task created:', task.toJSON())
      await task.load('assignee')

      return response.created(task)
    } catch (error) {
      console.error('Task creation error:', {
        message: error.message,
        stack: error.stack,
        validationErrors: error.messages,
      })

      return response.internalServerError({
        message: 'Error creating task',
        error: error.message,
        details: error.messages,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    await task.load('assignee')
    await task.load('subtasks')
    await task.load('comments')
    return response.ok(task)
  }

  async update({ params, request, response }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const data = await request.validateUsing(updateTaskValidator)
    await task.merge(data).save()
    await task.load('assignee')
    return response.ok(task)
  }

  async destroy({ params, response }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    await task.delete()
    return response.noContent()
  }
}
