import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.text('description').nullable()
      table.string('status').defaultTo('active')
      table.integer('owner_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.jsonb('tags').nullable()
      table.string('image').nullable()
      table.date('start_date').nullable()
      table.date('end_date').nullable()
      table.json('settings').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
