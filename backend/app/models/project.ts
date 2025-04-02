import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Task from '#models/task'
import Comment from '#models/comment'
import ProjectMember from '#models/project_member'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare status: string

  @column()
  declare ownerId: number

  @column()
  declare image: string | null

  @column.date()
  declare startDate: DateTime | null

  @column.date()
  declare endDate: DateTime | null

  @column()
  declare settings: JSON | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof User>

  @hasMany(() => Task)
  declare tasks: HasMany<typeof Task>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @hasMany(() => ProjectMember)
  declare members: HasMany<typeof ProjectMember>
}
