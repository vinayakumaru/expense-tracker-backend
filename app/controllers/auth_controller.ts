import User from '#models/user'
import Wallet from '#models/wallet'
import Category from '#models/category'
import Mode from '#models/mode'
import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

export default class AuthController {
  /**
   * Register a new user
   */
  async register({ request, response }: HttpContext) {
    // 1. Define validation schema
    const schema = vine.object({
      fullName: vine.string().trim(),
      email: vine.string().trim().email(),
      password: vine.string().minLength(8),
    })

    // 2. Validate request
    const payload = await vine.compile(schema).validate(request.all())

    // 3. Define default data
    const defaultCategories = [
      { name: 'Food' },
      { name: 'Transport' },
      { name: 'Shopping' },
      { name: 'Utilities' },
      { name: 'Rent' },
      { name: 'Health' },
    ]

    const defaultModes = [{ name: 'Cash' }, { name: 'UPI' }, { name: 'Card' }, { name: 'Other' }]

    try {
      const user = await db.transaction(async (trx) => {
        const user = await User.create(payload, { client: trx })

        await Wallet.create({ userId: user.id, balance: 0 }, { client: trx })

        // Create default categories for the user
        const categoriesPayload = defaultCategories.map((cat) => ({ ...cat, userId: user.id }))
        await Category.createMany(categoriesPayload, { client: trx })

        // Create default modes for the user
        const modesPayload = defaultModes.map((mode) => ({ ...mode, userId: user.id }))
        await Mode.createMany(modesPayload, { client: trx })

        return user
      })

      // 5. Create an API token for the new user
      const token = await User.accessTokens.create(user)

      return response.created({ user, token })
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return response.conflict({ message: 'Email already exists' })
      }
      throw error
    }
  }


  /**
   * Log in a user
   */
  async login({ request, response }: HttpContext) {
    // 1. Define validation schema
    const schema = vine.object({
      email: vine.string().trim().email(),
      password: vine.string(),
    })

    // 2. Validate request
    const { email, password } = await vine.compile(schema).validate(request.all())

    // 3. Verify credentials
    const user = await User.verifyCredentials(email, password)

    // 4. Create and return an API token
    const token = await User.accessTokens.create(user)

    return response.ok({ user, token })
  }

  /**
   * Log out a user
   */
  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = auth.user?.currentAccessToken

    if (token) {
      await User.accessTokens.delete(user, token.identifier)
    }

    return response.noContent()
  }
}