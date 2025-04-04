import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notification_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .unique()
      table.boolean('task_assigned').defaultTo(true)
      table.boolean('task_deadline').defaultTo(true)
      table.boolean('task_comment').defaultTo(true)
      table.boolean('project_update').defaultTo(true)
      table.boolean('team_message').defaultTo(true)
      table.boolean('app_updates').defaultTo(true)
      table.boolean('subscription_alerts').defaultTo(true)
      table.boolean('quiet_hours_enabled').defaultTo(false)
      table.string('quiet_hours_start').defaultTo('22:00')
      table.string('quiet_hours_end').defaultTo('07:00')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
