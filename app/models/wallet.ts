import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Wallet extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public userId!: number

  @column()
  public balance!: number

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  @belongsTo(() => User)
  public user!: BelongsTo<typeof User>
}