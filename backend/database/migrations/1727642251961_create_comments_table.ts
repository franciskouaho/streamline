import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.text('content').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('task_id').unsigned().references('id').inTable('tasks').nullable()
      table.integer('project_id').unsigned().references('id').inTable('projects').nullable()
      table.json('attachments').nullable()
      table.integer('parent_comment_id').unsigned().references('id').inTable('comments').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
