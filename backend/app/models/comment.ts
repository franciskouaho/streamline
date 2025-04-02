import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Task from '#models/task'
import Project from '#models/project'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare content: string

  @column()
  declare userId: number

  @column()
  declare taskId: number | null

  @column()
  declare projectId: number | null

  @column()
  declare attachments: JSON | null

  @column()
  declare parentCommentId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Task)
  declare task: BelongsTo<typeof Task>

  @belongsTo(() => Project)
  declare project: BelongsTo<typeof Project>

  @belongsTo(() => Comment, {
    foreignKey: 'parentCommentId',
  })
  declare parentComment: BelongsTo<typeof Comment>

  @hasMany(() => Comment, {
    foreignKey: 'parentCommentId',
  })
  declare replies: HasMany<typeof Comment>
}
