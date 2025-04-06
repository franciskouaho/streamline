import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'team_invitations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email').notNullable()
      table.string('name').nullable()
      table.string('role').defaultTo('member')
      table.integer('invited_by').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').nullable()
      table.string('status').defaultTo('pending')
      table.timestamp('expires_at').nullable()
      table.string('token').unique().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
