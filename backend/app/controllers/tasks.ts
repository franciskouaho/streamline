import type { HttpContext } from '@adonisjs/core/http'
import {
  createTaskValidator,
  updateTaskValidator,
  CreateTaskData,
  UpdateTaskData,
} from '#validators/task'
import Task from '#models/task'
import { DateTime } from 'luxon'

export default class Tasks {
  async index({ request, response }: HttpContext) {
    try {
      const { projectId } = request.qs() as { projectId?: number }
      const query = Task.query().preload('assignee').orderBy('createdAt', 'desc')

      if (projectId) {
        query.where('projectId', projectId)
      }

      const tasks = await query
      console.log('Tasks found:', tasks.length)
      return response.ok(tasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return response.internalServerError({
        message: 'Error fetching tasks',
        error: error.message,
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const data = (await request.validateUsing(createTaskValidator)) as CreateTaskData

      if (!auth.user) {
        return response.unauthorized('User not authenticated')
      }

      const taskData: Partial<Task> = {
        title: data.title,
        description: data.description || null,
        assigneeId: data.assigneeId || null,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        projectId: data.projectId || 1,
        createdBy: auth.user.id,
      }

      // Conversion explicite de dueDate
      if (data.dueDate) {
        taskData.dueDate = DateTime.fromISO(data.dueDate)
      }

      console.log('Creating task with data:', taskData)

      const task = await Task.create(taskData)
      if (task.assigneeId) {
        await task.load('assignee')
      }

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
    try {
      const task = await Task.findOrFail(params.id)
      const data = (await request.validateUsing(updateTaskValidator)) as UpdateTaskData

      console.log('Updating task:', { taskId: params.id, updates: data })

      // Créer une copie des données pour la manipulation
      const processedData: Partial<Task> = { ...data }

      // Convertir dueDate de string à DateTime si elle existe
      if (data.dueDate) {
        processedData.dueDate = DateTime.fromISO(data.dueDate)
      }

      await task.merge(processedData).save()
      await task.load('assignee')

      console.log('Task updated successfully:', task)

      return response.ok(task)
    } catch (error) {
      console.error('Task update error:', {
        message: error.message,
        stack: error.stack,
      })

      return response.internalServerError({
        message: 'Error updating task',
        error: error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    await task.delete()
    return response.noContent()
  }
}
