import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class NotificationSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare taskAssigned: boolean

  @column()
  declare taskDeadline: boolean

  @column()
  declare taskComment: boolean

  @column()
  declare projectUpdate: boolean

  @column()
  declare teamMessage: boolean

  @column()
  declare appUpdates: boolean

  @column()
  declare subscriptionAlerts: boolean

  @column()
  declare quietHoursEnabled: boolean

  @column()
  declare quietHoursStart: string

  @column()
  declare quietHoursEnd: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
