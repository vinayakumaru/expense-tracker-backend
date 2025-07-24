import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('/', async () => {
  return { hello: 'world' }
})

// Authentication routes
router.group(() => {
    router.post('/register', '#controllers/auth_controller.register')
    router.post('/login', '#controllers/auth_controller.login')
    router.post('/logout', '#controllers/auth_controller.logout').use(middleware.auth())
  })
  .prefix('auth')

// Category and Mode routes (protected by auth middleware)
router.resource('categories', '#controllers/categories_controller').use('*', middleware.auth())
router.resource('modes', '#controllers/modes_controller').use('*', middleware.auth())

// Expense and Analytics routes
router
  .group(() => {
    router.get('/by-month', '#controllers/expenses_controller.getByMonth')
    router.get('/stats/daily-summary', '#controllers/expenses_controller.getDailySummary')
    router.get('/stats/category-summary', '#controllers/expenses_controller.getCategorySummary')
    router.resource('expenses', '#controllers/expenses_controller').apiOnly()
  })
  .use(middleware.auth())