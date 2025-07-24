import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Category from '#models/category'
import Mode from '#models/mode'

export default class Expense extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public userId!: number

  @column()
  public categoryId!: number | null

  @column()
  public modeId!: number | null

  @column()
  public amount!: number

  @column({ columnName: 'savings_amount' })
  public savingsAmount!: number

  @column()
  public description!: string

  @column.dateTime()
  public date!: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  // Relationships
  @belongsTo(() => User)
  public user!: BelongsTo<typeof User>

  @belongsTo(() => Category)
  public category!: BelongsTo<typeof Category>

  @belongsTo(() => Mode)
  public mode!: BelongsTo<typeof Mode>
}