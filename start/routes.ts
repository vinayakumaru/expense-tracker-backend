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
router.resource('categories', '#controllers/category_controller').use('*', middleware.auth())
router.resource('modes', '#controllers/mode_controller').use('*', middleware.auth())

// Expense and Analytics routes
router
  .group(() => {
    router.get('/by-month', '#controllers/expense_controller.getByMonth')
    router.get('/stats/daily-summary', '#controllers/expense_controller.getDailySummary')
    router.get('/stats/category-summary', '#controllers/expense_controller.getCategorySummary')
    router.resource('expenses', '#controllers/expense_controller').apiOnly()
  })
  .use(middleware.auth())