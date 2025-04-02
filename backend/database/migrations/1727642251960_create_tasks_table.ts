import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.text('description').nullable()
      table
        .integer('project_id')
        .unsigned()
        .references('id')
        .inTable('projects')
        .onDelete('CASCADE')
      table.integer('assignee_id').unsigned().references('id').inTable('users').nullable()
      table.string('status').defaultTo('pending')
      table.string('priority').defaultTo('medium')
      table.date('due_date').nullable()
      table.integer('parent_task_id').unsigned().references('id').inTable('tasks').nullable()
      table.json('attachments').nullable()
      table.json('custom_fields').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('completed_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
