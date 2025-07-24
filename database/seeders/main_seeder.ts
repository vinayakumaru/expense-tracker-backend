import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Wallet from '#models/wallet'
import Category from '#models/category'
import Mode from '#models/mode'
import Expense from '#models/expense'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  private calculateSavings(amount: number): number {
    const roundedAmount = Math.ceil(amount / 10) * 10
    return Math.min(roundedAmount - amount, 10)
  }

  public async run() {
    // --- User 1: Savitha Sharma ---
    const savitha = await User.create({
      fullName: 'Savitha Sharma',
      email: 'savitha@example.com',
      password: 'password',
    })

    const savithaWallet = await Wallet.create({ userId: savitha.id, balance: 0 })
    const savithaCategories = await Category.createMany([
      { userId: savitha.id, name: 'Food' },
      { userId: savitha.id, name: 'Transport' },
      { userId: savitha.id, name: 'Shopping' },
      { userId: savitha.id, name: 'Utilities' },
      { userId: savitha.id, name: 'Entertainment' },
    ])
    const savithaModes = await Mode.createMany([
      { userId: savitha.id, name: 'UPI' },
      { userId: savitha.id, name: 'Cash' },
      { userId: savitha.id, name: 'Card' },
    ])

    // --- User 2: Anika Desai ---
    const anika = await User.create({
      fullName: 'Anika Desai',
      email: 'anika@example.com',
      password: 'password',
    })
    const anikaWallet = await Wallet.create({ userId: anika.id, balance: 0 })
    const anikaCategories = await Category.createMany([
      { userId: anika.id, name: 'Groceries' },
      { userId: anika.id, name: 'Bills' },
      { userId: anika.id, name: 'Travel' },
      { userId: anika.id, name: 'Personal Care' },
    ])
    const anikaModes = await Mode.createMany([
      { userId: anika.id, name: 'Net Banking' },
      { userId: anika.id, name: 'Card' },
    ])

    // --- User 3: Rohan Verma ---
    const rohan = await User.create({
      fullName: 'Rohan Verma',
      email: 'rohan@example.com',
      password: 'password',
    })
    const rohanWallet = await Wallet.create({ userId: rohan.id, balance: 0 })
    const rohanCategories = await Category.createMany([
      { userId: rohan.id, name: 'Fuel' },
      { userId: rohan.id, name: 'Movies' },
      { userId: rohan.id, name: 'Electronics' },
      { userId: rohan.id, name: 'Subscriptions' },
    ])
    const rohanModes = await Mode.createMany([
      { userId: rohan.id, name: 'Credit Card' },
      { userId: rohan.id, name: 'UPI' },
    ])

    // --- Generate Expenses for the last 45 days ---
    const expensesToCreate: Partial<Expense>[] = []
    let savithaTotalSavings = 0
    let anikaTotalSavings = 0
    let rohanTotalSavings = 0

    for (let i = 0; i < 45; i++) {
      const date = DateTime.now().minus({ days: i })

      // Savitha's daily expenses
      for (let j = 0; j < Math.floor(Math.random() * 4) + 1; j++) {
        const amount = Math.random() > 0.95 ? Math.random() * 2000 + 5000 : Math.random() * 4800 + 50
        const savings = this.calculateSavings(amount)
        savithaTotalSavings += savings
        expensesToCreate.push({
          userId: savitha.id,
          amount: parseFloat(amount.toFixed(2)),
          savingsAmount: parseFloat(savings.toFixed(2)),
          description: `Daily expense item #${i}-${j}`,
          date: date,
          categoryId: savithaCategories[Math.floor(Math.random() * savithaCategories.length)].id,
          modeId: savithaModes[Math.floor(Math.random() * savithaModes.length)].id,
        })
      }

      // Anika's daily expenses
      for (let k = 0; k < Math.floor(Math.random() * 3) + 1; k++) {
        const amount = Math.random() > 0.98 ? Math.random() * 3000 + 5000 : Math.random() * 4500 + 100
        const savings = this.calculateSavings(amount)
        anikaTotalSavings += savings
        expensesToCreate.push({
          userId: anika.id,
          amount: parseFloat(amount.toFixed(2)),
          savingsAmount: parseFloat(savings.toFixed(2)),
          description: `Purchase on day ${i}`,
          date: date,
          categoryId: anikaCategories[Math.floor(Math.random() * anikaCategories.length)].id,
          modeId: anikaModes[Math.floor(Math.random() * anikaModes.length)].id,
        })
      }

      // Rohan's daily expenses
      for (let l = 0; l < Math.floor(Math.random() * 3) + 1; l++) {
        const amount = Math.random() > 0.96 ? Math.random() * 4000 + 5000 : Math.random() * 4900 + 80
        const savings = this.calculateSavings(amount)
        rohanTotalSavings += savings
        expensesToCreate.push({
          userId: rohan.id,
          amount: parseFloat(amount.toFixed(2)),
          savingsAmount: parseFloat(savings.toFixed(2)),
          description: `Gadget or outing ${i}`,
          date: date,
          categoryId: rohanCategories[Math.floor(Math.random() * rohanCategories.length)].id,
          modeId: rohanModes[Math.floor(Math.random() * rohanModes.length)].id,
        })
      }
    }

    // Use a transaction to bulk-insert expenses and update all wallets
    await db.transaction(async (trx) => {
      await Expense.createMany(expensesToCreate, { client: trx })

      savithaWallet.useTransaction(trx).balance = parseFloat(savithaTotalSavings.toFixed(2))
      await savithaWallet.save()

      anikaWallet.useTransaction(trx).balance = parseFloat(anikaTotalSavings.toFixed(2))
      await anikaWallet.save()

      rohanWallet.useTransaction(trx).balance = parseFloat(rohanTotalSavings.toFixed(2))
      await rohanWallet.save()
    })
  }
}