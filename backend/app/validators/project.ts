import vine from '@vinejs/vine'

export interface CreateProjectData {
  name: string
  description?: string | null
  status?: string | null
  startDate?: string | null
  endDate?: string | null
  members?: number[]
  tags?: Array<{
    name: string
    color: string
    icon?: string
  }>
}

export interface UpdateProjectData {
  name?: string
  description?: string | null
  status?: 'active' | 'completed' | 'archived' | 'on_hold'
  image?: string | null
  startDate?: string | null
  endDate?: string | null
  tags?: Array<{
    name: string
    color: string
    icon?: string
  }>
}

export const createProjectValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().nullable(),
    status: vine.string().optional().nullable(),
    startDate: vine.string().optional().nullable(),
    endDate: vine.string().optional().nullable(),
    members: vine.array(vine.number()).optional(),
    tags: vine
      .array(
        vine.object({
          name: vine.string(),
          color: vine.string(),
          icon: vine.string().optional(),
        })
      )
      .optional(),
  })
)

export const updateProjectValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    description: vine.string().optional(),
    status: vine.enum(['active', 'completed', 'archived', 'on_hold']).optional(),
    image: vine.string().optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
    tags: vine
      .array(
        vine.object({
          name: vine.string(),
          color: vine.string(),
          icon: vine.string().optional(),
        })
      )
      .optional(),
  })
)
