import Category from '#models/category'
import Expense from '#models/expense'
import Wallet from '#models/wallet'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

type CategoryWithExpenses = {
  id: number
  name: string
  expenses: { amount: number }[]
}

export default class ExpenseController {
  /**
   * The core savings calculation logic
   */
  private calculateSavings(amount: number): number {
    const roundedAmount = Math.ceil(amount / 10) * 10
    const savings = roundedAmount - amount
    return Math.min(savings, 10)
  }

  /**
   * Display a list of expenses for the authenticated user
   */
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const expenses = await Expense.query()
      .where('userId', user.id)
      .preload('category')
      .preload('mode')
      .orderBy('date', 'desc')
    return expenses
  }

  /**
   * Create a new expense and update the wallet
   */
  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const schema = vine.object({
      amount: vine.number().positive(),
      description: vine.string().trim(),
      date: vine.string(), // Expecting ISO 8601 format
      categoryId: vine.number().exists(async (db, value) => {
        const category = await db.from('categories').where('id', value).where('user_id', user.id).first()
        return !!category
      }),
      modeId: vine.number().exists(async (db, value) => {
        const mode = await db.from('modes').where('id', value).where('user_id', user.id).first()
        return !!mode
      }),
    })

    const payload = await vine.compile(schema).validate(request.all())
    const savingsAmount = this.calculateSavings(payload.amount)

    const expense = await db.transaction(async (trx) => {
      // 1. Create the expense
      const newExpense = await Expense.create(
        {
          ...payload,
          userId: user.id,
          savingsAmount: savingsAmount,
          date: DateTime.fromISO(payload.date),
        },
        { client: trx }
      )

      // 2. Update the wallet
      const wallet = await Wallet.findByOrFail('userId', user.id, { client: trx })
      wallet.balance += savingsAmount
      await wallet.save()

      // 3. Load relationships for the response
      await newExpense.load('category')
      await newExpense.load('mode')

      return newExpense
    })

    return expense
  }

  /**
   * Delete an expense and revert the wallet transaction
   */
  async destroy({ params, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const expense = await Expense.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await db.transaction(async (trx) => {
      // 1. Revert the wallet balance
      const wallet = await Wallet.findByOrFail('userId', user.id, { client: trx })
      wallet.balance -= expense.savingsAmount
      await wallet.save()

      // 2. Delete the expense
      await expense.useTransaction(trx).delete()
    })

    return { message: 'Expense deleted successfully' }
  }

  /**
   * Get expenses for a specific month and year
   */
  async getByMonth({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const { year, month } = request.qs()

    const expenses = await Expense.query()
      .where('userId', user.id)
      .whereRaw('strftime("%Y", date) = ?', [year])
      .whereRaw('strftime("%m", date) = ?', [month.padStart(2, '0')])
      .preload('category')
      .preload('mode')
      .orderBy('date', 'desc')

    return expenses
  }

  /**
   * Get daily spending summary for the last 30 days
   */
  async getDailySummary({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toISODate()

    const summary = await Expense.query()
      .where('userId', user.id)
      .where('date', '>=', thirtyDaysAgo)
      .select(db.raw('date(date) as expense_date'), db.raw('sum(amount) as total_spent'))
      .groupBy('expense_date')
      .orderBy('expense_date', 'asc')

    return summary
  }

  /**
   * Get spending summary by category for the last 30 days
   */
  async getCategorySummary({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toISODate()

    const summary = (await Category.query()
      .where('userId', user.id)
      .select('id', 'name')
      .with('expenses', (query) => {
        query.where('date', '>=', thirtyDaysAgo).select('amount') 
      })
      .pojo()) as CategoryWithExpenses[]

    // Calculate total spent for each category
    return summary
      .map((category) => ({
        category_id: category.id,
        category_name: category.name,
        total_spent: category.expenses.reduce((sum, exp) => sum + exp.amount, 0),
      }))
      .filter((c) => c.total_spent > 0)
  }
}