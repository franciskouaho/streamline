import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Profile from '#models/profile'
import Project from '#models/project'
import Task from '#models/task'
import Comment from '#models/comment'
import Notification from '#models/notification'
import ProjectMember from '#models/project_member'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare fullName: string | null

  @column()
  declare phoneNumber: string | null

  @column()
  declare avatar: string | null

  @column()
  declare isActive: boolean

  @column()
  declare role: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasOne(() => Profile)
  declare profile: HasOne<typeof Profile>

  @hasMany(() => Project, {
    foreignKey: 'ownerId',
  })
  declare ownedProjects: HasMany<typeof Project>

  @hasMany(() => Task, {
    foreignKey: 'assigneeId',
  })
  declare assignedTasks: HasMany<typeof Task>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @hasMany(() => Notification)
  declare notifications: HasMany<typeof Notification>

  @hasMany(() => ProjectMember)
  declare projectMemberships: HasMany<typeof ProjectMember>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
