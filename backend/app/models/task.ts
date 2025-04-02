import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Project from '#models/project'
import Comment from '#models/comment'

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare projectId: number

  @column()
  declare assigneeId: number | null

  @column()
  declare status: string

  @column()
  declare priority: string

  @column.date()
  declare dueDate: DateTime | null

  @column()
  declare parentTaskId: number | null

  @column()
  declare attachments: JSON | null

  @column()
  declare customFields: JSON | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @belongsTo(() => Project)
  declare project: BelongsTo<typeof Project>

  @belongsTo(() => User, {
    foreignKey: 'assigneeId',
  })
  declare assignee: BelongsTo<typeof User>

  @belongsTo(() => Task, {
    foreignKey: 'parentTaskId',
  })
  declare parentTask: BelongsTo<typeof Task>

  @hasMany(() => Task, {
    foreignKey: 'parentTaskId',
  })
  declare subtasks: HasMany<typeof Task>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>
}
