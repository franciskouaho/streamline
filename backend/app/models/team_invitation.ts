import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class TeamInvitation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare name: string | null

  @column()
  declare role: string

  @column()
  declare invitedBy: number

  @column()
  declare status: 'pending' | 'accepted' | 'declined' | 'expired'

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column()
  declare token: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare userId: number | null

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'invitedBy',
  })
  declare inviter: BelongsTo<typeof User>
}
