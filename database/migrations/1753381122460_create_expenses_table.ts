import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'expenses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Foreign Keys
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table.integer('category_id').unsigned().references('categories.id').onDelete('SET NULL')
      table.integer('mode_id').unsigned().references('modes.id').onDelete('SET NULL')

      // Expense Details
      table.double('amount').notNullable()
      table.double('savings_amount').notNullable()
      table.string('description').notNullable()
      table.dateTime('date').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}