import { Router } from 'express'
import HealthController from '@controllers/health-controller'
import Environment from '@/environment'
import authHandler from '@/middleware/auth-handler'
import AnalyticsController from './analytics-controller'

export default (environment: Environment): Router[] => {
  // auth layer
  const authMiddleware = authHandler(environment)

  const analyticsController = new AnalyticsController(environment.ecrfAnalytics)

  const authenticatedControllers = [analyticsController.router].map((controller) => {
    const router = Router()

    router.use(authMiddleware)
    router.use(controller)
    return router
  })

  return [new HealthController(environment).router, ...authenticatedControllers]
}
