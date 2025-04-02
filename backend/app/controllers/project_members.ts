import type { HttpContext } from '@adonisjs/core/http'
import { projectMemberValidator } from '#validators/project_member'
import ProjectMember from '#models/project_member'

export default class ProjectMembers {
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(projectMemberValidator)
    const member = await ProjectMember.create(data)
    await member.load('user')
    return response.created(member)
  }

  async update({ params, request, response }: HttpContext) {
    const member = await ProjectMember.findOrFail(params.id)
    const data = await request.validateUsing(projectMemberValidator)
    await member.merge(data).save()
    await member.load('user')
    return response.ok(member)
  }

  async destroy({ params, response }: HttpContext) {
    const member = await ProjectMember.findOrFail(params.id)
    await member.delete()
    return response.noContent()
  }
}
