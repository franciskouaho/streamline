/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth')
const ProjectsController = () => import('#controllers/projects')
const TasksController = () => import('#controllers/tasks')
const CommentsController = () => import('#controllers/comments')
const NotificationsController = () => import('#controllers/notifications')
const ProjectMembersController = () => import('#controllers/project_members')
const TeamInvitationsController = () => import('#controllers/team_invitations')
const TeamMembersController = () => import('#controllers/team_members')

router.get('/', async ({ response }) => response.ok({ uptime: process.uptime() }))
router.get('/health', ({ response }) => response.noContent())

router
  .group(() => {
    // Routes publiques (sans authentification)
    router.post('/auth/login', [AuthController, 'login'])
    router.post('/auth/register', [AuthController, 'register'])

    // Routes protégées (avec authentification)
    router
      .group(() => {
        router.get('/auth/me', [AuthController, 'me'])
        router.post('/auth/logout', [AuthController, 'logout'])
        router.put('/auth/update', [AuthController, 'update'])
        router.delete('/auth/me', [AuthController, 'deleteAccount'])

        // Protected routes
        router
          .group(() => {
            // Projects routes
            router
              .group(() => {
                // Special project routes (must be before the route with parameter :id)
                router.get('/stats', [ProjectsController, 'stats'])
                router.get('/timeline', [ProjectsController, 'timeline'])
                router.get('/progress', [ProjectsController, 'stats'])

                // CRUD project routes
                router.get('/', [ProjectsController, 'index'])
                router.post('/', [ProjectsController, 'store'])
                router.get('/:id', [ProjectsController, 'show'])
                router.put('/:id', [ProjectsController, 'update'])
                router.delete('/:id', [ProjectsController, 'destroy'])

                // Project members routes
                router.post('/:projectId/members', [ProjectMembersController, 'store'])
                router.put('/:projectId/members/:id', [ProjectMembersController, 'updateMember'])
                router.delete('/:projectId/members/:id', [ProjectMembersController, 'removeMember'])

                // Ajouter ces routes à l'intérieur du groupe protégé par auth
                router.get('/debug/memberships', [ProjectMembersController, 'debug'])
                router.get('/:projectId/members', [ProjectMembersController, 'index'])
              })
              .prefix('/projects')

            // Tasks routes
            router
              .group(() => {
                router.get('/', [TasksController, 'index'])
                router.post('/', [TasksController, 'store'])
                router.get('/:id', [TasksController, 'show'])
                router.put('/:id', [TasksController, 'update'])
                router.delete('/:id', [TasksController, 'destroy'])
              })
              .prefix('/tasks')

            // Comments routes
            router
              .group(() => {
                router.get('/', [CommentsController, 'index'])
                router.post('/', [CommentsController, 'store'])
                router.get('/:id', [CommentsController, 'show'])
                router.put('/:id', [CommentsController, 'update'])
                router.delete('/:id', [CommentsController, 'destroy'])
              })
              .prefix('/comments')

            // Notifications routes
            router
              .group(() => {
                router.get('/', [NotificationsController, 'index'])
                router.put('/:id/read', [NotificationsController, 'markAsRead'])
                router.delete('/:id', [NotificationsController, 'destroy'])
                router.post('/mark-all-read', [NotificationsController, 'markAllAsRead'])
              })
              .prefix('/notifications')

            // Notification settings routes
            router.get('/notification-settings/:id?', '#controllers/notification_settings.show')
            router.put('/notification-settings/:id?', '#controllers/notification_settings.update')

            // Device tokens route
            router.post('/device-tokens', '#controllers/device_tokens.store')

            // Team invitations routes
            router
              .group(() => {
                router.get('/', [TeamInvitationsController, 'index'])
                router.post('/', [TeamInvitationsController, 'store'])
                router.get('/:id', [TeamInvitationsController, 'show'])
                router.post('/:id/accept', [TeamInvitationsController, 'accept'])
                router.post('/:id/decline', [TeamInvitationsController, 'decline'])
                router.post('/:id/resend', [TeamInvitationsController, 'resend'])
                router.delete('/:id', [TeamInvitationsController, 'destroy'])
              })
              .prefix('/team/invitations')

            // Team members routes
            router
              .group(() => {
                router.get('/', [TeamMembersController, 'index'])
                router.get('/:id', [TeamMembersController, 'show'])
                router.put('/:id', [TeamMembersController, 'update'])
                router.delete('/:id', [TeamMembersController, 'destroy'])
              })
              .prefix('/team/members')

            // Invite directly to the team
            router.post('/team/invite', [TeamInvitationsController, 'store'])
          })
          .use([middleware.auth()])
      })
      .use([middleware.auth()])
  })
  .prefix('/api/v1')
