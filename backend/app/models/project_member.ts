import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Project from '#models/project'

export default class ProjectMember extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'project_id' })
  declare projectId: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column()
  declare role: string

  @column()
  declare permissions: JSON | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Project, {
    foreignKey: 'projectId',
    localKey: 'id',
  })
  declare project: BelongsTo<typeof Project>

  @belongsTo(() => User, {
    foreignKey: 'userId',
    localKey: 'id',
  })
  declare user: BelongsTo<typeof User>
}
