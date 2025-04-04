import vine from '@vinejs/vine'

export const profileValidator = vine.compile(
  vine.object({
    bio: vine.string().optional(),
    location: vine.string().optional(),
    website: vine.string().url().optional(),
    preferences: vine.object({}).optional(),
    socialLinks: vine.object({}).optional(),
  })
)
