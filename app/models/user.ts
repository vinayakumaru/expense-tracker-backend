import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasOne, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasOne, HasMany } from '@adonisjs/lucid/types/relations'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import Wallet from '#models/wallet'
import Category from '#models/category'
import Mode from '#models/mode'
import Expense from '#models/expense'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  id!: number

  @column()
  fullName!: string | null

  @column()
  email!: string

  @column({ serializeAs: null })
  password!: string

  @column.dateTime({ autoCreate: true })
  createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  updatedAt!: DateTime | null

  /**
   * Relationships
   */
  @hasOne(() => Wallet)
  public wallet!: HasOne<typeof Wallet>

  @hasMany(() => Category)
  public categories!: HasMany<typeof Category>

  @hasMany(() => Mode)
  public modes!: HasMany<typeof Mode>

  @hasMany(() => Expense) // <-- Add this block
  public expenses!: HasMany<typeof Expense>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}